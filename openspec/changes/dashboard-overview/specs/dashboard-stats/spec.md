## ADDED Requirements

### Requirement: 顯示本週訓練次數
系統 SHALL 查詢當前用戶從本週週一 00:00 起至今的 WorkoutLog 筆數，並顯示在統計卡片中。

#### Scenario: 本週有訓練記錄
- **WHEN** 用戶本週有 3 筆 WorkoutLog
- **THEN** 卡片顯示「3 次」

#### Scenario: 本週尚無訓練
- **WHEN** 用戶本週沒有 WorkoutLog
- **THEN** 卡片顯示「0 次」

### Requirement: 顯示最近體重
系統 SHALL 取最新一筆 BodyRecord（依 date 降冪）的 weight 值，顯示在統計卡片中。

#### Scenario: 有體重記錄
- **WHEN** 用戶有至少一筆 BodyRecord 且 weight 不為 null
- **THEN** 卡片顯示最新體重值（單位 kg）

#### Scenario: 無體重記錄
- **WHEN** 用戶沒有任何 BodyRecord
- **THEN** 卡片顯示「—」

#### Scenario: 最新記錄 weight 為 null
- **WHEN** 最新 BodyRecord 的 weight 欄位為 null
- **THEN** 卡片顯示「—」
