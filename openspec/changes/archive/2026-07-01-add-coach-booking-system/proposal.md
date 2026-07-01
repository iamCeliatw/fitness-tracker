## Why

健身平台需要升級為商業級 SaaS 原型，以鎖定 Upwork 上 Supabase 相關職缺。Phase 2 引入教練預約管理、資料稽核追蹤、以及教練監看學員進度的 Dashboard，使平台從個人工具轉型為多角色協作系統。

## What Changes

- 新增 `AppointmentSlot` model：教練建立可預約時段
- 新增 `Appointment` model：學員預約時段（含防重疊衝突偵測與截止時間規則）
- 新增 `AuditLog` model：透過 Supabase PostgreSQL Trigger 自動記錄 INSERT/UPDATE/DELETE
- `Organization` 新增 `bookingCutoffHours` 欄位（預設 2 小時）
- 新增 `/dashboard/booking`：學員預約頁
- 新增 `/dashboard/coach`：教練 Dashboard（學員進度 + 本週行程）
- 新增 `/admin/audit-logs`：管理員查看稽核紀錄
- 新增 `/admin/settings`：Org 設定（調整截止時間）
- 新增 `requireOrgRole()` helper（`src/lib/auth-helpers.ts`）

## Capabilities

### New Capabilities

- `appointment-slots`: 教練建立、管理可預約時段（OPEN/BOOKED/CANCELLED 狀態流轉）
- `appointment-booking`: 學員瀏覽並預約時段，含衝突偵測與截止時間驗證
- `audit-log`: Supabase DB Trigger 自動將三張表的異動寫入 AuditLog，管理員可查閱
- `coach-dashboard`: 教練查看所屬學員本週訓練/飲食進度及本週預約行程

### Modified Capabilities

（無既有 spec 需要修改）

## Impact

- **Schema**：新增 3 model，修改 1 model（`Organization`）
- **API**：新增 6 支 route（`/api/slots` × 3、`/api/appointments` × 3）
- **Auth helpers**：`src/lib/auth-helpers.ts` 新增 `requireOrgRole()`
- **DB**：Supabase SQL Editor 執行 trigger function + 3 個 trigger
- **路由**：新增 4 個頁面路由
