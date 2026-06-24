## Context

本專案為健身追蹤平台，採用 Next.js 15 App Router + Neon PostgreSQL（Prisma 7）。認證基礎已建立：`src/auth.ts`（NextAuth v5 Credentials）、`src/middleware.ts`（路由保護）、`User` model 含 `role` 欄位（USER / ADMIN）。目前缺少 UI 頁面讓用戶實際完成登入與註冊。

## Goals / Non-Goals

**Goals:**
- 建立可用的 `/login`、`/register` 頁面（shadcn/ui）
- 實作 `POST /api/auth/register` 建立用戶（email unique 驗證、bcrypt hash）
- 登入後依 role 自動導向（USER→`/dashboard`，ADMIN→`/admin`）
- 前端 zod 驗證 + server-side 驗證雙層保護

**Non-Goals:**
- OAuth / 第三方登入（Google、GitHub）
- Email 驗證信（忘記密碼流程）
- 多 session 管理

## Decisions

### 1. Route Group `(auth)` 隔離版型
使用 `src/app/(auth)/` route group，讓登入/註冊頁共用獨立 layout（置中卡片），不受主應用 layout 影響。

**Alternative**：單獨 layout 檔。  
**選擇理由**：route group 語意更清楚，未來加 forgot-password 頁面只需放同一 group。

### 2. 表單驗證：react-hook-form + zod
Client 側用 react-hook-form + zod resolver 即時回饋，Server Action / API route 再次用 zod 驗證防止繞過。

**Alternative**：純 Server Action。  
**選擇理由**：即時 inline error 提升 UX；面試展示 react-hook-form 整合能力。

### 3. 密碼 hash：bcryptjs（cost factor 12）
`bcryptjs` 純 JS 實作，不依賴 native binding，Vercel 部署無相容問題。

### 4. 錯誤處理
登入失敗統一回傳「Email 或密碼錯誤」，不區分「用戶不存在」vs「密碼錯誤」，防止用戶枚舉攻擊。

## Risks / Trade-offs

- **[Risk]** `PrismaNeonHttp` 不支援 transaction → 在 `register` API 只有單一 `user.create`，無需 transaction，風險低。
- **[Risk]** bcrypt 同步 hash 在 serverless 短暫阻塞 → 用 `bcryptjs` async API（`hash()`）避免。
- **[Trade-off]** JWT strategy 無法即時 revoke session → 接受此限制，符合 demo 規模需求。
