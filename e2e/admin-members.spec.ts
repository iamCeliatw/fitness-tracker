/**
 * Admin 成員管理 E2E
 * - 使用 test-admin 自己的 membership 做升降測試（不動 TEST_USER / TEST_COACH 的角色，
 *   避免影響其他 spec）
 * - 配對測試結束後將狀態還原（結束配對 + 直接刪除 ENDED 列，保持 DB 乾淨）
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_ADMIN_EMAIL!);
  await page.fill("#password", process.env.TEST_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/admin");
}

test.describe("Admin member management", () => {
  test("member list is visible with role badges", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "成員管理" })
    ).toBeVisible();
    await expect(page.getByText(process.env.TEST_COACH_EMAIL!)).toBeVisible();
    await expect(page.getByText(process.env.TEST_USER_EMAIL!)).toBeVisible();
    await expect(page.getByText("教練", { exact: true }).first()).toBeVisible();
  });

  test("promote member to coach and demote back", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members");
    await page.waitForLoadState("networkidle");

    // 用 test-admin 自己的 membership 列做升降
    const adminRow = page
      .locator("li")
      .filter({ hasText: process.env.TEST_ADMIN_EMAIL! });
    await expect(adminRow.getByText("會員", { exact: true })).toBeVisible();

    await adminRow.getByRole("button", { name: "升為教練" }).click();
    await page.getByRole("button", { name: "確定" }).click();
    await expect(adminRow.getByText("教練", { exact: true })).toBeVisible();

    // 還原：降回會員
    await adminRow.getByRole("button", { name: "降為會員" }).click();
    await page.getByRole("button", { name: "確定" }).click();
    await expect(adminRow.getByText("會員", { exact: true })).toBeVisible();
  });

  test("assign student, demotion guard blocks, end pairing", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/members");
    await page.waitForLoadState("networkidle");

    // 指派學員給 test coach（唯一教練）
    await page.getByRole("button", { name: "指派學員" }).first().click();
    await page.getByRole("combobox").click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "建立配對" }).click();
    await expect(page.getByRole("button", { name: "結束配對" })).toBeVisible();

    // 降級防呆：test coach 有 ACTIVE 配對 → 409 錯誤顯示、角色不變
    const coachRow = page
      .locator("li")
      .filter({ hasText: process.env.TEST_COACH_EMAIL! });
    await coachRow.getByRole("button", { name: "降為會員" }).click();
    await page.getByRole("button", { name: "確定" }).click();
    await expect(page.getByText(/仍有進行中的配對/)).toBeVisible();
    await expect(coachRow.getByText("教練", { exact: true })).toBeVisible();

    // 還原：結束配對
    await page.getByRole("button", { name: "結束配對" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "確定" })
      .click();
    await expect(page.getByText("尚無配對學員")).toBeVisible();

    // DB 清理：刪除 ENDED 配對列
    await fetch(`${SUPABASE_URL}/rest/v1/CoachStudent?status=eq.ENDED`, {
      method: "DELETE",
      headers: adminHeaders,
    });
  });

  test("non-admin is redirected away from /admin/members", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill("#email", process.env.TEST_USER_EMAIL!);
    await page.fill("#password", process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    await page.goto("/admin/members");
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Registration onboarding", () => {
  test("new signup automatically gets MEMBER membership", async ({ page }) => {
    const email = `e2e-onboard-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill("#name", "E2E 註冊測試");
    await page.fill("#email", email);
    await page.fill("#password", "test123456");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/login?registered=true");

    // 驗證 membership 已自動建立
    const users = await (
      await fetch(
        `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(email)}&select=id`,
        { headers: adminHeaders }
      )
    ).json();
    expect(users).toHaveLength(1);

    const memberships = await (
      await fetch(
        `${SUPABASE_URL}/rest/v1/OrganizationMember?userId=eq.${users[0].id}&select=role`,
        { headers: adminHeaders }
      )
    ).json();
    expect(memberships).toHaveLength(1);
    expect(memberships[0].role).toBe("MEMBER");

    // 清理：membership → User → auth user
    await fetch(
      `${SUPABASE_URL}/rest/v1/OrganizationMember?userId=eq.${users[0].id}`,
      { method: "DELETE", headers: adminHeaders }
    );
    await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${users[0].id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${users[0].id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
  });
});
