## 1. 前置驗證與 Migration

- [ ] 1.1 Supabase Dashboard：Auth → URL Configuration → Redirect URLs 加 `http://localhost:3000/auth/callback`（用戶操作，完成後打勾）
- [ ] 1.2 驗證 Confirm email 設定與 auto-linking 行為：確認專案 email 驗證狀態；若 dev 環境無法觸發 linking，在本檔記錄為已知限制後繼續（依 design D1，不為此加 code）
- [ ] 1.3 撰寫 `prisma/migrations/<ts>_google_oauth_trigger/migration.sql`：`handle_new_user` name 改 `COALESCE(->>'name', ->>'full_name')`（idempotent），於 Supabase SQL Editor 執行

## 2. org 邏輯抽取（行為不變的重構）

- [ ] 2.1 建 `src/lib/org.ts`：從 `/api/auth/register` 抽出 `createOrgWithOwner`（撞碼重試 + 補償刪除）與邀請碼驗證，register route 改為呼叫共用函式
- [ ] 2.2 跑既有 register 相關 E2E 確認回歸綠燈

## 3. Google 登入端

- [ ] 3.1 `GoogleLoginButton` client 元件（outline 樣式 + Google icon + `transition-colors`，送出中 disabled），放上 login 與 register 兩頁
- [ ] 3.2 `src/app/auth/callback/route.ts`：`exchangeCodeForSession` → 查 role → ADMIN 導 `/admin`、其他導 `/dashboard`；失敗導 `/login?error=oauth`，login 頁顯示對應錯誤訊息
- [ ] 3.3 瀏覽器實測：全新 Google 帳號登入 → User row 建立（name 正確）→ 進 `/dashboard`（此時尚未有攔截，先確認 OAuth 流程本身）
- [ ] 3.4 瀏覽器實測 auto-linking：既有 password 帳號改用同 email Google 登入 → 同一 User.id、membership 保留（若 1.2 判定 linking 不成立則跳過並註記）

## 4. Onboarding 補完

- [ ] 4.1 `POST /api/onboarding`：requireAuth；已有 membership 回 409；`mode=create` 建館成 OWNER、`mode=join` 驗碼加入成 MEMBER（zod discriminatedUnion，共用 `src/lib/org.ts`）
- [ ] 4.2 `/onboarding` 頁：`(auth)` 深色風格、register 二選一切換元件（只留 orgName / inviteCode 欄位）；未登入導 `/login`；已有 membership 導 `/dashboard`；邀請碼無效顯示 inline 錯誤
- [ ] 4.3 `dashboard/layout.tsx`：membership 為 null → `redirect("/onboarding")`
- [ ] 4.4 瀏覽器實測：無 membership 帳號登入 → 被導 `/onboarding` → 建館 → 進 dashboard 成 OWNER；邀請碼路徑同樣走一遍

## 5. 頭像

- [ ] 5.1 dashboard layout 傳 `user_metadata.avatar_url` 給 DashboardNav，user-menu 顯示圓形頭像，無 URL fallback 現行文字；瀏覽器目視確認 Google 帳號與一般帳號兩種呈現

## 6. E2E 測試

- [ ] 6.1 建 `TEST_ONBOARD` 測試帳號（僅 auth 帳號、無 membership），`.env` 範本與 `.env.local` 補 `TEST_ONBOARD_EMAIL` / `TEST_ONBOARD_PASSWORD`；先 `grep e2e/` 確認無其他測試依賴此帳號狀態
- [ ] 6.2 `e2e/onboarding.spec.ts`：開場自癒（刪該帳號 membership 與其建立的 org）；案例：無 membership 進 `/dashboard` 導 `/onboarding`、建館成 OWNER、邀請碼加入成 MEMBER、無效邀請碼 inline 錯誤（edge）、已有 membership 進 `/onboarding` 反向導回
- [ ] 6.3 `npm run test:e2e` 全綠（含既有 register/admin 回歸）
