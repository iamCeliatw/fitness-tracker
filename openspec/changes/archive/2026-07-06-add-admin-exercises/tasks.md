## 1. Admin API

- [x] 1.1 `GET/POST /api/admin/exercises`：列出全部動作（含 isCustom/createdById）；新增官方動作（`isCustom=false`，zod 驗證名稱必填、肌群/類別 enum），ADMIN 權限檢查比照既有 `/api/admin/*` routes
- [x] 1.2 `PATCH/DELETE /api/admin/exercises/[id]`：編輯（`isCustom=true` 回 403）；刪除前平行查 `WorkoutLogExercise`/`WorkoutPlanExercise` 引用，有引用回 409

## 2. Admin 頁面與元件

- [x] 2.1 `src/app/admin/exercises/page.tsx`：`requireRole("ADMIN")` + server 查詢全部動作，props 傳 client manager（比照 members page，`p-6 max-w-3xl mx-auto`）
- [x] 2.2 Exercises manager 元件：列表（名稱/肌群/類別/自訂 badge）+ 肌群 Tab 篩選 + 名稱搜尋 + 空狀態提示，卡片 hover transition 依 design.md
- [x] 2.3 新增/編輯 Dialog：名稱 + 肌群/類別下拉（`Select.Root` 傳 `items`，中文 label 沿用既有 mapping）+ 描述，編輯帶入現值，自訂動作無編輯按鈕
- [x] 2.4 刪除 AlertDialog：確認後呼叫 DELETE，409 時顯示錯誤訊息（動作保留在列表）

## 3. E2E 測試

- [x] 3.1 Happy path：admin 登入 → 新增「E2E 測試動作」→ 列表可見 → 編輯名稱 → 更新可見 → 刪除 → 消失（開場先清除殘留的測試動作，自癒設計）
- [x] 3.2 Edge：刪除被訓練記錄引用的動作 → 顯示錯誤、動作仍在列表（用 seed 動作中已被 E2E workout 測試引用者，或於測試內先建立引用）
- [x] 3.3 Edge：非 admin（member）訪問 /admin/exercises → 導向 /dashboard
- [x] 3.4 `npm run test:e2e` headless 全綠後才打勾本群組
