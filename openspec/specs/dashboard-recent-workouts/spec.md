## ADDED Requirements

### Requirement: 顯示最近訓練摘要
系統 SHALL 取用戶最近 3 筆 WorkoutLog（依 date 降冪），每筆顯示訓練日期、動作數、總組數、時長（若有）。

#### Scenario: 有訓練記錄
- **WHEN** 用戶有至少 1 筆 WorkoutLog
- **THEN** 顯示最多 3 筆訓練摘要卡片，每筆卡片包含日期、動作數、組數

#### Scenario: 無訓練記錄
- **WHEN** 用戶沒有任何 WorkoutLog
- **THEN** 顯示空狀態提示文字「尚無訓練記錄」

#### Scenario: 訓練記錄超過 3 筆
- **WHEN** 用戶有超過 3 筆 WorkoutLog
- **THEN** 只顯示最近 3 筆，並顯示「查看全部」連結指向 `/dashboard/workout`

### Requirement: 訓練摘要為唯讀
Dashboard 上的訓練摘要 SHALL 僅供瀏覽，不提供刪除或展開詳情功能；詳情請至 `/dashboard/workout`。

#### Scenario: 用戶嘗試操作摘要卡片
- **WHEN** 用戶查看 Dashboard 的訓練摘要
- **THEN** 卡片無刪除按鈕，無展開/收合互動
