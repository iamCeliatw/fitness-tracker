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

---

## 專案特有的 Locator 規則

> 這份清單是從實際踩過的坑整理的，寫 locator 前先查這裡，避免多次迭代。

### 列表項目

- 食物/記錄列表的項目名稱永遠在 `p.text-sm.text-white.truncate`
  ```ts
  const nameCell = page.locator("p.text-sm.text-white.truncate", { hasText: name });
  ```
- 從 `nameCell` 找同一 row 的操作按鈕（往上兩層到外層 flex div）：
  ```ts
  await nameCell.locator("xpath=../..").getByRole("button").click();
  ```

### AlertDialogTrigger

- 此專案的 `AlertDialogTrigger` **不支援 `asChild`**，永遠 render 成原生 `<button>`
- 不要用 `asChild + Button`，直接對 `AlertDialogTrigger` 加 className
- Playwright 直接用 `getByRole("button")` 在同 row 找即可

### Strict mode（多元素匹配）

- `getByText(name)` 若整頁有多個同字串元素會觸發 strict mode 錯誤
- 先縮小 scope：`page.locator("form").getByText(name)` 或 `page.getByRole("dialog").getByText(name)`

### Dialog / Select 互動

- base-ui `Select.Root` 的 `onValueChange` 型別是 `(value: string | null, details) => void`，不是單純 `string`
- combobox 選項用 `page.getByRole("combobox").click()` 展開，再 `page.getByRole("option", { name: "..." }).click()` 選取

---

## Playwright Config 的專案硬約束

`playwright.config.ts` **必須保持** `fullyParallel: false, workers: 1`。

**原因**：NeonHttp adapter 走 HTTPS，不支援大量並行連線。多個 test worker 同時執行會觸發 Neon 的連線限制，導致所有頁面 load timeout（30s），測試全部失敗——不是程式碼邏輯錯誤，而是連線被 throttle。

不要為了加速把 workers 調高或打開 `fullyParallel`。
