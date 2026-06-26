## ADDED Requirements

### Requirement: User can create a complete workout log in one submission
系統 SHALL 提供表單讓已登入用戶記錄完整訓練，包含日期、備註、一或多個動作、每個動作的多組重量/次數，一次 POST 建立。

#### Scenario: Successful workout submission
- **WHEN** 用戶填入有效日期、至少一個動作（至少一組有效 reps）並送出
- **THEN** 系統呼叫 `POST /api/workout-logs`，成功後導向 `/dashboard/workout` 並顯示新日誌

#### Scenario: Submit with no exercises
- **WHEN** 用戶沒有加入任何動作就按「儲存訓練」
- **THEN** 表單顯示 inline 錯誤「請至少加入一個動作」，不送出

#### Scenario: Dynamic set management
- **WHEN** 用戶點擊某動作的「新增一組」
- **THEN** 表單新增一列 set（setNumber 自動遞增，reps/weight 空白）
- **AND WHEN** 用戶點擊某組的刪除按鈕
- **THEN** 該組從清單中移除，setNumber 重新排序

#### Scenario: Remove an exercise from the list
- **WHEN** 用戶點擊動作列的「移除」按鈕
- **THEN** 該動作及其所有組數從表單中移除

#### Scenario: Date defaults to today
- **WHEN** 用戶進入 `/dashboard/workout/new`
- **THEN** 日期欄位預填當日日期（YYYY-MM-DD）

#### Scenario: Weight input accepts decimals
- **WHEN** 用戶在 weight 欄輸入 82.5
- **THEN** 系統接受並以 Float 儲存（精度 0.5）

### Requirement: API creates workout log atomically
系統 SHALL 在 `POST /api/workout-logs` 以單一 transaction 建立 `WorkoutLog`、`WorkoutLogExercise[]`、`WorkoutSet[]`，確保原子性。

#### Scenario: Unauthenticated request rejected
- **WHEN** 未登入用戶呼叫 `POST /api/workout-logs`
- **THEN** 系統回傳 401

#### Scenario: Invalid payload rejected
- **WHEN** payload 缺少 `date` 或 `exercises` 為空陣列
- **THEN** 系統回傳 400 並說明錯誤原因

#### Scenario: Transaction rollback on error
- **WHEN** transaction 中任一步驟失敗
- **THEN** 整筆日誌不寫入，回傳 500
