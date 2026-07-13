/**
 * Post-login onboarding E2E（add-google-oauth）
 * - 不測 Google 登入本身（Google 登入頁擋自動化）；用 password 帳號觸發同一條攔截路徑
 * - journey：無 membership 登入 → 被導 /onboarding → 建館成 OWNER；
 *   第二人 → 無效邀請碼被擋 → 有效碼加入成 MEMBER；已有 membership 反向導回
 * - 自癒設計：開場清除本 spec 專用帳號（e2e-postlogin- 前綴，admin API 直建、無 membership）
 *   與 org，不碰 TEST_* 帳號
 */
import { test, expect, type Page } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const FOUNDER_EMAIL = "e2e-postlogin-founder@example.com";
const JOINER_EMAIL = "e2e-postlogin-joiner@example.com";
const PASSWORD = "e2e-password";
const GYM_NAME = "E2E PostLogin Gym";

/** 刪掉本 spec 的帳號與 org，再以 admin API 重建「無 membership」帳號 */
async function resetFixtures() {
  for (const email of [FOUNDER_EMAIL, JOINER_EMAIL]) {
    const users = await (
      await fetch(
        `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(email)}&select=id`,
        { headers: adminHeaders }
      )
    ).json();
    const id = users[0]?.id;
    if (!id) continue;
    await fetch(`${SUPABASE_URL}/rest/v1/OrganizationMember?userId=eq.${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${id}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
  }
  await fetch(
    `${SUPABASE_URL}/rest/v1/Organization?name=eq.${encodeURIComponent(GYM_NAME)}`,
    { method: "DELETE", headers: adminHeaders }
  );

  // admin API 直建（跳過 register route）→ 有 auth 帳號、無 membership，模擬 OAuth 首登
  for (const [email, name] of [
    [FOUNDER_EMAIL, "E2E Founder"],
    [JOINER_EMAIL, "E2E Joiner"],
  ]) {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name },
      }),
    });
  }
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
}

test.describe("Post-login onboarding", () => {
  test.beforeAll(async () => {
    await resetFixtures();
  });

  test("journey: intercept → create gym → join by code → reverse guard", async ({
    page,
  }) => {
    test.slow();

    // ── 1. 無 membership 登入 → dashboard layout 攔截導 /onboarding ──
    await login(page, FOUNDER_EMAIL);
    await page.waitForURL(/\/onboarding/);
    await expect(page.getByText("最後一步")).toBeVisible();

    // ── 2. 建館 → 進 dashboard，成為 OWNER（可進 /admin/settings）──
    await page.getByRole("tab", { name: "建立健身房" }).click();
    await page.fill("#orgName", GYM_NAME);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "總覽" })).toBeVisible();

    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "系統設定" })).toBeVisible();
    await expect(page.getByText(GYM_NAME)).toBeVisible();
    const codeLocator = page.locator("span.font-mono");
    await expect(codeLocator).toHaveText(/^[A-Z0-9]{8}$/);
    const inviteCode = (await codeLocator.textContent())!.trim();

    // ── 3. 已有 membership 直進 /onboarding → 反向導回 dashboard ──
    await page.goto("/onboarding");
    await expect(page).toHaveURL("/dashboard");

    // ── 4. 第二人：無效邀請碼 inline 錯誤（edge），停在 /onboarding ──
    await page.context().clearCookies();
    await login(page, JOINER_EMAIL);
    await page.waitForURL(/\/onboarding/);
    await page.getByRole("tab", { name: "我有邀請碼" }).click();
    await page.fill("#inviteCode", "ZZZZZZZZ");
    await page.click('button[type="submit"]');
    await expect(page.getByText("邀請碼無效")).toBeVisible();
    await expect(page).toHaveURL(/\/onboarding/);

    // ── 5. 有效碼加入成 MEMBER → dashboard；MEMBER 進 /admin 被導回 ──
    await page.fill("#inviteCode", inviteCode);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "總覽" })).toBeVisible();
    await page.goto("/admin/settings");
    await expect(page).toHaveURL("/dashboard");
  });
});
