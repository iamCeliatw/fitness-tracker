## Why

健身追蹤平台的所有功能（訓練日誌、飲食記錄、體重追蹤）都需要識別用戶身份。缺乏認證系統，資料無法與個人綁定，前後台也無法區分權限。

## What Changes

- 新增 `/register` 頁面：用戶可建立帳號（name、email、password）
- 新增 `/login` 頁面：用戶以 email/password 登入，登入後依 role 導向
- 登入成功後 `USER` 導向 `/dashboard`，`ADMIN` 導向 `/admin`
- 密碼以 bcrypt hash 儲存，不明文存入資料庫
- NextAuth.js v5 Credentials provider 管理 JWT session
- Middleware 已設定路由保護（未登入 → `/login`）

## Capabilities

### New Capabilities

- `user-registration`: 新用戶填寫 name/email/password 完成註冊，包含 zod 驗證與 bcrypt hash
- `user-login`: 已註冊用戶以 email/password 登入，取得 JWT session，依 role 導向對應首頁

### Modified Capabilities

（無，為全新功能）

## Impact

- **新增頁面**：`src/app/(auth)/login/page.tsx`、`src/app/(auth)/register/page.tsx`
- **新增 API route**：`src/app/api/auth/register/route.ts`（POST 建立用戶）
- **依賴**：`next-auth@beta`、`bcryptjs`、`zod`、`react-hook-form`、`@hookform/resolvers`
- **資料庫**：寫入 `User` table（`prisma.user.create`）
- **已有基礎**：`src/auth.ts`、`src/middleware.ts`、`src/lib/auth-helpers.ts` 已建立
