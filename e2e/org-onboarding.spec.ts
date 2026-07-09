/**
 * Org onboarding E2E
 * - 完整 journey：建館註冊 → OWNER 進 /admin/settings 看邀請碼 → 用碼註冊加入
 *   → 重置邀請碼 → 舊碼註冊被拒
 * - 自癒設計：開場清除本 spec 專用的測試帳號與 org（e2e-onboarding- 前綴），
 *   不碰 TEST_USER / TEST_COACH / TEST_ADMIN 與 e2e-test-org
 */
import { test, expect, type Page } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const OWNER_EMAIL = "e2e-onboarding-owner@example.com";
const MEMBER_EMAIL = "e2e-onboarding-member@example.com";
const PASSWORD = "e2e-password";
const GYM_NAME = "E2E Onboarding Gym";

/** 刪除本 spec 建立的帳號（auth + User 由 cascade/trigger 處理）與 org */
async function resetOnboardingFixtures() {
  for (const email of [OWNER_EMAIL, MEMBER_EMAIL]) {
    const users = await (
      await fetch(
        `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(email)}&select=id`,
        { headers: adminHeaders }
      )
    ).json();
    const id = users[0]?.id;
    if (!id) continue;
    // 先刪 membership，再刪 auth user（GoTrue admin API）
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
}

async function login(page: Page, email: string, urlAfter: string | RegExp) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(urlAfter);
}

async function fillBaseRegisterFields(page: Page, name: string, email: string) {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.fill("#name", name);
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
}

test.describe("Org onboarding", () => {
  test.beforeAll(async () => {
    await resetOnboardingFixtures();
  });

  test("full journey: create gym → invite member → reset code", async ({
    page,
  }) => {
    test.slow(); // 3 次註冊 + 3 次登入的長 journey，預設 30s 不夠


    // ── 1. 建館註冊 ──
    await fillBaseRegisterFields(page, "E2E Owner", OWNER_EMAIL);
    await page.getByRole("tab", { name: "建立健身房" }).click();
    await page.fill("#orgName", GYM_NAME);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/login/);

    // ── 2. OWNER 登入（全域 role 是 USER → /dashboard），可進 /admin/settings ──
    await login(page, OWNER_EMAIL, "/dashboard");
    await page.goto("/admin/settings");
    await expect(
      page.getByRole("heading", { name: "系統設定" })
    ).toBeVisible();
    await expect(page.getByText(GYM_NAME)).toBeVisible();

    // sidebar 渲染 OWNER 的 org 管理項（add-org-data-scoping：成員/動作庫歸 org 管理者）
    await expect(page.getByRole("link", { name: "設定" })).toBeVisible();
    await expect(page.getByRole("link", { name: "成員" })).toBeVisible();
    await expect(page.getByRole("link", { name: "動作庫" })).toBeVisible();

    // 讀取邀請碼（等寬顯示的 8 碼）
    const codeLocator = page.locator("span.font-mono");
    await expect(codeLocator).toHaveText(/^[A-Z0-9]{8}$/);
    const inviteCode = (await codeLocator.textContent())!.trim();

    // ── 3. 登出，用邀請碼註冊加入成 MEMBER ──
    await page.context().clearCookies();
    await fillBaseRegisterFields(page, "E2E Member", MEMBER_EMAIL);
    await page.getByRole("tab", { name: "我有邀請碼" }).click();
    await page.fill("#inviteCode", inviteCode);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/login/);

    await login(page, MEMBER_EMAIL, "/dashboard");
    // MEMBER 訪問 /admin 被導回 dashboard
    await page.goto("/admin/settings");
    await expect(page).toHaveURL("/dashboard");

    // ── 4. OWNER 重置邀請碼，舊碼失效 ──
    await page.context().clearCookies();
    await login(page, OWNER_EMAIL, "/dashboard");
    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "重置邀請碼" }).click();
    await page.getByRole("button", { name: "確認重置" }).click();
    await expect(codeLocator).not.toHaveText(inviteCode);
    await expect(codeLocator).toHaveText(/^[A-Z0-9]{8}$/);

    // 舊碼註冊 → 422 邀請碼無效（用一次性 email，422 不會建帳號所以無殘留）
    await page.context().clearCookies();
    await fillBaseRegisterFields(
      page,
      "E2E Stale",
      "e2e-onboarding-stale@example.com"
    );
    await page.getByRole("tab", { name: "我有邀請碼" }).click();
    await page.fill("#inviteCode", inviteCode);
    await page.click('button[type="submit"]');
    await expect(page.getByText("邀請碼無效")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test("invalid invite code shows error and creates no account", async ({
    page,
  }) => {
    await fillBaseRegisterFields(
      page,
      "E2E Nobody",
      "e2e-onboarding-nobody@example.com"
    );
    await page.getByRole("tab", { name: "我有邀請碼" }).click();
    await page.fill("#inviteCode", "ZZZZZZZZ");
    await page.click('button[type="submit"]');

    await expect(page.getByText("邀請碼無效")).toBeVisible();
    await expect(page).toHaveURL(/\/register/);

    // 不建立任何帳號
    const users = await (
      await fetch(
        `${SUPABASE_URL}/rest/v1/User?email=eq.e2e-onboarding-nobody%40example.com&select=id`,
        { headers: adminHeaders }
      )
    ).json();
    expect(users).toHaveLength(0);
  });
});
