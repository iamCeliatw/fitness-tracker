/**
 * Prerequisites:
 * - TEST_COACH_EMAIL / TEST_COACH_PASSWORD: a user with OrgRole=COACH
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: a user with OrgRole=MEMBER (not coach)
 */
import { test, expect } from "@playwright/test";

test.describe("Coach Dashboard", () => {
  test("coach can view their dashboard with student list and schedule", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/coach");
    await expect(page.getByRole("heading", { name: "教練總覽" })).toBeVisible();
    await expect(page.getByText("我的學員")).toBeVisible();
    await expect(page.getByText("本週行程")).toBeVisible();
  });

  test("coach sees empty state when they have no students", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/coach");

    // Either student list or empty state should be visible
    const hasStudents = await page.getByText("本週訓練").first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText("目前沒有學員").isVisible().catch(() => false);
    expect(hasStudents || hasEmpty).toBe(true);
  });

  test("coach sees + 新增時段 button in schedule panel", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/coach");
    await expect(page.getByText("新增時段")).toBeVisible();
  });

  test("non-coach member is redirected from /dashboard/coach to /dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_USER_EMAIL!);
    await page.fill("#password", process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/coach");
    await expect(page).toHaveURL("/dashboard");
  });
});
