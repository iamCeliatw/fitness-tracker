import type { Page } from "@playwright/test";

export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_USER_EMAIL!);
  await page.fill("#password", process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}
