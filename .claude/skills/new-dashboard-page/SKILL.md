---
name: new-dashboard-page
description: 建立符合專案 layout 契約的新 Dashboard 頁面。自動套用 layout 分層規則、requireAuth、平行 Prisma 查詢、正確的 max-w-3xl 容器，以及互動元件的 transition 樣式。
---

建立新的 Dashboard 頁面，自動套用專案的 layout 契約與樣式規範。

---

**Input**: 描述要建立的頁面，例如「飲食記錄頁，顯示今日熱量與三大營養素列表」。
若未提供，詢問：「要建立哪個頁面？請描述路由、要顯示的資料，以及主要互動。」

---

**步驟**

1. **收集必要資訊**（若輸入不完整則詢問）

   - 頁面路由：`/dashboard/<name>`
   - 要顯示的資料（對應哪些 Prisma model？）
   - 主要互動：有沒有新增表單？有沒有刪除？有沒有展開/收合的卡片？
   - 是否需要 URL query param（例如 `?range=30`）？

2. **執行 Harness Check（UI 分層）**

   在建立任何檔案前，先確認：
   - `src/app/dashboard/layout.tsx` 已存在且包含 `bg-gray-950 text-white min-h-screen`
   - 新頁面的外層 div 只會有 `p-6 max-w-3xl mx-auto`，不加 bg 或 min-h

3. **建立頁面檔案** `src/app/dashboard/<name>/page.tsx`

   套用以下固定骨架：
   ```tsx
   import { requireAuth } from "@/lib/auth-helpers";
   import prisma from "@/lib/prisma";
   // import components...

   export default async function <Name>Page() {
     const session = await requireAuth();
     const userId = session.user.id;

     const [data1, data2] = await Promise.all([
       prisma.<model>.findMany({ where: { userId }, ... }),
       prisma.<model>.findFirst({ where: { userId }, ... }),
     ]);

     return (
       <div className="p-6 max-w-3xl mx-auto">
         <div className="mb-6">
           <h1 className="text-2xl font-bold"><頁面標題></h1>
           <p className="text-gray-400 text-sm mt-1"><副標題></p>
         </div>
         {/* components */}
       </div>
     );
   }
   ```

4. **建立需要的 Server Components**（放在 `src/components/<name>/`）

   - 純展示元件：直接接收 props，無 `"use client"`
   - 有互動的元件（表單、刪除按鈕、展開卡片）：加 `"use client"`

   **互動元件必須套用的樣式規則：**
   - 卡片：`bg-gray-900 border-gray-800 transition-colors duration-150 hover:border-gray-700`
   - 按鈕：至少有 `transition-colors`
   - 展開/收合：`grid-rows-[0fr]/[1fr] transition-all duration-200`（禁止條件渲染造成跳閃）
   - 刪除按鈕：`text-gray-600 hover:text-red-400 hover:bg-red-950/30`

5. **確認 TypeScript 型別無誤**

   ```bash
   npx tsc --noEmit
   ```

   有錯誤立即修，不往下繼續。

6. **完成後回報**

   ```
   ## 完成：/dashboard/<name>

   ### 建立的檔案
   - src/app/dashboard/<name>/page.tsx
   - src/components/<name>/<component>.tsx

   ### Layout 契約確認
   ✓ 背景色由 layout.tsx 管理
   ✓ page component 只有 p-6 max-w-3xl mx-auto
   ✓ 互動元件已加 transition 樣式

   → 下一步：執行 /add-e2e 補測試，或 npm run dev 目視確認。
   ```
