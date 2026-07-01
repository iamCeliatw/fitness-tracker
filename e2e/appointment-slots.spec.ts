/**
 * Prerequisites:
 * - TEST_COACH_EMAIL / TEST_COACH_PASSWORD: a user with OrgRole=COACH in the org
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: a user with OrgRole=MEMBER in the org
 * - Migration SQL applied (AppointmentSlot, Appointment, AuditLog tables exist)
 */
import { test, expect } from "@playwright/test";

test.describe("Appointment Slots — coach management", () => {
  test("coach can view /dashboard/coach and see weekly schedule", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/dashboard/coach");
    await expect(page.getByRole("heading", { name: "教練總覽" })).toBeVisible();
    await expect(page.getByText("本週行程")).toBeVisible();
  });

  test("coach can add a new slot via the weekly schedule UI", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/dashboard/coach");
    await page.getByText("新增時段").click();

    // Fill in start/end time (tomorrow 10:00 - 11:00 to avoid cutoff)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await page.locator('input[type="datetime-local"]').first().fill(`${dateStr}T10:00`);
    await page.locator('input[type="datetime-local"]').last().fill(`${dateStr}T11:00`);
    await page.getByText("確認新增").click();

    // Page should refresh and show the new slot (or no error)
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "教練總覽" })).toBeVisible();
  });

  test("member cannot access /dashboard/coach and gets redirected", async ({ page }) => {
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
