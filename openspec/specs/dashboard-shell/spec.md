## ADDED Requirements

### Requirement: Dashboard 桌面左側 Nav
Dashboard layout SHALL 在桌面（md 以上）顯示固定 224px 左側 nav，包含 4 個導覽項目（icon + label）：總覽、訓練、體重、飲食。

#### Scenario: 桌面顯示左側 Nav
- **WHEN** 用戶在 md 以上螢幕開啟任意 /dashboard/* 頁面
- **THEN** 左側顯示 Nav，主內容區在右側展開

#### Scenario: Active 路由高亮
- **WHEN** 用戶位於 /dashboard/workout
- **THEN** 「訓練」導覽項目呈現 active 樣式（text-orange-400 + bg-gray-800）

#### Scenario: Hover 效果
- **WHEN** 用戶 hover 非 active 導覽項目
- **THEN** 顯示 hover 樣式（bg-gray-800/50 text-gray-200），有 transition-colors duration-150

### Requirement: Dashboard 手機底部 Tab Bar
Dashboard layout SHALL 在手機（< md）顯示固定底部 Tab Bar，包含相同 4 個導覽項目（icon + label），icon h-5 w-5，label text-xs。

#### Scenario: 手機顯示底部 Tab Bar
- **WHEN** 用戶在手機（< md）開啟任意 /dashboard/* 頁面
- **THEN** 底部固定顯示 Tab Bar，左側 Nav 隱藏

#### Scenario: 主內容不被 Tab Bar 遮擋
- **WHEN** 頁面內容較長，需要捲動
- **THEN** 主內容區底部有 pb-16 padding，不被 Tab Bar 遮擋

#### Scenario: Active Tab 高亮
- **WHEN** 用戶位於 /dashboard/body
- **THEN** 「體重」Tab 呈現 active 樣式（text-orange-400），其餘 text-gray-500

### Requirement: Dashboard 內容寬度
Dashboard 所有子頁面的內容寬度 SHALL 調整為 max-w-5xl，padding 維持 p-6。

#### Scenario: 桌面寬螢幕顯示
- **WHEN** 用戶在 1440px 螢幕開啟 /dashboard
- **THEN** 內容區最大寬度為 64rem（max-w-5xl），水平置中
