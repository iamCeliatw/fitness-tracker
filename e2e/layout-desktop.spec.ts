import { test, expect } from "@playwright/test";

test.describe("Desktop layout — Dashboard Nav", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_USER_EMAIL!);
    await page.fill("#password", process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("桌面尺寸顯示左側 Nav，隱藏底部 Tab", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard");

    // Desktop left nav visible
    const desktopNav = page.locator("nav.hidden.md\\:flex");
    await expect(desktopNav).toBeVisible();

    // Mobile bottom tab hidden
    const mobileTab = page.locator("nav.fixed.bottom-0");
    await expect(mobileTab).toBeHidden();
  });

  test("手機尺寸隱藏左側 Nav，顯示底部 Tab", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");

    // Desktop left nav hidden
    const desktopNav = page.locator("nav.hidden.md\\:flex");
    await expect(desktopNav).toBeHidden();

    // Mobile bottom tab visible
    const mobileTab = page.locator("nav.fixed.bottom-0");
    await expect(mobileTab).toBeVisible();
  });

  test("進入 /dashboard/workout，訓練項目呈現 active 樣式", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/dashboard/workout");

    const workoutLink = page.locator("nav.hidden.md\\:flex a[href='/dashboard/workout']");
    await expect(workoutLink).toHaveClass(/text-orange-400/);
  });
});
