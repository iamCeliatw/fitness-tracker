## ADDED Requirements

### Requirement: User can log in with credentials
系統 SHALL 提供 `/login` 頁面，接受 email 和 password，驗證通過後建立 JWT session 並依 role 導向。

#### Scenario: Successful login as USER
- **WHEN** 用戶輸入正確的 email 與 password，且 `role` 為 `USER`
- **THEN** 系統建立 JWT session，導向 `/dashboard`

#### Scenario: Successful login as ADMIN
- **WHEN** 用戶輸入正確的 email 與 password，且 `role` 為 `ADMIN`
- **THEN** 系統建立 JWT session，導向 `/admin`

#### Scenario: Invalid credentials
- **WHEN** email 不存在，或密碼與 bcrypt hash 不符
- **THEN** 表單顯示「Email 或密碼錯誤」，不洩漏是哪一項錯誤

#### Scenario: Redirect after registration
- **WHEN** 用戶從 `/register` 成功導向 `/login?registered=true`
- **THEN** 頁面顯示綠色成功訊息「帳號建立成功，請登入」

### Requirement: Login form validation
系統 SHALL 在 client 端驗證 email 格式與 password 非空，防止無效請求送出。

#### Scenario: Empty fields blocked
- **WHEN** 用戶未填寫 email 或 password 直接送出
- **THEN** 對應欄位顯示 inline 錯誤，表單不送出

### Requirement: Already logged-in redirect
系統 SHALL 防止已登入用戶訪問 `/login` 或 `/register`。

#### Scenario: Logged-in user visits /login
- **WHEN** 已登入的 USER 訪問 `/login`
- **THEN** middleware 自動導向 `/dashboard`（ADMIN 導向 `/admin`）
