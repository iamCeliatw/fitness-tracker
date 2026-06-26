## ADDED Requirements

### Requirement: User can register an account
系統 SHALL 提供 `/register` 頁面，接受 name、email、password 三個欄位，驗證後建立用戶帳號。

#### Scenario: Successful registration
- **WHEN** 用戶填入有效的 name、email（格式正確且未被使用）、password（至少 6 字元）並送出
- **THEN** 系統以 bcrypt（cost 12）hash 密碼後寫入 `User` table，role 預設為 `USER`，並導向 `/login?registered=true`

#### Scenario: Email already exists
- **WHEN** 用戶填入的 email 已存在於資料庫
- **THEN** 系統回傳 409 錯誤，頁面顯示「此 Email 已被註冊」

#### Scenario: Invalid input
- **WHEN** 任何欄位不符合 zod schema（email 格式錯誤、password 少於 6 字元、name 為空）
- **THEN** 對應欄位下方顯示 inline 錯誤訊息，表單不送出

### Requirement: Registration form validation
系統 SHALL 在 client 端以 react-hook-form + zod 即時驗證，並在 server 端 `POST /api/auth/register` 再次驗證。

#### Scenario: Client-side validation fires on blur/submit
- **WHEN** 用戶離開欄位（blur）或點擊送出
- **THEN** zod resolver 立即顯示對應錯誤，不等待 server 回應

#### Scenario: Server-side validation blocks bypass attempt
- **WHEN** 直接向 `POST /api/auth/register` 送出不合法的 JSON body
- **THEN** server 回傳 400 並附帶錯誤訊息
