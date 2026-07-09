/**
 * Admin 成員管理 E2E
 * - add-org-data-scoping 後成員管理歸 org 管理者（org-ADMIN 以上）：
 *   以 TEST_OWNER（e2e-test-org 的 OWNER，global-setup 確保存在）登入操作
 * - 使用 test-admin 的 membership（org 內是 MEMBER）做升降測試
 *   （不動 TEST_USER / TEST_COACH 的角色，避免影響其他 spec）
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

/** 取得 email 對應的 User id */
async function getUserId(email: string): Promise<string | null> {
  const rows = await (
    await fetch(
      `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(email)}&select=id`,
      { headers: adminHeaders }
    )
  ).json();
  return rows[0]?.id ?? null;
}

/** 刪除 test coach 的所有配對（任何 status）——讓配對測試自癒，不受先前失敗殘留影響 */
async function resetCoachPairings() {
  const coachId = await getUserId(process.env.TEST_COACH_EMAIL!);
  if (!coachId) return;
  await fetch(`${SUPABASE_URL}/rest/v1/CoachStudent?coachId=eq.${coachId}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
}

/** 將 test-admin 自己的 membership 還原為 MEMBER——升降測試中斷或並行手動測試的殘留都會毒害下次執行 */
async function resetAdminMembershipRole() {
  const adminId = await getUserId(process.env.TEST_ADMIN_EMAIL!);
  if (!adminId) return;
  await fetch(
    `${SUPABASE_URL}/rest/v1/OrganizationMember?userId=eq.${adminId}`,
    {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ role: "MEMBER" }),
    }
  );
}

async function loginAsOwner(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_OWNER_EMAIL!);
  await page.fill("#password", process.env.TEST_OWNER_PASSWORD!);
  await page.click('button[type="submit"]');
  // OWNER 的全域 role 是 USER，登入後落在 /dashboard
  await page.waitForURL("/dashboard");
}

test.describe("Admin member management", () => {
  test.beforeAll(async () => {
    await resetAdminMembershipRole();
  });

  test("member list is visible with role badges", async ({ page }) => {
    await loginAsOwner(page);
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
    await loginAsOwner(page);
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
    await resetCoachPairings();
    await loginAsOwner(page);
    await page.goto("/admin/members");
    await page.waitForLoadState("networkidle");

    // 指派學員給 test coach（locator 圈定在 test coach 的配對卡片，
    // 避免環境中其他教練/配對造成 strict mode 衝突）
    const pairingSection = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "教練配對" }) });
    const coachCard = pairingSection
      .locator("div.rounded-lg")
      .filter({ hasText: "test coach" })
      .first();

    await coachCard.getByRole("button", { name: "指派學員" }).click();
    await page.getByRole("combobox").click();
    await page.getByRole("option").first().click();
    // 選中後 trigger 應顯示學員名稱，而非 userId
    await expect(page.getByRole("combobox")).toContainText(/test (member|admin)/);
    await expect(page.getByRole("combobox")).not.toContainText(
      /[0-9a-f]{8}-[0-9a-f]{4}/
    );
    await page.getByRole("button", { name: "建立配對" }).click();
    await expect(
      coachCard.getByRole("button", { name: "結束配對" }).first()
    ).toBeVisible();

    // 降級防呆：test coach 有 ACTIVE 配對 → 409 錯誤顯示、角色不變
    const coachRow = page
      .locator("li")
      .filter({ hasText: process.env.TEST_COACH_EMAIL! });
    await coachRow.getByRole("button", { name: "降為會員" }).click();
    await page.getByRole("button", { name: "確定" }).click();
    await expect(page.getByText(/仍有進行中的配對/)).toBeVisible();
    await expect(coachRow.getByText("教練", { exact: true })).toBeVisible();

    // 還原：結束配對（同樣圈定在 test coach 卡片）
    await coachCard.getByRole("button", { name: "結束配對" }).first().click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "確定" })
      .click();
    await expect(coachCard.getByText("尚無配對學員")).toBeVisible();

    // DB 清理：刪除 test coach 的配對殘留
    await resetCoachPairings();
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

// 「新註冊自動加入預設組織」需求已由 add-org-onboarding 移除，
// 新註冊行為（建館成 OWNER / 邀請碼加入成 MEMBER）由 org-onboarding.spec.ts 覆蓋
