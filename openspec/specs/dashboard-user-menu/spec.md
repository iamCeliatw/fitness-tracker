## ADDED Requirements

### Requirement: Desktop 側欄用戶資訊區塊
Dashboard desktop 側欄底部 SHALL 顯示用戶資訊區塊（`border-t border-gray-800` 分隔），包含用戶頭像（有 `user_metadata.avatar_url` 時）、用戶名字、身分 badge 與登出按鈕。頭像 SHALL 為圓形（`rounded-full`），無 avatar_url 或載入失敗時 fallback 至現行純文字呈現。

#### Scenario: 會員顯示用戶區塊
- **WHEN** `orgRole` 非 COACH 的用戶在 md 以上螢幕開啟任意 /dashboard/* 頁面
- **THEN** 側欄底部顯示名字與「會員」badge（`border-gray-700 text-gray-400`）

#### Scenario: 教練顯示教練 badge
- **WHEN** `orgRole=COACH` 的用戶開啟任意 /dashboard/* 頁面
- **THEN** badge 顯示「教練」（`border-orange-500/40 text-orange-400`）

#### Scenario: 無名字時顯示 email 前綴
- **WHEN** 用戶的 `name` 為空
- **THEN** 用戶區塊顯示 email `@` 之前的字串，不顯示空白

#### Scenario: Google 用戶顯示頭像
- **WHEN** 登入用戶的 `user_metadata.avatar_url` 存在
- **THEN** 用戶區塊於名字左側顯示圓形頭像

#### Scenario: 無頭像 fallback
- **WHEN** 登入用戶無 `avatar_url`
- **THEN** 用戶區塊維持現行呈現，不顯示破圖

### Requirement: Mobile 頂部 Header
Dashboard SHALL 在手機（< md）顯示頂部 slim header：左側 LIFTLOG 品牌字，右側名字 + 身分 badge + 登出 icon。md 以上隱藏。

#### Scenario: 手機顯示頂部 Header
- **WHEN** 用戶在手機（< md）開啟任意 /dashboard/* 頁面
- **THEN** 頂部顯示 header（品牌 + 名字 + badge + 登出 icon）

#### Scenario: 桌面隱藏頂部 Header
- **WHEN** 用戶在 md 以上螢幕開啟任意 /dashboard/* 頁面
- **THEN** 頂部 header 不顯示（用戶資訊改由側欄底部呈現）

### Requirement: Dashboard 登出
Dashboard SHALL 提供登出入口（desktop 側欄底部按鈕、mobile 頂部 header icon），點擊後執行 Supabase signOut 並導向 /login。登出實作 SHALL 與 admin 後台共用同一元件（`logout-button.tsx`）。

#### Scenario: 點擊登出
- **WHEN** 用戶點擊登出按鈕（desktop 或 mobile）
- **THEN** 呼叫 `supabase.auth.signOut()` 並 redirect 到 /login

#### Scenario: 登出按鈕 hover 回饋
- **WHEN** 用戶 hover 登出按鈕
- **THEN** 文字/icon 由 `text-gray-400` 轉為 `text-white`，有 `transition-colors duration-150`

### Requirement: /api/auth/me 回傳 orgRole
`GET /api/auth/me` SHALL 在既有回傳欄位（`role`、`name`、`email`）之外新增 `orgRole` 欄位：有 `OrganizationMember` 記錄時回傳其 `role`，無記錄時回傳 `null`。

#### Scenario: 教練呼叫 /api/auth/me
- **WHEN** `OrganizationMember.role=COACH` 的已登入用戶呼叫 `GET /api/auth/me`
- **THEN** 回傳 JSON 包含 `orgRole: "COACH"`，既有欄位不變

#### Scenario: 無 org 記錄的用戶
- **WHEN** 沒有 `OrganizationMember` 記錄的已登入用戶呼叫 `GET /api/auth/me`
- **THEN** 回傳 JSON 包含 `orgRole: null`

#### Scenario: 未登入
- **WHEN** 未登入請求 `GET /api/auth/me`
- **THEN** 回傳 401（既有行為不變）
