## ADDED Requirements

### Requirement: User can browse and select exercises from the library
系統 SHALL 提供 Dialog 選擇器，讓用戶從動作庫瀏覽並按肌群篩選，選取後加入當次訓練表單。

#### Scenario: Open exercise picker
- **WHEN** 用戶點擊「新增動作」按鈕
- **THEN** 彈出 Dialog，顯示動作庫清單（名稱 + 肌群 badge）

#### Scenario: Filter by muscle group
- **WHEN** 用戶點擊某個肌群 Tab（如「CHEST」）
- **THEN** 清單只顯示該肌群的動作；點擊「全部」回到完整清單

#### Scenario: Search by name
- **WHEN** 用戶在搜尋欄輸入關鍵字（如「臥推」或「bench」）
- **THEN** 清單即時篩選，不區分大小寫

#### Scenario: Select an exercise
- **WHEN** 用戶點擊清單中某個動作
- **THEN** 該動作加入訓練表單（預建一組空白 set），Dialog 關閉

#### Scenario: Prevent duplicate exercise
- **WHEN** 用戶嘗試選取已加入清單的動作
- **THEN** 該動作顯示為 disabled 並標示「已加入」，無法再次選取

#### Scenario: Empty exercise library
- **WHEN** `GET /api/exercises` 回傳空陣列
- **THEN** Dialog 顯示「動作庫尚無資料，請聯絡管理員」

### Requirement: API provides exercise library
系統 SHALL 在 `GET /api/exercises` 回傳 caller 可見的動作清單：全域內建（`orgId IS NULL AND isCustom=false`）＋ 本館自訂（`orgId=caller 的 org`）＋ 自己的個人自訂（`createdById=caller`），支援 `muscleGroup` query param 篩選。無 membership 的用戶退回「全域內建＋自己的個人自訂」。

#### Scenario: Fetch all exercises
- **WHEN** 某館成員呼叫 `GET /api/exercises`（無 query param）
- **THEN** 回傳全域內建、本館自訂與自己的個人自訂動作（id, name, muscleGroup, category），不含其他館的動作

#### Scenario: Filter by muscle group
- **WHEN** 呼叫 `GET /api/exercises?muscleGroup=CHEST`
- **THEN** 只回傳可見範圍內 muscleGroup 為 CHEST 的動作

#### Scenario: Unauthenticated request rejected
- **WHEN** 未登入用戶呼叫 `GET /api/exercises`
- **THEN** 系統回傳 401
