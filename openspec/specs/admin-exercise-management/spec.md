## ADDED Requirements

### Requirement: 動作庫管理頁
系統 SHALL 提供 `/admin/exercises` 頁面（org-ADMIN 以上，或全域 ADMIN 可存取），每列顯示名稱、肌群、類別。org 管理者看到全域內建動作（標示灰色「內建」badge，唯讀）與本館自訂動作（可操作）；全域 ADMIN 看到全域動作與會員自訂動作（自訂動作標示「自訂」badge）。頁面 SHALL 提供肌群 Tab 篩選與名稱搜尋。

#### Scenario: org 管理者檢視動作庫
- **WHEN** OWNER 或 org-ADMIN 開啟 /admin/exercises
- **THEN** 顯示全域內建動作（「內建」badge、無編輯/刪除按鈕）與本館自訂動作（有操作按鈕），不含其他館的動作

#### Scenario: admin 檢視動作庫
- **WHEN** 全域 ADMIN 開啟 /admin/exercises
- **THEN** 顯示動作列表（含 seed 動作與會員自訂動作），自訂動作有「自訂」badge

#### Scenario: 肌群篩選與搜尋
- **WHEN** 管理者選擇肌群 Tab 或輸入名稱關鍵字
- **THEN** 列表僅顯示符合條件的動作；無結果時顯示灰字空狀態提示

#### Scenario: 無權限存取被導走
- **WHEN** 非 org-ADMIN 以上且非全域 ADMIN 的用戶訪問 /admin/exercises
- **THEN** 被導向 /dashboard

### Requirement: 新增官方動作
系統 SHALL 允許管理者透過 Dialog 表單（名稱必填、肌群、類別、描述選填）新增動作（`POST /api/admin/exercises`，`isCustom=false`）。org 管理者建立的動作 SHALL 由 server 掛上本館 `orgId`（僅本館可見）；全域 ADMIN 建立的動作 `orgId=null`（全平台可見）。

#### Scenario: org 管理者成功新增
- **WHEN** OWNER 或 org-ADMIN 填寫名稱與肌群後送出
- **THEN** 動作以 `orgId=本館` 建立並出現在列表中，本館會員的動作選擇器可見該動作，其他館不可見

#### Scenario: 成功新增
- **WHEN** 全域 ADMIN 填寫名稱與肌群後送出
- **THEN** 動作以 `orgId=null` 建立並出現在列表中，且所有會員的動作選擇器可見該動作

#### Scenario: 名稱空白驗證
- **WHEN** 管理者未填名稱送出
- **THEN** 顯示驗證錯誤，不建立動作

### Requirement: 編輯動作
系統 SHALL 允許管理者編輯動作的名稱/肌群/類別/描述（`PATCH /api/admin/exercises/[id]`）。org 管理者僅能編輯本館動作（`orgId=本館`），對全域動作或其他館動作的 PATCH SHALL 回 403；全域 ADMIN 僅能編輯全域動作（`orgId=null, isCustom=false`）。會員自訂動作（`isCustom=true`）不開放編輯，PATCH SHALL 回 403。

#### Scenario: 編輯本館動作
- **WHEN** OWNER 或 org-ADMIN 修改本館動作名稱並儲存
- **THEN** 列表顯示更新後的名稱

#### Scenario: org 管理者改全域動作被拒
- **WHEN** OWNER 或 org-ADMIN 對全域內建動作發出 PATCH
- **THEN** 回傳 403，動作不變

#### Scenario: 編輯官方動作
- **WHEN** 全域 ADMIN 修改全域動作名稱並儲存
- **THEN** 列表顯示更新後的名稱

#### Scenario: 自訂動作不可編輯
- **WHEN** 對 `isCustom=true` 的動作發出 PATCH
- **THEN** 回傳 403

### Requirement: 刪除動作（含引用保護）
系統 SHALL 允許管理者經 AlertDialog 確認後刪除動作（`DELETE /api/admin/exercises/[id]`），刪除範圍與編輯相同（org 管理者限本館、全域 ADMIN 限全域）。若動作被 `WorkoutLogExercise` 或 `WorkoutPlanExercise` 引用，SHALL 回 409 並顯示「此動作已被訓練記錄或計畫使用，無法刪除」，動作保留。

#### Scenario: 刪除未引用動作
- **WHEN** 管理者確認刪除一個未被任何訓練記錄/計畫引用的本範圍動作
- **THEN** 動作從列表消失

#### Scenario: 刪除被引用動作被擋下
- **WHEN** 管理者嘗試刪除已被訓練記錄引用的動作
- **THEN** 回傳 409，顯示錯誤訊息，動作仍在列表中

#### Scenario: org 管理者刪全域動作被拒
- **WHEN** OWNER 或 org-ADMIN 對全域內建動作發出 DELETE
- **THEN** 回傳 403，動作仍在

#### Scenario: 無權限呼叫 API
- **WHEN** 非 org-ADMIN 以上且非全域 ADMIN 的用戶呼叫任一 /api/admin/exercises 端點
- **THEN** 回傳 403
