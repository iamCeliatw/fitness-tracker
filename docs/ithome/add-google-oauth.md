# add-google-oauth — 文章素材

日期：2026-07-13
Change：`openspec/changes/archive/2026-07-13-add-google-oauth/`

## 一句話

Supabase Auth 開 Google provider 只要半小時，真正的工程在「OAuth 用戶繞過了你的註冊流程」——本文的主體是登入後補完 onboarding。

## 故事線（可寫的點）

1. **OAuth 便宜，onboarding 才是本體**
   - email/password 註冊時做的事（建館/邀請碼二選一）OAuth 用戶全部繞過
   - 解法不是在 OAuth 流程裡塞表單，而是把「無 membership」變成一個可攔截的狀態：dashboard layout 查到 null → `redirect("/onboarding")`
   - 意外收穫：既有的裸奔漏洞（email 註冊 org insert 失敗 → 無 membership 直進 dashboard）被同一個攔截修掉

2. **攔截點的取捨**（三選一的思考過程）
   - middleware：每 request 一次 DB 查詢（Supabase 是 HTTPS client），太重
   - callback only：擋不住直接輸 URL 的人
   - dashboard layout：本來就在查 membership（顯示 orgRole 用），攔截零額外成本 ✅

3. **帳號合併零 code**：Supabase auto-linking
   - 同 email + 已驗證 → 自動掛同一個 auth user，`User.id` 不變 → 配對/membership/記錄全保留
   - 驗證方式：password 帳號用同 email Google 登入 → identities 變 `[email, google]`
   - 前提陷阱：`mailer_autoconfirm=true` 時 email 視為已驗證，linking 才會發生

4. **踩坑實錄**
   - **proxy public path 漏 `/auth/callback`**：OAuth 回跳時用戶還沒有 session，middleware 會在 callback route 執行前把人踢回 /login——整條流程死在門口。寫 OAuth 一定要檢查路由保護的白名單
   - **Client Secret 貼錯**：`Unable to exchange external code`＝Supabase 拿 code 換 token 被 Google 拒。Google secret 只有 ~35 字元（`GOCSPX-` 開頭），欄位裡出現 400+ 字元就是貼到整份 JSON
   - **Google Cloud 用戶端類型**：「電腦」（Desktop）類型沒有 redirect URI 欄位，要選「網頁應用程式」
   - **trigger 的 metadata 欄位名**：email 註冊的名字在 `name`，Google 給的是 `full_name`——`COALESCE` 一行解決

5. **E2E 策略：不測 Google 本身**
   - Google 登入頁擋自動化，測了也是測 Google 不是測你的 code
   - 測的是自己的邏輯：password 帳號走同一條「無 membership 攔截」路徑，journey 覆蓋 攔截→建館→無效碼→加入→反向導回
   - fixture 用 admin API 直建（跳過 register route）才能製造「有帳號、無 membership」的 OAuth 首登狀態

## 數字

- 16 檔 +628/-77（實作）；E2E 60 passed
- 新 route：`/auth/callback`、`/onboarding`、`POST /api/onboarding`
- 重構：org 建立邏輯抽 `src/lib/org.ts`，register 與 onboarding 共用
