## MODIFIED Requirements

### Requirement: 顯示本週訓練次數
系統 SHALL 查詢當前用戶從本週週一 00:00 起至今的 WorkoutLog 筆數，並顯示在統計卡片中。卡片 grid 在手機為單欄（grid-cols-1），sm 以上為三欄（sm:grid-cols-3）。

#### Scenario: 本週有訓練記錄
- **WHEN** 用戶本週有 3 筆 WorkoutLog
- **THEN** 卡片顯示「3 次」

#### Scenario: 本週尚無訓練
- **WHEN** 用戶本週沒有 WorkoutLog
- **THEN** 卡片顯示「0 次」

### Requirement: 顯示最近體重
系統 SHALL 取最新一筆 BodyRecord（依 date 降冪）的 weight 值，顯示在統計卡片中。卡片 grid 在手機為單欄，sm 以上為三欄。

#### Scenario: 有體重記錄
- **WHEN** 用戶有至少一筆 BodyRecord 且 weight 不為 null
- **THEN** 卡片顯示最新體重值（單位 kg）

#### Scenario: 無體重記錄
- **WHEN** 用戶沒有任何 BodyRecord
- **THEN** 卡片顯示「—」

#### Scenario: 最新記錄 weight 為 null
- **WHEN** 最新 BodyRecord 的 weight 欄位為 null
- **THEN** 卡片顯示「—」

#### Scenario: 手機單欄顯示
- **WHEN** 用戶在手機（< sm）查看 dashboard
- **THEN** 統計卡片垂直單欄排列

#### Scenario: 桌面三欄顯示
- **WHEN** 用戶在 sm 以上螢幕查看 dashboard
- **THEN** 統計卡片水平三欄排列
