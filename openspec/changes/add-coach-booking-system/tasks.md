## 1. Schema 變更

- [x] 1.1 在 `prisma/schema.prisma` 新增 `AppointmentSlot` model
- [x] 1.2 在 `prisma/schema.prisma` 新增 `Appointment` model
- [x] 1.3 在 `prisma/schema.prisma` 新增 `AuditLog` model
- [x] 1.4 在 `Organization` model 新增 `bookingCutoffHours Int @default(2)`
- [x] 1.5 在 `User` model 新增 `AppointmentSlot`、`Appointment`（coach/student）的 relation fields
- [ ] 1.6 透過 `prisma migrate diff` 產生 SQL，在 Neon SQL Editor 執行
- [x] 1.7 執行 `npx prisma generate` 更新 client types

## 2. Supabase Audit Trigger

- [x] 2.1 在 Neon SQL Editor 建立 `audit_trigger_fn()` PostgreSQL function
- [x] 2.2 對 `Appointment` 表建立 `audit_appointments` trigger
- [x] 2.3 對 `AppointmentSlot` 表建立 `audit_slots` trigger
- [x] 2.4 對 `WorkoutLog` 表建立 `audit_workout_logs` trigger
- [x] 2.5 在 `src/lib/supabase-helpers.ts`（或 `auth-helpers.ts`）新增 `setAuditActor(userId)` utility function

## 3. Auth Helper

- [x] 3.1 在 `src/lib/auth-helpers.ts` 新增 `requireOrgRole(role: OrgRole)` helper，查詢 `OrganizationMember` 驗證 OrgRole

## 4. API Routes — Slots

- [x] 4.1 建立 `src/app/api/slots/route.ts`：GET（列出 org 的 OPEN slots）+ POST（教練建立時段，含重疊檢查）
- [x] 4.2 建立 `src/app/api/slots/[id]/route.ts`：DELETE（刪除 OPEN slot，BOOKED 回傳 409）
- [x] 4.3 POST `/api/slots` 呼叫 `setAuditActor()` 後再寫 DB

## 5. API Routes — Appointments

- [x] 5.1 建立 `src/app/api/appointments/route.ts`：GET（我的預約）+ POST（學員預約，含衝突/截止時間檢查）
- [x] 5.2 建立 `src/app/api/appointments/[id]/route.ts`：DELETE（取消預約，回寫 Slot.status = OPEN）
- [x] 5.3 POST/DELETE 均呼叫 `setAuditActor()` 後再寫 DB

## 6. 學員預約頁（`/dashboard/booking`）

- [x] 6.1 建立 `src/app/dashboard/booking/page.tsx`：列出可預約的 OPEN slots
- [x] 6.2 建立預約按鈕元件，截止時間內顯示 disabled + tooltip
- [x] 6.3 建立「我的預約」列表（CONFIRMED 的 Appointments）+ 取消按鈕
- [x] 6.4 加入空狀態：無可預約時段、無預約記錄各自獨立文案

## 7. 教練 Dashboard（`/dashboard/coach`）

- [x] 7.1 建立 `src/app/dashboard/coach/page.tsx`，頂層呼叫 `requireOrgRole("COACH")`
- [x] 7.2 建立學員進度卡片元件：顯示本週訓練次數、飲食達標天數
- [x] 7.3 建立本週行程面板：顯示本週 AppointmentSlots + 預約學員名稱
- [x] 7.4 本週行程面板加入「+ 新增時段」按鈕（觸發新增 Slot 表單）
- [x] 7.5 加入空狀態：無學員、無本週行程各自獨立文案

## 8. 管理後台

- [x] 8.1 建立 `src/app/admin/settings/page.tsx`：顯示並更新 `bookingCutoffHours`
- [x] 8.2 建立 `src/app/api/admin/settings/route.ts`：GET + PATCH（需 ADMIN role）
- [x] 8.3 建立 `src/app/admin/audit-logs/page.tsx`：分頁列表（每頁 20 筆）+ table 篩選
- [x] 8.4 建立 `src/app/api/admin/audit-logs/route.ts`：GET（支援 table filter + pagination）
- [x] 8.5 Audit log 列點擊展開 oldData/newData JSON（`grid-rows-[0fr]/[1fr]` 動畫）

## 9. E2E 測試

- [x] 9.1 `tests/e2e/appointment-slots.spec.ts`：教練建立時段 happy path + 重疊時段 409
- [x] 9.2 `tests/e2e/appointment-booking.spec.ts`：學員預約 happy path + 截止時間拒絕 + 取消預約
- [x] 9.3 `tests/e2e/audit-log.spec.ts`：預約操作後 admin 查看 audit log 有對應紀錄
- [x] 9.4 `tests/e2e/coach-dashboard.spec.ts`：教練看到學員進度 + 本週行程；非教練重導向
