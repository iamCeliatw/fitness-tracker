## ADDED Requirements

### Requirement: User can add a body measurement record
系統 SHALL 提供表單讓已登入用戶新增體重、體脂率、肌肉量量測數值。

#### Scenario: Successful submission with all fields
- **WHEN** 用戶填入有效的 weight（正數）、bodyFat（0–100）、date，並送出表單
- **THEN** 系統呼叫 `POST /api/body-records`，成功後頁面刷新並顯示最新記錄

#### Scenario: Submit with only weight (minimum required)
- **WHEN** 用戶只填入 weight，其他欄位留空，並送出
- **THEN** 系統接受並儲存，bodyFat 與 muscleMass 存為 null

#### Scenario: Invalid weight value
- **WHEN** 用戶輸入非正數（0、負數、文字）
- **THEN** 表單顯示 inline 錯誤「請輸入有效體重」，不送出

#### Scenario: Date defaults to today
- **WHEN** 用戶開啟表單
- **THEN** date 欄位預填當日日期（YYYY-MM-DD）

### Requirement: API validates and persists body record
系統 SHALL 在 `POST /api/body-records` 驗證資料並寫入 `BodyRecord` table，記錄必須綁定當前登入用戶。

#### Scenario: Unauthenticated request rejected
- **WHEN** 未登入用戶呼叫 `POST /api/body-records`
- **THEN** 系統回傳 401
