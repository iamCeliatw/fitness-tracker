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
    // （auto-waiting 斷言：舊寫法用 isVisible() 立即檢查，頁面慢載入時會 flaky）
    await expect(
      page.getByText("目前沒有學員").or(page.getByText("本週訓練").first())
    ).toBeVisible();
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

test.describe("Coach Dashboard — add slot feedback", () => {
  test("adding a slot outside current week shows success feedback", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_COACH_EMAIL!);
    await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
    await page.goto("/dashboard/coach");
    await page.waitForLoadState("networkidle");

    // 兩週後的時段（必在「本週行程」範圍外，且不與既有時段重疊）
    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;

    await page.getByRole("button", { name: "新增時段" }).click();
    const inputs = page.locator("input[type=datetime-local]");
    await inputs.nth(0).fill(toLocal(start));
    await inputs.nth(1).fill(toLocal(end));
    await page.getByRole("button", { name: "確認新增" }).click();

    // 成功回饋必須可見，且註明不在本週範圍
    await expect(page.getByText(/時段已新增/)).toBeVisible();
    await expect(page.getByText(/不在本週/)).toBeVisible();

    // 清理：刪除剛建立的時段
    await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/AppointmentSlot?startTime=eq.${encodeURIComponent(
        start.toISOString().replace("Z", "")
      )}`,
      {
        method: "DELETE",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
  });
});
