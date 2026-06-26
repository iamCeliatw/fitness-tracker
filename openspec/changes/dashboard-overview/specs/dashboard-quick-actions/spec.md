## ADDED Requirements

### Requirement: 快速入口連結
系統 SHALL 在 Dashboard 顯示兩個快速入口：「新增訓練」連結至 `/dashboard/workout/new`、「記錄體重」連結至 `/dashboard/body`。

#### Scenario: 點擊新增訓練
- **WHEN** 用戶點擊「新增訓練」快速入口
- **THEN** 導向 `/dashboard/workout/new`

#### Scenario: 點擊記錄體重
- **WHEN** 用戶點擊「記錄體重」快速入口
- **THEN** 導向 `/dashboard/body`

#### Scenario: 快速入口始終顯示
- **WHEN** 用戶進入 Dashboard，無論是否有資料
- **THEN** 兩個快速入口按鈕均可見且可點擊
