# Phase 2 Design：教練預約系統 + Audit Log + 教練 Dashboard

**日期：** 2026-06-30
**分支：** feat/phase-2-coach-booking
**狀態：** 已確認，待實作

---

## 目標

將健身平台升級為商業級 SaaS 原型，新增：
1. 教練排課 + 學員預約（防重疊衝突偵測）
2. Supabase DB Trigger 自動寫入稽核 Log
3. 教練 Dashboard（學員進度 + 本週行程）

---

## 資料模型

### 新增 Models

```prisma
model AppointmentSlot {
  id        String   @id @default(cuid())
  startTime DateTime
  endTime   DateTime
  status    String   @default("OPEN") // OPEN | BOOKED | CANCELLED
  createdAt DateTime @default(now())

  coachId String
  coach   User         @relation("CoachSlots", fields: [coachId], references: [id])
  orgId   String
  org     Organization @relation(fields: [orgId], references: [id])

  appointment Appointment?
}

model Appointment {
  id          String    @id @default(cuid())
  status      String    @default("CONFIRMED") // CONFIRMED | CANCELLED
  notes       String?
  createdAt   DateTime  @default(now())
  cancelledAt DateTime?

  slotId    String          @unique
  slot      AppointmentSlot @relation(fields: [slotId], references: [id])
  studentId String
  student   User            @relation("StudentAppointments", fields: [studentId], references: [id])
  coachId   String
  coach     User            @relation("CoachAppointments", fields: [coachId], references: [id])
  orgId     String
  org       Organization    @relation(fields: [orgId], references: [id])
}

model AuditLog {
  id        String   @id @default(cuid())
  table     String
  recordId  String
  operation String   // INSERT | UPDATE | DELETE
  oldData   Json?
  newData   Json?
  actorId   String?
  createdAt DateTime @default(now())
}
```

### 修改現有 Model

```prisma
model Organization {
  // 新增欄位
  bookingCutoffHours Int @default(2)
}
```

---

## 預約流程

### 角色

- **COACH**（`OrganizationMember.role === COACH`）：建立/刪除時段
- **MEMBER**（`OrganizationMember.role === MEMBER`）：瀏覽/預約/取消

身份檢查透過新增至 `src/lib/auth-helpers.ts` 的 `requireOrgRole(role)` helper 實作，邏輯與現有 `requireRole()` 相同，改查 `OrganizationMember` 表。

### 流程

```
Coach → POST /api/slots          建立可用時段（含教練重疊檢查）
Student → GET /api/slots         列出 OPEN 時段
Student → POST /api/appointments 預約（含學員重疊檢查 + 截止時間檢查）
                                   → Slot.status = BOOKED
Coach/Student → DELETE /api/appointments/[id]  取消
                                   → Slot.status = OPEN
```

### 衝突偵測規則

| 操作 | 檢查條件 |
|------|----------|
| Coach 建時段 | 同教練有時間重疊的 OPEN/BOOKED slot |
| Student 預約 | 同學員有時間重疊的 CONFIRMED appointment |
| Student 預約 | `slot.startTime < now() + org.bookingCutoffHours * 1hour` |

---

## API 設計

| Method | Path | 身份 | 說明 |
|--------|------|------|------|
| GET | `/api/slots` | COACH/MEMBER | 列出 org 內可用時段 |
| POST | `/api/slots` | COACH | 建立時段 |
| DELETE | `/api/slots/[id]` | COACH | 刪除時段（需為 OPEN；BOOKED 的時段須先取消 Appointment 才能刪） |
| GET | `/api/appointments` | COACH/MEMBER | 列出我的預約 |
| POST | `/api/appointments` | MEMBER | 預約時段 |
| DELETE | `/api/appointments/[id]` | COACH/MEMBER | 取消預約 |

---

## Audit Log（Supabase DB Trigger）

### PostgreSQL Function

```sql
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog" (id, table, "recordId", operation, "oldData", "newData", "actorId", "createdAt")
  VALUES (
    gen_random_uuid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END,
    current_setting('app.current_user_id', true),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Triggers

掛在三張表：`Appointment`、`AppointmentSlot`、`WorkoutLog`

### actorId 注入

每個 API route 在執行 DB 操作前：

```ts
await supabase.rpc('set_config', {
  setting: 'app.current_user_id',
  value: session.user.id,
  is_local: true
})
```

---

## 路由

| 路由 | 身份 | 說明 |
|------|------|------|
| `/dashboard/booking` | MEMBER | 瀏覽可預約時段 + 我的預約記錄 |
| `/dashboard/coach` | COACH | 學員進度 + 本週行程 |
| `/admin/audit-logs` | ADMIN | 稽核 log 列表（分頁） |
| `/admin/settings` | ADMIN | Org 設定（bookingCutoffHours） |

---

## UI 互動規格

| 元件 | 規格 |
|------|------|
| 學員卡片 | `hover:border-gray-700 transition-colors duration-150` |
| 行程時段 | 已過時間顯示灰色，今日時段高亮 |
| Audit log 列展開 | `grid-rows-[0fr]/[1fr] transition-all duration-200` |
| 預約按鈕（截止後） | disabled + tooltip「距開課不足 N 小時，無法預約」 |
| 空狀態 | 學員列表、行程、audit log 三區塊各有獨立空狀態文案 |

---

## 教練 Dashboard 版面

```
┌─────────────────────────────────────────────────────┐
│  教練總覽                                            │
├──────────────────────────┬──────────────────────────┤
│  我的學員                │  本週行程                │
│  ─────────────────────   │  ─────────────────────   │
│  [頭像] 王小明           │  週一 10:00  王小明      │
│    本週訓練 3 次         │  週二 14:00  李大華      │
│    飲食達標 5/7 天       │  週四 09:00  張美玲      │
│                          │                          │
│  [頭像] 李大華           │  [+ 新增時段]            │
│    本週訓練 1 次         │                          │
│    飲食達標 2/7 天       │                          │
└──────────────────────────┴──────────────────────────┘
```

資料來源：
- 學員列表：`CoachStudent` where `coachId = me`
- 本週訓練次數：`WorkoutLog` count（過去 7 天）
- 飲食達標天數：`FoodEntry` distinct dates（過去 7 天）
- 本週行程：`AppointmentSlot` where `coachId = me`，本週範圍

---

## Phase 2 範圍總結

- **3 個新 model**：`AppointmentSlot`、`Appointment`、`AuditLog`
- **1 個 schema 欄位**：`Organization.bookingCutoffHours`
- **4 個新路由**：`/dashboard/booking`、`/dashboard/coach`、`/admin/audit-logs`、`/admin/settings`
- **6 支新 API**：slots × 3 + appointments × 3
- **1 組 DB Trigger**：PostgreSQL function 掛三張表
