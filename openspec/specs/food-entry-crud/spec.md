## ADDED Requirements

### Requirement: 用戶可新增飲食記錄
`/dashboard/food` 頁面 SHALL 提供新增飲食表單，必填欄位為名稱與熱量，選填欄位為蛋白質、碳水化合物、脂肪、份量、單位、餐別（預設午餐）與日期（預設今日）。

#### Scenario: 成功新增一筆飲食記錄
- **WHEN** 用戶填入名稱「雞胸肉」、熱量 165、餐別「午餐」並送出
- **THEN** 系統 POST 至 `/api/food-entries`，記錄儲存後頁面重新整理，新記錄出現在今日列表中

#### Scenario: 名稱或熱量為空時無法送出
- **WHEN** 用戶未填名稱或熱量直接送出表單
- **THEN** 系統 SHALL 顯示驗證錯誤，不呼叫 API

### Requirement: 今日飲食列表依餐別分組顯示
頁面 SHALL 顯示今日所有 FoodEntry，依 BREAKFAST → LUNCH → DINNER → SNACK 順序分組。無記錄的餐別 SHALL NOT 顯示該分組。

#### Scenario: 有午餐和晚餐記錄時
- **WHEN** 用戶今日有午餐和晚餐記錄
- **THEN** 頁面顯示「午餐」和「晚餐」兩個分組，無「早餐」和「點心」分組

#### Scenario: 今日無任何記錄
- **WHEN** 用戶今日尚無任何飲食記錄
- **THEN** 頁面 SHALL 顯示空狀態提示文字

### Requirement: 用戶可刪除飲食記錄
每筆記錄旁 SHALL 有刪除按鈕，點擊後顯示 AlertDialog 確認，確認後 DELETE `/api/food-entries/[id]`，刪除完成後頁面重新整理。

#### Scenario: 刪除確認後記錄消失
- **WHEN** 用戶點擊刪除並在 AlertDialog 確認
- **THEN** 該記錄 SHALL 從列表中消失，當日加總數字同步更新

#### Scenario: 取消刪除不影響資料
- **WHEN** 用戶點擊刪除後在 AlertDialog 選取消
- **THEN** 記錄 SHALL 保留，頁面無變化
