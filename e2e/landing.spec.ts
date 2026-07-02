import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders hero, logo and title without redirect", async ({ page }) => {
    await expect(page).toHaveURL("/");
    await expect(page).toHaveTitle(/LIFTLOG/);
    await expect(
      page.getByRole("heading", { level: 1, name: /把每一組訓練/ })
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "LIFTLOG" })
    ).toBeVisible();
  });

  test("hero CTA navigates to /register", async ({ page }) => {
    await page.getByRole("link", { name: "免費開始" }).first().click();
    await expect(page).toHaveURL("/register");
  });

  test("anchor nav reveals all four feature cards", async ({ page }) => {
    await page.locator("header").getByRole("link", { name: "功能" }).click();
    for (const title of ["訓練日誌", "體重趨勢", "教練預約", "管理後台"]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
  });

  test("nav login button navigates to /login", async ({ page }) => {
    await page.locator("header").getByRole("link", { name: "登入" }).click();
    await expect(page).toHaveURL("/login");
  });
});
