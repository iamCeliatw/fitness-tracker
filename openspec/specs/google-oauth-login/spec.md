## ADDED Requirements

### Requirement: Google 登入入口
login 與 register 頁 SHALL 提供「使用 Google 登入 / 註冊」按鈕，點擊後以 `signInWithOAuth({ provider: "google" })` 發起 OAuth，`redirectTo` 指向 `<origin>/auth/callback`。既有 email/password 表單 SHALL 不受影響地並存。

#### Scenario: 從 login 頁發起 Google 登入
- **WHEN** 用戶在 `/login` 點擊「使用 Google 登入」
- **THEN** 瀏覽器導向 Google OAuth 授權頁，授權後回到 `/auth/callback`

#### Scenario: 送出中防重複點擊
- **WHEN** 用戶點擊 Google 按鈕後 OAuth 導向尚未發生
- **THEN** 按鈕呈 disabled 狀態，不可重複觸發

### Requirement: OAuth Callback 導向
`/auth/callback` route SHALL 以 `exchangeCodeForSession(code)` 交換 session，成功後查詢 `User.role`：`ADMIN` 導向 `/admin`，其他導向 `/dashboard`（與現有 password 登入導向一致）。

#### Scenario: 一般用戶完成 Google 登入
- **WHEN** OAuth 回跳帶有效 code 且用戶 role 為 USER
- **THEN** session 建立成功並 redirect 至 `/dashboard`

#### Scenario: code 無效或交換失敗
- **WHEN** callback 未帶 code 或 `exchangeCodeForSession` 失敗
- **THEN** redirect 至 `/login?error=oauth`，login 頁以現有錯誤樣式顯示訊息，不留半登入狀態

### Requirement: 同 email 帳號自動合併
系統 SHALL 依賴 Supabase auto-linking：同 email（已驗證）的 Google 登入掛到既有 auth user，`User.id` 不變，membership、CoachStudent 配對與健身記錄 MUST 全數保留。

#### Scenario: 既有 password 用戶改用 Google 登入
- **WHEN** email 已驗證的既有 password 帳號用戶首次以同 email 的 Google 帳號登入
- **THEN** 登入為同一個 User（id 不變），原有 org membership 與記錄完整可見，之後兩種方式皆可登入

### Requirement: OAuth 用戶名字同步相容
`handle_new_user` trigger SHALL 以 `COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name')` 取得名字，使 Google（`full_name`）與 email 註冊（`name`）皆能同步到 `public."User".name`。migration SHALL 為 idempotent 並入版控。

#### Scenario: Google 首次登入建立 User
- **WHEN** 全新 Google 帳號完成首次登入
- **THEN** `public."User"` 自動建立且 `name` 為 Google 帳號的顯示名稱
