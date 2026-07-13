## MODIFIED Requirements

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
