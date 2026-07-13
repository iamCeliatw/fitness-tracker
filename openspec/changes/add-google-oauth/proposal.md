## Why

目前只有 email/password 登入，對面試 demo 與真實用戶都缺少最普及的登入方式。Supabase Auth 開 Google provider 本身便宜，真正的缺口是 OAuth 用戶會繞過註冊時的建館/邀請碼流程，登入後沒有 org membership——這條「補完 onboarding」的路必須存在，順便修掉既有裸奔：email 註冊時 org insert 失敗的用戶目前無 membership 也能直進 dashboard。

## What Changes

- login / register 頁新增「使用 Google 登入/註冊」按鈕（`signInWithOAuth`），新增 `/auth/callback` route 交換 session 並依 role 導向
- 帳號合併採 Supabase auto-linking（Dashboard 設定）：同 email 已驗證自動掛同一 auth user，User.id 不變，membership/配對/記錄全保留，零 code
- 新增 `/onboarding` 頁與 `POST /api/onboarding`：無 membership 的已登入用戶補做二選一（建館成 OWNER / 邀請碼加入成 MEMBER）；org 建立邏輯從 register route 抽到 `src/lib/org.ts` 共用
- `dashboard/layout.tsx` 攔截：membership 為 null → `redirect("/onboarding")`（利用既有查詢，零額外 DB 成本）
- user-menu 顯示 Google 頭像（`user_metadata.avatar_url`），無頭像 fallback 現有文字
- `handle_new_user` trigger 的 name 改 `COALESCE(->>'name', ->>'full_name')`（Google metadata 用 `full_name`），idempotent migration
- 前置（用戶手動）：Google Cloud OAuth client 與 Supabase provider 已設定；剩 Supabase Redirect URLs 加 `http://localhost:3000/auth/callback` 與 Confirm email / auto-linking 行為驗證

## Capabilities

### New Capabilities
- `google-oauth-login`: Google OAuth 登入/註冊入口、`/auth/callback` session 交換與 role 導向、auto-linking 帳號合併行為、trigger name 相容
- `post-login-onboarding`: 無 membership 用戶的攔截（dashboard layout）與 `/onboarding` 補完流程（建館/邀請碼二選一、`POST /api/onboarding`）

### Modified Capabilities
- `dashboard-user-menu`: 用戶資訊區塊新增頭像顯示——有 `avatar_url` 顯示圓形頭像，無則維持現行文字呈現

## Impact

- **頁面**：`(auth)/login`、`(auth)/register`（加按鈕）、新增 `/onboarding`、`dashboard/layout.tsx`（攔截）
- **API**：新增 `/auth/callback`、`POST /api/onboarding`；`/api/auth/register` 重構（org 邏輯抽出，行為不變）
- **新檔**：`src/lib/org.ts`、`GoogleLoginButton` 元件
- **DB**：無 schema 變更；一支 idempotent trigger migration（Supabase SQL Editor 手動執行）
- **環境**：新增 `TEST_ONBOARD_EMAIL` / `TEST_ONBOARD_PASSWORD` 測試帳號（.env 範本 + .env.local）
- **外部依賴**：Supabase Dashboard 設定（Google provider ✅、Redirect URLs ⬜、auto-linking 驗證 ⬜）
- **不做**：手動帳號合併流程、配對面板頭像、middleware 攔截、其他 provider
