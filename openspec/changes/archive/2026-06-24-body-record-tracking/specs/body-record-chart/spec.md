## ADDED Requirements

### Requirement: User can view body trend chart
系統 SHALL 以折線圖呈現用戶的體重與體脂率歷史趨勢。

#### Scenario: Chart renders with sufficient data
- **WHEN** 用戶有 2 筆以上的 BodyRecord
- **THEN** 頁面顯示折線圖，X 軸為日期，Y 軸左側為體重（kg），右側為體脂率（%）

#### Scenario: Insufficient data state
- **WHEN** 用戶的 BodyRecord 少於 2 筆
- **THEN** 圖表區域顯示「記錄 2 筆以上數據後將顯示趨勢圖」提示

#### Scenario: Switch between 30 and 90 day range
- **WHEN** 用戶點擊「30 天」或「90 天」切換按鈕
- **THEN** 圖表更新為對應區間的資料，URL query param 同步更新（`?range=30` 或 `?range=90`）

### Requirement: Chart data is scoped to current user
系統 SHALL 只顯示當前登入用戶自己的 BodyRecord 資料。

#### Scenario: Data isolation
- **WHEN** 用戶 A 與用戶 B 都有記錄
- **THEN** 用戶 A 的圖表只顯示 A 的資料，不包含 B 的
