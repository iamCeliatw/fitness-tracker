## ADDED Requirements

### Requirement: 當日熱量與三大營養素加總顯示
頁面頂部 SHALL 顯示今日所有記錄的熱量總計（kcal）、蛋白質（g）、碳水化合物（g）、脂肪（g）加總。

#### Scenario: 有多筆記錄時正確加總
- **WHEN** 用戶今日有早餐 300kcal 和午餐 500kcal
- **THEN** 頁面顯示總熱量 800 kcal

#### Scenario: 無記錄時顯示零
- **WHEN** 用戶今日無任何飲食記錄
- **THEN** 熱量加總顯示 0 kcal

### Requirement: 當日三大營養素圓餅圖
當日至少有一筆含蛋白質、碳水化合物或脂肪資料的記錄時，SHALL 顯示圓餅圖，呈現三大營養素的克數佔比。

#### Scenario: 有營養素資料時顯示圓餅圖
- **WHEN** 用戶今日記錄含蛋白質 30g、碳水 50g、脂肪 10g
- **THEN** 頁面顯示圓餅圖，三個扇形分別代表蛋白質、碳水、脂肪

#### Scenario: 無營養素資料時顯示空狀態
- **WHEN** 今日所有記錄的蛋白質、碳水、脂肪皆為空或 0
- **THEN** 圓餅圖區域 SHALL 顯示「尚無營養素資料」文字，不渲染空圓餅

### Requirement: Dashboard 總覽顯示今日熱量
`/dashboard` 頁面 SHALL 在統計卡片區新增「今日熱量」卡片，顯示今日所有 FoodEntry 的熱量加總（kcal）。

#### Scenario: 有飲食記錄時顯示熱量
- **WHEN** 用戶今日記錄總熱量為 1200 kcal
- **THEN** Dashboard 總覽的「今日熱量」卡片顯示 1200 kcal

#### Scenario: 無飲食記錄時顯示 0
- **WHEN** 用戶今日無任何飲食記錄
- **THEN** 「今日熱量」卡片顯示 0 kcal
