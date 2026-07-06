## ADDED Requirements

### Requirement: 動作庫管理頁
系統 SHALL 提供 `/admin/exercises` 頁面（僅 ADMIN 可存取），列出全部動作（官方 + 會員自訂），每列顯示名稱、肌群、類別；會員自訂動作標示「自訂」badge。頁面 SHALL 提供肌群 Tab 篩選與名稱搜尋。

#### Scenario: admin 檢視動作庫
- **WHEN** ADMIN 開啟 /admin/exercises
- **THEN** 顯示動作列表（含 seed 動作與會員自訂動作），自訂動作有「自訂」badge

#### Scenario: 肌群篩選與搜尋
- **WHEN** admin 選擇肌群 Tab 或輸入名稱關鍵字
- **THEN** 列表僅顯示符合條件的動作；無結果時顯示灰字空狀態提示

#### Scenario: 非 admin 存取被導走
- **WHEN** 非 ADMIN 用戶訪問 /admin/exercises
- **THEN** 被導向 /dashboard

### Requirement: 新增官方動作
系統 SHALL 允許 admin 透過 Dialog 表單（名稱必填、肌群、類別、描述選填）新增動作；經 `POST /api/admin/exercises` 建立 `isCustom=false` 的官方動作，全組織可見。

#### Scenario: 成功新增
- **WHEN** admin 填寫名稱與肌群後送出
- **THEN** 動作出現在列表中，且會員端動作選擇器可見該動作

#### Scenario: 名稱空白驗證
- **WHEN** admin 未填名稱送出
- **THEN** 顯示驗證錯誤，不建立動作

### Requirement: 編輯動作
系統 SHALL 允許 admin 編輯官方動作的名稱/肌群/類別/描述（`PATCH /api/admin/exercises/[id]`）。會員自訂動作（`isCustom=true`）不開放編輯，PATCH SHALL 回 403。

#### Scenario: 編輯官方動作
- **WHEN** admin 修改官方動作名稱並儲存
- **THEN** 列表顯示更新後的名稱

#### Scenario: 自訂動作不可編輯
- **WHEN** 對 `isCustom=true` 的動作發出 PATCH
- **THEN** 回傳 403

### Requirement: 刪除動作（含引用保護）
系統 SHALL 允許 admin 經 AlertDialog 確認後刪除動作（`DELETE /api/admin/exercises/[id]`）。若動作被 `WorkoutLogExercise` 或 `WorkoutPlanExercise` 引用，SHALL 回 409 並顯示「此動作已被訓練記錄或計畫使用，無法刪除」，動作保留。

#### Scenario: 刪除未引用動作
- **WHEN** admin 確認刪除一個未被任何訓練記錄/計畫引用的動作
- **THEN** 動作從列表消失

#### Scenario: 刪除被引用動作被擋下
- **WHEN** admin 嘗試刪除已被訓練記錄引用的動作
- **THEN** 回傳 409，顯示錯誤訊息，動作仍在列表中

#### Scenario: 非 admin 呼叫 API
- **WHEN** 非 ADMIN 用戶呼叫任一 /api/admin/exercises 端點
- **THEN** 回傳 403
