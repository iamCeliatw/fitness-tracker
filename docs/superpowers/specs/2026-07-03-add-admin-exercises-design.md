# add-admin-exercises 設計文件

日期：2026-07-03
狀態：設計已與用戶確認（含三項假設）

## 目標

補齊 `/admin/exercises` 404：admin sidebar 早有「動作庫」入口（spec 標示預留），頁面從未實作。提供動作庫的完整管理（列表、新增、編輯、刪除）。

## 方案（已確認：方案 A）

比照 `/admin/members` 既有 pattern：

- Server page：`requireRole("ADMIN")` + admin client 查詢 + `p-6 max-w-3xl mx-auto`
- Client manager 元件承接互動（`src/components/admin/`）
- 新開 `/api/admin/exercises` CRUD routes，不動 user-facing 的 `/api/exercises`（否決方案 B：在 user route 加 admin 分支，混合權限邏輯）

## 功能設計

### 列表
- 顯示全部動作（23 筆 seed + 會員自訂），每列：名稱、肌群、類別、自訂 badge
- 肌群 Tab 篩選 + 名稱搜尋（沿用動作選擇器的 UX pattern）
- `GET /api/admin/exercises`：回傳全部（含 `isCustom`、`createdById`）

### 新增（假設 1，已確認）
- Dialog 表單：名稱（必填）+ 肌群下拉（enum 9 值）+ 類別下拉（enum 4 值）+ 描述（選填）
- `POST /api/admin/exercises`：建立官方動作 `isCustom=false`，全組織可見

### 編輯
- 同款 Dialog 帶入現值 → `PATCH /api/admin/exercises/[id]`（名稱/肌群/類別/描述）
- （假設 3，已確認）會員自訂動作不開放編輯，僅可刪除（治理用途）

### 刪除（假設 2，已確認）
- AlertDialog 確認（比照 body-records 的刪除確認）
- `DELETE /api/admin/exercises/[id]`：先查 `WorkoutLogExercise` 與 `WorkoutPlanExercise` 是否引用；有引用 → 409 + 明確訊息（「此動作已被訓練記錄/計畫使用，無法刪除」），不做軟刪除

## 已知陷阱對策

- **shadcn/ui Base UI Select**：肌群/類別下拉 value 是 enum、label 是中文 → `Select.Root` 必須傳 `items`；`onValueChange` 參數型別 `string | null`
- 中文 label 對照沿用 workout 元件既有 mapping，不重寫
- DB insert 前確認 `Exercise` NOT NULL 欄位：`name`、`muscleGroup`、`category`、`createdAt`、`updatedAt`（`id` 需自給 `crypto.randomUUID()`，比照現有 route）

## 互動視覺規格

- 列表卡片：`transition-colors duration-150 hover:border-gray-700`
- 按鈕/連結：至少 `transition-colors`
- 空狀態：搜尋/篩選無結果時顯示灰字提示（`text-gray-500`），不留空白
- Dialog/AlertDialog 使用 shadcn 現成元件，無自訂動畫需求

## E2E 測試

- Happy path：admin 登入 → 新增動作 → 出現在列表 → 編輯名稱 → 更新可見 → 刪除 → 從列表消失
- Edge：刪除被引用的動作 → 顯示 409 錯誤訊息、動作仍在列表
- Edge：非 admin（member）訪問 `/admin/exercises` → 被導向 `/dashboard`
- 三規則：開場自癒（先刪掉殘留的測試動作名，如 `E2E 測試動作`）、locator 圈定在目標列（`.filter({ hasText })`）、auto-waiting 斷言

## 範圍

- 無 schema 變更（`Exercise` 現有欄位足夠）
- 無新 env var、無新 OrgRole
- 不動 `/api/exercises`（user-facing）與動作選擇器
