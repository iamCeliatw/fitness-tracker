## 1. 前置驗證與 Migration

- [x] 1.1 Supabase Dashboard：Auth → URL Configuration → Redirect URLs 加 `http://localhost:3000/auth/callback`（用戶操作，完成後打勾）
- [x] 1.2 驗證 Confirm email 設定與 auto-linking 行為：確認專案 email 驗證狀態；若 dev 環境無法觸發 linking，在本檔記錄為已知限制後繼續（依 design D1，不為此加 code）→ 已查 `/auth/v1/settings`：`mailer_autoconfirm=true`（email 視為已驗證，linking 條件成立）、`google=true`；實際 linking 行為由 3.4 瀏覽器實測驗證
- [x] 1.3 撰寫 `prisma/migrations/20260713000000_google_oauth_trigger/migration.sql`：`handle_new_user` name 改 `COALESCE(->>'name', ->>'full_name')`（idempotent），於 Supabase SQL Editor 執行（已驗證：Google 用戶 name 正確同步）

## 2. org 邏輯抽取（行為不變的重構）

- [x] 2.1 建 `src/lib/org.ts`：從 `/api/auth/register` 抽出 `createOrgWithOwner`（撞碼重試 + 補償刪除）與邀請碼驗證，register route 改為呼叫共用函式
- [x] 2.2 跑既有 register 相關 E2E 確認回歸綠燈（org-onboarding + login 全綠；首輪 login 失敗為冷編譯 flake，重跑即過）

## 3. Google 登入端

- [x] 3.1 `GoogleLoginButton` client 元件（outline 樣式 + Google icon + `transition-colors`，送出中 disabled），放上 login 與 register 兩頁
- [x] 3.2 `src/app/auth/callback/route.ts`：`exchangeCodeForSession` → 查 role → ADMIN 導 `/admin`、其他導 `/dashboard`；失敗導 `/login?error=oauth`，login 頁顯示對應錯誤訊息（另補 proxy.ts public path 加 `/auth/callback`——回跳時尚無 session，漏掉會被踢回 /login）
- [x] 3.3 瀏覽器實測：全新 Google 帳號登入 → User row 建立（name 從 `full_name` 正確同步）→ 被導 `/onboarding` 建館成 OWNER（DB 驗證通過；錯誤處理也實測過——secret 貼錯時正確落在 `/login?error=oauth`）
- [x] 3.4 瀏覽器實測 auto-linking：既有 password 測試帳號（有 MEMBER membership）改用同 email Google 登入 → 直接進 dashboard；DB 驗證 User.id 不變、identities = [email, google]，membership 保留

## 4. Onboarding 補完

- [x] 4.1 `POST /api/onboarding`：requireAuth；已有 membership 回 409；`mode=create` 建館成 OWNER、`mode=join` 驗碼加入成 MEMBER（zod discriminatedUnion，共用 `src/lib/org.ts`）
- [x] 4.2 `/onboarding` 頁：`(auth)` 深色風格、register 二選一切換元件（只留 orgName / inviteCode 欄位）；未登入導 `/login`（由 proxy 涵蓋）；已有 membership 導 `/dashboard`；邀請碼無效顯示 inline 錯誤
- [x] 4.3 `dashboard/layout.tsx`：membership 為 null → `redirect("/onboarding")`
- [x] 4.4 瀏覽器實測：E2E journey 全覆蓋（攔截→建館→OWNER、無效碼、加入 MEMBER、反向導回）+ 用戶真機 Google 帳號走過建館路徑

## 5. 頭像

- [x] 5.1 dashboard layout 傳 `user_metadata.avatar_url` 給 DashboardNav，user-menu 顯示圓形頭像，無 URL fallback 現行文字；用戶目視確認 Google 帳號頭像顯示，一般帳號 fallback 由 E2E user-menu spec 覆蓋

## 6. E2E 測試

- [x] 6.1 ~~TEST_ONBOARD env 帳號~~ → 改沿用 org-onboarding.spec.ts 的自建 fixture pattern：`e2e-postlogin-` 前綴帳號由 admin API 直建（無 membership），不需新 env var；已 grep e2e/ 確認無共用狀態
- [x] 6.2 `e2e/post-login-onboarding.spec.ts`：開場自癒（刪帳號/membership/org 後重建）；案例：無 membership 登入導 `/onboarding`、建館成 OWNER、無效邀請碼 inline 錯誤（edge）、邀請碼加入成 MEMBER、已有 membership 進 `/onboarding` 反向導回
- [x] 6.3 `npm run test:e2e` 全綠（60 passed, 6.4m，含既有 register/admin 回歸）
