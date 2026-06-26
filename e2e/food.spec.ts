import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Food record flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/dashboard/food");
    await page.waitForLoadState("networkidle");
  });

  test("can add a food entry and it appears in the list", async ({ page }) => {
    const name = `雞胸肉_${Date.now()}`;

    await page.fill('input[placeholder="雞胸肉"]', name);
    await page.fill('input[placeholder="165"]', "200");

    await page.getByRole("button", { name: "新增記錄" }).click();
    await page.waitForLoadState("networkidle");

    // Entry name should appear in the list
    await expect(page.locator("p.text-sm.text-white.truncate", { hasText: name })).toBeVisible();
  });

  test("shows validation error when name or calories is empty", async ({ page }) => {
    // Submit with empty name
    await page.fill('input[placeholder="165"]', "300");
    await page.getByRole("button", { name: "新增記錄" }).click();
    await expect(page.getByText("請輸入食物名稱")).toBeVisible();

    // Fill name but clear calories
    await page.fill('input[placeholder="雞胸肉"]', "測試食物");
    await page.fill('input[placeholder="165"]', "");
    await page.getByRole("button", { name: "新增記錄" }).click();
    await expect(page.getByText("請輸入熱量")).toBeVisible();
  });

  test("can delete a food entry with AlertDialog confirmation", async ({ page }) => {
    const name = `刪除測試_${Date.now()}`;

    // Add entry first
    await page.fill('input[placeholder="雞胸肉"]', name);
    await page.fill('input[placeholder="165"]', "100");
    await page.getByRole("button", { name: "新增記錄" }).click();
    await page.waitForLoadState("networkidle");

    const nameCell = page.locator("p.text-sm.text-white.truncate", { hasText: name });
    await expect(nameCell).toBeVisible();

    // Click trash button in the same row (sibling of flex-1 div)
    await nameCell.locator("xpath=../..").getByRole("button").click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "確認刪除" }).click();
    await page.waitForLoadState("networkidle");

    await expect(nameCell).not.toBeVisible();
  });
});
