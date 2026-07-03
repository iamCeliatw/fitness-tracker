## MODIFIED Requirements

### Requirement: Dashboard 桌面左側 Nav
Dashboard layout SHALL 在桌面（md 以上）顯示固定 224px 左側 nav，頂部品牌字為 `LIFT<span>LOG</span>`（LOG 為 orange-500），導覽項目（icon + label）依角色條件顯示：

- 所有會員：總覽、訓練、體重、飲食、預約（/dashboard/booking，CalendarDays icon）
- 僅 `orgRole=COACH`：額外顯示教練（/dashboard/coach，Users icon）

#### Scenario: 桌面顯示左側 Nav
- **WHEN** 用戶在 md 以上螢幕開啟任意 /dashboard/* 頁面
- **THEN** 左側顯示 Nav，主內容區在右側展開

#### Scenario: 會員看到預約、看不到教練連結
- **WHEN** `orgRole` 非 COACH 的會員開啟 /dashboard
- **THEN** Nav 顯示「預約」連結，且不顯示「教練」連結

#### Scenario: 教練看到教練連結
- **WHEN** `orgRole=COACH` 的用戶開啟 /dashboard
- **THEN** Nav 顯示「教練」連結

#### Scenario: 品牌字為 LIFTLOG
- **WHEN** 用戶開啟任意 /dashboard/* 頁面
- **THEN** 側欄頂部顯示 LIFTLOG（非 FitTracker）

#### Scenario: Active 路由高亮
- **WHEN** 用戶位於 /dashboard/workout
- **THEN** 「訓練」導覽項目呈現 active 樣式（text-orange-400 + bg-gray-800）

#### Scenario: Hover 效果
- **WHEN** 用戶 hover 非 active 導覽項目
- **THEN** 顯示 hover 樣式（bg-gray-800/50 text-gray-200），有 transition-colors duration-150

### Requirement: Dashboard 手機底部 Tab Bar
Dashboard layout SHALL 在手機（< md）顯示固定底部 Tab Bar，最多 5 個導覽項目（icon + label，icon h-5 w-5，label text-xs），依角色條件顯示：

- 會員：總覽、訓練、體重、飲食、預約
- 教練（`orgRole=COACH`）：總覽、訓練、體重、飲食、教練（第 5 格以教練取代預約）

#### Scenario: 手機顯示底部 Tab Bar
- **WHEN** 用戶在手機（< md）開啟任意 /dashboard/* 頁面
- **THEN** 底部固定顯示 Tab Bar，左側 Nav 隱藏

#### Scenario: 會員的第 5 個 Tab 是預約
- **WHEN** `orgRole` 非 COACH 的會員在手機開啟 /dashboard
- **THEN** Tab Bar 顯示 總覽/訓練/體重/飲食/預約

#### Scenario: 教練的第 5 個 Tab 是教練
- **WHEN** `orgRole=COACH` 的用戶在手機開啟 /dashboard
- **THEN** Tab Bar 顯示 總覽/訓練/體重/飲食/教練，不顯示預約

#### Scenario: 主內容不被 Tab Bar 遮擋
- **WHEN** 頁面內容較長，需要捲動
- **THEN** 主內容區底部有 pb-16 padding，不被 Tab Bar 遮擋

#### Scenario: Active Tab 高亮
- **WHEN** 用戶位於 /dashboard/body
- **THEN** 「體重」Tab 呈現 active 樣式（text-orange-400），其餘 text-gray-500
