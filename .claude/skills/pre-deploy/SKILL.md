---
name: pre-deploy
description: 部署前檢查。跑 npm run build，攔截常見 Next.js 16 build 錯誤並一次修完，確保 push 到 Vercel 前已乾淨。
---

部署前在本地跑完整 build，修好所有錯誤才推上去，避免 push → Vercel 失敗 → 再修 → 再推的來回。

---

**觸發時機**

- 使用者說「部署」「deploy」「推到 Vercel」「上線」
- 任何要 push 到 production branch（main）的時候

---

**步驟**

1. **跑 build**

   ```bash
   npm run build
   ```

   等待完成，收集所有 error 和 warning。

2. **逐一修錯**

   對照下方的「已知錯誤清單」快速對應，不用重新查文件。
   修完後重跑 build 確認乾淨。

3. **確認 build 輸出正常**

   預期看到：
   ```
   ✓ Compiled successfully
   ✓ Generating static pages
   Route (app) — 所有路由列出，沒有錯誤
   ```

4. **回報狀態**

   build 乾淨後告知使用者可以 push/deploy。

---

## 已知錯誤清單（Next.js 16 + 本專案）

### `useSearchParams()` 需要 Suspense 邊界

**錯誤訊息**：
```
useSearchParams() should be wrapped in a suspense boundary at page "/xxx"
Export encountered an error on /(auth)/login/page: /login, exiting the build.
```

**原因**：`useSearchParams()` 是 Client-side API，在 SSG prerender 時需要 Suspense 包裝。

**修法**：在 page 層包 Suspense，不要改 Client Component 本身：
```tsx
// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
```

**受影響頁面**：任何讀取 `searchParams` 的 Client Component 的 parent page。

---

### `middleware` 檔案慣例已棄用

**警告訊息**：
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**修法**：
```bash
mv src/middleware.ts src/proxy.ts
```

功能完全相同，只改檔名。`export const config` 的 `matcher` 不需要動。

---

### `Promise.all` 造成 Neon 連線錯誤（runtime，不是 build error）

這不會在 build 時出現，但 deploy 後會 500。

**症狀**：Dashboard 或任何 Server Component 出現 `Failed to acquire permit to connect to the database`。

**修法**：把所有 `Promise.all([prisma.xxx, prisma.yyy])` 改成序列 `await`：
```ts
// ❌
const [a, b] = await Promise.all([prisma.foo.findMany(), prisma.bar.count()]);

// ✅
const a = await prisma.foo.findMany();
const b = await prisma.bar.count();
```

---

### Vercel build 卡死（`prisma generate` 未執行）

**症狀**：Vercel build log 停在 `Applying modifyConfig from Vercel`，沒有進入 `Creating an optimized production build`。

**原因**：Vercel 不會自動跑 `prisma generate`，`@prisma/client` 拿不到 schema 型別，compile 階段卡死。

**修法**：`package.json` 的 `build` script 加上 `prisma generate &&`：
```json
"build": "prisma generate && next build"
```

---

## 環境變數確認（Vercel 首次 deploy）

Vercel 需要手動填入這三個變數：

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | Neon pooled（含 `-pooler`），供 runtime 查詢 |
| `DIRECT_URL` | Neon direct（無 `-pooler`），備用 |
| `AUTH_SECRET` | NextAuth JWT 簽名金鑰 |

`AUTH_SECRET` 可用以下指令產生：
```bash
openssl rand -base64 32
```
