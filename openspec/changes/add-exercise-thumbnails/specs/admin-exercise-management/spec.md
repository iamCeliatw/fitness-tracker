## MODIFIED Requirements

### Requirement: 動作庫管理頁
系統 SHALL 提供 `/admin/exercises` 頁面（org-ADMIN 以上，或全域 ADMIN 可存取），每列顯示縮圖（`imageUrl` 為 null 時顯示肌群字首 fallback 方塊）、名稱、肌群、類別。org 管理者看到全域內建動作（標示灰色「內建」badge，唯讀）與本館自訂動作（可操作）；全域 ADMIN 看到全域動作與會員自訂動作（自訂動作標示「自訂」badge）。頁面 SHALL 提供肌群 Tab 篩選與名稱搜尋。

#### Scenario: org 管理者檢視動作庫
- **WHEN** OWNER 或 org-ADMIN 開啟 /admin/exercises
- **THEN** 顯示全域內建動作（縮圖、「內建」badge、無編輯/刪除按鈕）與本館自訂動作（fallback 方塊、有操作按鈕），不含其他館的動作

#### Scenario: admin 檢視動作庫
- **WHEN** 全域 ADMIN 開啟 /admin/exercises
- **THEN** 顯示動作列表（含 seed 動作與會員自訂動作），內建動作有縮圖，自訂動作有「自訂」badge 與 fallback 方塊

#### Scenario: 肌群篩選與搜尋
- **WHEN** 管理者選擇肌群 Tab 或輸入名稱關鍵字
- **THEN** 列表僅顯示符合條件的動作；無結果時顯示灰字空狀態提示

#### Scenario: 無權限存取被導走
- **WHEN** 非 org-ADMIN 以上且非全域 ADMIN 的用戶訪問 /admin/exercises
- **THEN** 被導向 /dashboard

### Requirement: 刪除動作（含引用保護）
系統 SHALL 允許管理者經 AlertDialog 確認後刪除動作（`DELETE /api/admin/exercises/[id]`），刪除範圍與編輯相同（org 管理者限本館、全域 ADMIN 限全域）。若動作被 `WorkoutLogExercise` 引用，SHALL 回 409 並顯示「此動作已被訓練記錄使用，無法刪除」，動作保留。

#### Scenario: 刪除未引用動作
- **WHEN** 管理者確認刪除一個未被任何訓練記錄引用的本範圍動作
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
