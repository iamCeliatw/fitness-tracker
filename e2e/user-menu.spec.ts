/**
 * Prerequisites:
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: a user with OrgRole=MEMBER (not coach)
 * - TEST_COACH_EMAIL / TEST_COACH_PASSWORD: a user with OrgRole=COACH
 */
import { test, expect, type Page } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

// 桌面側欄是唯一含「登出」文字的 nav（mobile header 的登出是 icon-only、bottom tab 無登出），
// 以此圈定 locator 範圍，不假設元素全域唯一
function desktopNav(page: Page) {
  return page.locator("nav").filter({ hasText: "登出" });
}

async function loginAsCoach(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_COACH_EMAIL!);
  await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Dashboard User Menu", () => {
  test("member sees name, 會員 badge, booking link, and can log out", async ({ page }) => {
    await loginAsTestUser(page);

    const nav = desktopNav(page);
    await expect(nav.getByText("LIFTLOG")).toBeVisible();

    // 名字：User.name 為空時 fallback email 前綴（與 layout 邏輯一致）
    const me = await (await page.request.get("/api/auth/me")).json();
    const displayName = me.name || me.email.split("@")[0];
    await expect(nav.getByText(displayName)).toBeVisible();
    await expect(nav.getByText("會員")).toBeVisible();
    await expect(nav.getByRole("link", { name: "預約" })).toBeVisible();

    await nav.getByRole("button", { name: "登出" }).click();
    await page.waitForURL("/login");
  });

  test("member does not see coach link or coach badge", async ({ page }) => {
    await loginAsTestUser(page);

    const nav = desktopNav(page);
    // 先等 nav 渲染完成再斷言不存在，避免頁面未載入時的偽陰性
    await expect(nav.getByRole("link", { name: "預約" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "教練" })).not.toBeVisible();
    await expect(nav.getByText("教練")).not.toBeVisible();
  });

  test("coach sees 教練 badge and coach link", async ({ page }) => {
    await loginAsCoach(page);

    const nav = desktopNav(page);
    await expect(nav.getByRole("link", { name: "教練" })).toBeVisible();
    // badge 是 span（連結內的「教練」是 <a> 直接文字節點），用 span 區分避免 strict mode 衝突
    await expect(nav.locator("span", { hasText: "教練" })).toBeVisible();
    // 桌面側欄不受 5 格限制，教練同時看得到預約
    await expect(nav.getByRole("link", { name: "預約" })).toBeVisible();

    const me = await (await page.request.get("/api/auth/me")).json();
    expect(me.orgRole).toBe("COACH");
  });
});
