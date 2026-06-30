## Context

健身平台已完成 Phase 1（Supabase Auth + 基礎 CRUD），現有 `Organization`、`OrganizationMember`、`CoachStudent` schema 但尚未被使用。Phase 2 在此基礎上實作預約系統、稽核 log、教練 Dashboard，使多角色協作流程完整閉環。

本機環境封鎖 port 5432/6543，所有 runtime 查詢透過 Supabase JS client（HTTPS）；Schema 變更透過 Supabase Dashboard SQL Editor 手動執行。

## Goals / Non-Goals

**Goals:**
- 教練可建立可用時段，學員可從中選擇預約
- 衝突偵測：防止同教練時段重疊、同學員預約重疊、超過截止時間的預約
- Supabase DB Trigger 在不修改 API code 的情況下自動寫入 AuditLog
- 教練 Dashboard 顯示學員本週進度與本週行程
- 管理員可查閱稽核紀錄與設定 Org 預約截止時間

**Non-Goals:**
- 週期性時段自動產生（Phase 3）
- 推播通知或 Email 提醒
- 付款/訂閱流程（Phase 3）
- 行事曆匯出（iCal/Google Calendar）

## Decisions

### 1. 使用 Supabase DB Trigger 而非 API 層 middleware 寫入 AuditLog

**選擇：** PostgreSQL trigger function（`SECURITY DEFINER`）掛在三張目標 table 上

**理由：** Trigger 不依賴 API route 是否正確呼叫 log function，保證 100% 覆蓋率；且 `actorId` 透過 `current_setting('app.current_user_id', true)` 從 API route 注入，不需要改動每個 CRUD function 的簽名。

**捨棄方案：** API middleware 埋點（每個 route 需手動呼叫，容易漏掉）

### 2. 簡單時段制（非週期可用時間制）

**選擇：** 教練手動建立個別 `AppointmentSlot`，學員從 OPEN 清單選擇

**理由：** Phase 2 portfolio demo 需要展示清楚的核心概念（衝突偵測、狀態機），週期排程需要 cron job 或複雜計算邏輯，超出本階段範圍。

**捨棄方案：** 週期可用時間制（Coach 設定每週可用時段，系統自動產生）

### 3. 以 OrgRole 判斷教練身份，不新增全域 Role

**選擇：** `OrganizationMember.role === "COACH"` 判斷，新增 `requireOrgRole()` helper

**理由：** 全域 `Role` enum 已有 USER/ADMIN，新增 COACH 會影響 middleware 邏輯與既有路由保護；OrgRole 是 scoped 角色，符合多租戶 SaaS 設計。

### 4. bookingCutoffHours 存在 Organization 層級

**選擇：** `Organization.bookingCutoffHours Int @default(2)`，管理員可在 `/admin/settings` 調整

**理由：** 不同 Org 可能有不同規定（健身房 vs 私人教練），SaaS 平台應給租戶自行設定的彈性。

## Risks / Trade-offs

- **actorId 可能為 null**：若 API route 忘記呼叫 `set_config`，trigger 寫入的 `actorId` 為 null → Mitigation：實作 `setAuditActor()` utility function 統一呼叫，code review checklist 加入此項
- **Supabase JS client 不支援多步驟交易**：Appointment 建立後需同步更新 Slot.status，需用序列 update + 錯誤補償（同現有 workout log 做法）
- **Supabase trigger 的 `table` 欄位為 DB table 名**：Prisma 預設 table 名與 model 名相同，但若日後加 `@@map` 會 mismatch → 目前可接受，日後加 `@@map` 時需同步更新 trigger

## Migration Plan

1. 修改 `prisma/schema.prisma`（新增 3 model + 1 欄位）
2. 手動撰寫 migration SQL，在 Supabase Dashboard SQL Editor 執行
3. 在 Supabase SQL Editor 建立 `audit_trigger_fn` function + 3 個 trigger
4. `npx prisma generate` 更新 client types
5. 部署至 Vercel（無需特殊 migration flag）

**Rollback：** 刪除 trigger → 刪除新 table（AuditLog、Appointment、AppointmentSlot）→ 移除 `bookingCutoffHours` 欄位

## Open Questions

- 教練取消預約時，是否需要通知學員？（目前 Phase 2 不做通知，Phase 3 補上）
- AuditLog 保留期限？（目前無 TTL，未來可加 pg_cron 定期清理）
