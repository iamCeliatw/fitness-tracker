## Context

現有認證是 Supabase Auth email/password：register route（`/api/auth/register`）在 signUp 後負責建 org（OWNER）或以邀請碼加入（MEMBER）；`handle_new_user` DB trigger 把 `auth.users` 同步到 `public.User`。OAuth 用戶會繞過 register route，登入後有 User row 但無 membership。`dashboard/layout.tsx` 已為顯示 orgRole 查詢 membership。前置設定（Google Cloud OAuth client、Supabase Google provider）用戶已完成。

## Goals / Non-Goals

**Goals:**
- Google 一鍵登入/註冊，與現有 password 流程並存
- OAuth 首次登入補完 onboarding（建館 / 邀請碼），教練學員系統零侵入（一切掛 User.id + membership）
- 同 email 帳號自動合併（auto-linking），既有資料全保留
- 修掉無 membership 用戶直進 dashboard 的既有裸奔

**Non-Goals:**
- 手動帳號合併流程、其他 OAuth provider、配對面板頭像、middleware 層攔截

## Decisions

### D1：帳號合併 = Supabase auto-linking（vs 擋下 / 手動合併流程）
Dashboard 設定開啟，同 email 且已驗證自動掛同一 `auth.users`。User.id 不變 → membership/CoachStudent/健身記錄全部免遷移，零 code。擋下的 UX 差，手動合併對 demo 是過度工程。前提：password 帳號的 email 需已驗證——tasks 第一項先驗證專案 Confirm email 設定與實際 linking 行為，若 dev 環境關閉 email 驗證導致 linking 不成立，接受「同 email 兩個帳號」為已知限制並記錄（不為此加 code）。

### D2：無 membership 攔截點 = dashboard layout（vs middleware / callback）
`dashboard/layout.tsx` 既有 membership 查詢直接判 null → `redirect("/onboarding")`，零額外 DB 查詢。middleware 每 request 打一次 HTTPS 查詢太重（先前已否決）；只在 callback 判斷擋不住直接輸 URL 的人，也修不到既有裸奔。全域 ADMIN 走 `/admin` 不經此 layout，不受影響。

### D3：org 建立邏輯抽 `src/lib/org.ts`（vs 複製一份 / onboarding 打 register API）
`createOrgWithOwner`（撞碼重試 + 補償刪除）與邀請碼驗證從 register route 抽出，register 與 `POST /api/onboarding` 共用。複製會分岔；register API 帶著 signUp 語意不可重用於已登入用戶。

### D4：頭像不落 DB（vs User 加 avatarUrl 欄位）
`requireAuth` 回傳的 user 已含 `user_metadata.avatar_url`，layout 直接傳給 nav 顯示。加欄位要 migration + trigger 同步，對「顯示一張圖」是過度工程。配對面板等需要跨用戶頭像時再考慮落 DB。

### D5：trigger name 相容 = COALESCE（idempotent migration）
Google metadata 的名字欄位是 `full_name`，現行 trigger 只讀 `name`。改 `COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name')`，手動於 Supabase SQL Editor 執行（本機不能 migrate），SQL 入版控 `prisma/migrations/`。

### D6：E2E 不測 Google 本身
Google 登入頁擋自動化。測的是本 change 的真正邏輯：無 membership 攔截、onboarding 二選一、反向導回。用新 `TEST_ONBOARD` 帳號（password 登入即可觸發同一條攔截路徑），spec 開場自癒刪其 membership 與所建 org。

## 互動視覺規格

- `/onboarding` 沿用 `(auth)` 深色健身風 layout 與 register 現行的二選一切換元件，照抄不重設計；表單只留 orgName / inviteCode 欄位
- Google 按鈕：現有 outline button 樣式 + Google icon，`transition-colors`，送出中 disabled
- 錯誤：邀請碼無效 → inline 錯誤（同 register 現行）；callback 失敗 → `/login?error=oauth` 用現有錯誤樣式顯示
- user-menu 頭像：圓形 `rounded-full`，載入失敗或無 URL fallback 現行文字呈現

## Risks / Trade-offs

- [auto-linking 在 email 未驗證時不生效 → 同 email 兩個帳號] → tasks 先驗證行為；不成立則記錄為已知限制，不加 code
- [`/onboarding` 反向守門缺失會讓已有 membership 用戶重複建館] → 頁面與 API 都判斷：頁面 redirect `/dashboard`，API 回 409
- [register route 重構動到既有註冊] → 行為不變的純抽取，既有 register E2E 覆蓋回歸
- [callback route 拿到無效 code] → 導回 `/login?error=oauth`，不留半登入狀態

## Migration Plan

1. Supabase Dashboard：Redirect URLs 加 `http://localhost:3000/auth/callback`（Vercel domain 上線前補）
2. SQL Editor 執行 trigger COALESCE migration（idempotent，可重跑）
3. 部署 code（無 schema 變更，無順序依賴）
4. Rollback：關 Google provider 按鈕即失效；trigger 改動向下相容不需回滾

## Open Questions

（無——三個關鍵決策已於 brainstorming 拍板）
