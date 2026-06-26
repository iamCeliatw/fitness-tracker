## ADDED Requirements

### Requirement: User can view their workout history
系統 SHALL 在 `/dashboard/workout` 顯示當前用戶最近 20 筆訓練日誌，以卡片呈現摘要資訊。

#### Scenario: History list with data
- **WHEN** 用戶進入 `/dashboard/workout`，且已有訓練記錄
- **THEN** 頁面顯示卡片列表，每張卡片包含：日期、動作數量、總組數
- **AND** 列表依日期降冪排列（最新在前）

#### Scenario: Expand card to see details
- **WHEN** 用戶點擊某張訓練卡片
- **THEN** 卡片展開顯示每個動作名稱及各組的 reps / weight 詳情

#### Scenario: Empty history
- **WHEN** 用戶尚無任何訓練記錄
- **THEN** 頁面顯示空狀態：「還沒有訓練記錄，立即開始今日訓練！」並附「新增訓練」按鈕

#### Scenario: Navigate to new workout
- **WHEN** 用戶點擊「新增訓練」按鈕
- **THEN** 導向 `/dashboard/workout/new`

### Requirement: User can delete a workout log
系統 SHALL 讓用戶刪除一筆歷史訓練日誌（含所有 exercises 和 sets，依 Cascade 刪除）。

#### Scenario: Delete with confirmation
- **WHEN** 用戶點擊某張卡片的刪除按鈕，並在 AlertDialog 確認
- **THEN** 系統呼叫 `DELETE /api/workout-logs/[id]`，成功後卡片從列表移除（`router.refresh()`）

#### Scenario: Cancel deletion
- **WHEN** 用戶點擊刪除後在 AlertDialog 選擇「取消」
- **THEN** 日誌保留，不呼叫 API

#### Scenario: Delete another user's log rejected
- **WHEN** 用戶呼叫 `DELETE /api/workout-logs/[id]`，但該 id 不屬於當前用戶
- **THEN** 系統回傳 403

#### Scenario: Unauthenticated delete rejected
- **WHEN** 未登入用戶呼叫 `DELETE /api/workout-logs/[id]`
- **THEN** 系統回傳 401
