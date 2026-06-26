---
name: add-e2e
description: 為一個已實作的功能補寫 E2E 測試。自動套用專案的測試 pattern（loginAsTestUser、waitForLoadState、happy path + edge case），並確認 npm run test:e2e 綠燈後才算完成。
---

為功能補寫 E2E 測試，套用專案標準 pattern，跑通後才算 Done。

---

**Input**: 描述要測試的功能，例如「體重記錄頁：新增記錄、刪除記錄」。
若未提供，詢問：「要為哪個功能補 E2E 測試？描述頁面路由與主要操作。」

---

**步驟**

1. **收集測試資訊**（若輸入不完整則詢問）

   - 哪個頁面？路由是什麼？
   - 主要 happy path 是什麼（使用者完成什麼操作、期望看到什麼結果）？
   - 要涵蓋哪些 edge case？（空狀態、表單驗證失敗、無效操作）
   - 是否需要登入？（dashboard 下的頁面都需要）

2. **確認測試環境就緒**

   - `e2e/helpers/auth.ts` 存在且有 `loginAsTestUser`
   - `.env` 含 `TEST_USER_EMAIL` 和 `TEST_USER_PASSWORD`
   - 若環境不完整，先提示修正

3. **建立 `e2e/<feature>.spec.ts`**

   套用以下固定 pattern：

   ```ts
   import { test, expect } from "@playwright/test";
   import { loginAsTestUser } from "./helpers/auth";

   test.describe("<功能名稱>", () => {
     test.beforeEach(async ({ page }) => {
       await loginAsTestUser(page);
     });

     test("<happy path 描述>", async ({ page }) => {
       await page.goto("/dashboard/<route>");
       await page.waitForLoadState("networkidle");

       // 操作步驟
       // await page.click(...);
       // await page.fill(...);

       // 驗證結果
       await expect(page).toHaveURL("...");
       await expect(page.getByText("...")).toBeVisible();
     });

     test("<edge case 描述>", async ({ page }) => {
       await page.goto("/dashboard/<route>");
       await page.waitForLoadState("networkidle");

       // 觸發 edge case
       // 驗證錯誤訊息或空狀態
       await expect(page.getByText("...")).toBeVisible();
     });
   });
   ```

   **必須遵守的 pattern 規則：**
   - 需要登入的功能：`test.beforeEach` 呼叫 `loginAsTestUser`
   - 每個 `goto` 後面必須有 `waitForLoadState("networkidle")`
   - 使用 `getByRole` / `getByText` 等語意選擇器，避免 CSS selector
   - 每個 describe block：至少一個 happy path + 至少一個 edge case

4. **不需登入的測試**（例如 login 頁本身）

   不加 `beforeEach`，直接 `page.goto("/login")`。
   測試項目固定包含：
   - 正確登入 → 導向正確頁面
   - 錯誤密碼 → 顯示錯誤訊息
   - 未登入存取受保護頁 → 導向 `/login`

5. **跑測試確認全部通過**

   ```bash
   npx playwright test e2e/<feature>.spec.ts --project=chromium
   ```

   有失敗立即修，不跳過。

6. **跑全套確認沒有 regression**

   ```bash
   npm run test:e2e
   ```

7. **完成後回報**

   ```
   ## 完成：E2E 測試 — <功能名稱>

   ### 建立的檔案
   - e2e/<feature>.spec.ts

   ### 測試涵蓋
   - ✓ <happy path 描述>
   - ✓ <edge case 1>
   - ✓ <edge case 2>（若有）

   ### 測試結果
   ✓ npm run test:e2e — X/X passed

   → tasks.md 的測試任務可以打 [x] 了。
   ```
