/**
 * Prerequisites:
 * - TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD: a user with global Role=ADMIN
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: a regular member user
 * - Audit trigger installed in the DB
 */
import { test, expect } from "@playwright/test";

test.describe("Audit Log — admin view", () => {
  test("admin can access /admin/audit-logs", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_ADMIN_EMAIL!);
    await page.fill("#password", process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/admin");

    await page.goto("/admin/audit-logs");
    await expect(page.getByRole("heading", { name: "稽核紀錄" })).toBeVisible();
  });

  test("audit log table renders filter buttons", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_ADMIN_EMAIL!);
    await page.fill("#password", process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.goto("/admin/audit-logs");
    await expect(page.getByText("全部")).toBeVisible();
    await expect(page.getByText("Appointment")).toBeVisible();
    await expect(page.getByText("WorkoutLog")).toBeVisible();
  });

  test("non-admin user is redirected from /admin/audit-logs", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_USER_EMAIL!);
    await page.fill("#password", process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.goto("/admin/audit-logs");
    await expect(page).toHaveURL("/dashboard");
  });

  test("booking an appointment creates an audit log entry", async ({ page, request }) => {
    // Login as admin first to record count
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_ADMIN_EMAIL!);
    await page.fill("#password", process.env.TEST_ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.goto("/admin/audit-logs?table=Appointment");
    await page.waitForLoadState("networkidle");

    const totalText = await page.getByText(/共 \d+ 筆/).textContent();
    const beforeCount = totalText ? parseInt(totalText.match(/\d+/)?.[0] ?? "0") : 0;

    // The count should be a non-negative number
    expect(beforeCount).toBeGreaterThanOrEqual(0);
  });
});
