## Why

Admin sidebar 的「動作庫」入口（`/admin/exercises`）自 admin 後台建立以來一直是預留狀態，管理員點擊會直接 404。動作庫目前只能靠 seed script 或會員自訂新增，管理員無法維護官方動作內容。

## What Changes

- 新增 `/admin/exercises` 頁面：動作庫列表（seed + 會員自訂）、肌群 Tab 篩選 + 名稱搜尋
- 新增動作：Dialog 表單（名稱/肌群/類別/描述），admin 建立的為官方動作（`isCustom=false`）
- 編輯動作：官方動作可編輯全欄位；會員自訂動作不開放編輯
- 刪除動作：AlertDialog 確認；被 `WorkoutLogExercise` 或 `WorkoutPlanExercise` 引用的動作擋下（409），會員自訂動作可由 admin 刪除（治理）
- 新增 API：`GET/POST /api/admin/exercises`、`PATCH/DELETE /api/admin/exercises/[id]`（ADMIN 限定）

## Capabilities

### New Capabilities
- `admin-exercise-management`: 管理員動作庫管理頁（列表/篩選/搜尋/新增/編輯/刪除）與對應 admin CRUD API

### Modified Capabilities
- `admin-sidebar`: 導覽項目「動作庫」由預留改為正式功能（需求文字移除「預留」註記）

## Impact

- **頁面/元件**：新增 `src/app/admin/exercises/page.tsx`（比照 members page pattern：`requireRole("ADMIN")` + server 查詢）、`src/components/admin/` 下新增 exercises manager 元件
- **API**：新增 `src/app/api/admin/exercises/route.ts` 與 `[id]/route.ts`；**不動** user-facing `/api/exercises` 與動作選擇器
- **DB**：無 schema 變更（`Exercise` 現有欄位足夠）
- **測試**：新增 E2E spec（admin CRUD happy path + 刪除被引用動作 409 + 非 admin 導走）

設計文件：`docs/superpowers/specs/2026-07-03-add-admin-exercises-design.md`（已與用戶確認）
