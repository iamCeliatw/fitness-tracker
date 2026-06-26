## 1. Route Structure & Layout

- [x] 1.1 建立 `src/app/(auth)/layout.tsx`：置中全螢幕 layout，深色健身風背景
- [x] 1.2 建立 `src/app/(auth)/login/page.tsx` 頁面骨架
- [x] 1.3 建立 `src/app/(auth)/register/page.tsx` 頁面骨架

## 2. Register API

- [x] 2.1 建立 `src/app/api/auth/register/route.ts`（POST handler）
- [x] 2.2 實作 zod schema 驗證（name、email、password ≥ 6）
- [x] 2.3 檢查 email 是否已存在（prisma.user.findUnique），已存在回傳 409
- [x] 2.4 以 `bcryptjs.hash(password, 12)` hash 密碼
- [x] 2.5 `prisma.user.create` 寫入 User table，role 預設 USER
- [x] 2.6 成功回傳 201，導向 `/login?registered=true`

## 3. Register Page UI

- [x] 3.1 建立 `src/components/auth/register-form.tsx`（react-hook-form + zod）
- [x] 3.2 加入 name、email、password 欄位（shadcn/ui Input + Label）
- [x] 3.3 接入 API route，處理 409 email 重複錯誤顯示
- [x] 3.4 成功後以 `router.push('/login?registered=true')` 導向

## 4. Login Page UI

- [x] 4.1 建立 `src/components/auth/login-form.tsx`（react-hook-form + zod）
- [x] 4.2 加入 email、password 欄位（shadcn/ui Input + Label）
- [x] 4.3 呼叫 `signIn('credentials', { email, password, redirect: false })`
- [x] 4.4 登入失敗顯示「Email 或密碼錯誤」
- [x] 4.5 登入成功依 session role 以 `router.push` 導向（USER→`/dashboard`，ADMIN→`/admin`）
- [x] 4.6 偵測 `?registered=true` query param，顯示綠色成功訊息

## 5. Shared Auth UI

- [x] 5.1 設計 `(auth)/layout.tsx` 背景：深色漸層 + 健身主題（可用 Tailwind gradient）
- [x] 5.2 登入/註冊頁互相連結（「還沒有帳號？前往註冊」/ 「已有帳號？前往登入」）
- [x] 5.3 按鈕 loading state（送出時 disabled + Spinner）

## 6. Verification

- [x] 6.1 手動測試：成功註冊 → 導向登入頁 → 登入 → 導向 `/dashboard`
- [x] 6.2 手動測試：重複 email 顯示 409 錯誤
- [x] 6.3 手動測試：錯誤密碼顯示「Email 或密碼錯誤」
- [x] 6.4 手動測試：已登入訪問 `/login` 自動導向
