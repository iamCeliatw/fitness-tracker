/**
 * Org data scoping E2E（add-org-data-scoping）
 * - 館自訂動作：OWNER 建立 → 本館 MEMBER 選擇器可見；他館動作不可見（隔離）
 * - 角色階層：OWNER 可進 /dashboard/coach；OWNER 改全域動作 403；MEMBER 打 admin API 403
 * - 自癒設計：開場清掉本 spec 的動作與 org-B 殘留，不假設環境乾淨
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const ORG_EXERCISE_NAME = "E2E館動作測試";
const ORG_B_SLUG = "e2e-scoping-org-b";
const ORG_B_EXERCISE_NAME = "E2E他館動作測試";

async function rest(path: string, init?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: adminHeaders,
    ...init,
  });
  if (!res.ok && init?.method !== "DELETE") {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${await res.text()}`);
  }
  return res;
}

/** 清掉本 spec 的所有殘留（動作 + org-B；org-B 的動作靠 FK CASCADE 一起刪） */
async function resetScopingData() {
  await rest(
    `Exercise?name=in.("${ORG_EXERCISE_NAME}","${ORG_B_EXERCISE_NAME}")`,
    { method: "DELETE" }
  );
  await rest(`Organization?slug=eq.${ORG_B_SLUG}`, { method: "DELETE" });
}

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

const loginAsOwner = (page: import("@playwright/test").Page) =>
  login(page, process.env.TEST_OWNER_EMAIL!, process.env.TEST_OWNER_PASSWORD!);
const loginAsMember = (page: import("@playwright/test").Page) =>
  login(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

test.describe("Org data scoping", () => {
  // 暖身：新 route 首次 on-demand 編譯可能超時（見 admin-exercises.spec 同款）
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000);
    await resetScopingData();
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsOwner(page);
    for (const url of ["/admin/exercises", "/dashboard/coach", "/dashboard/workout/new"]) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await page.goto(url, { timeout: 60_000 });
          break;
        } catch {
          // 編譯觸發 reload 造成 abort：重試命中已編譯 route
        }
      }
    }
    await page.request.get("/api/admin/exercises", { timeout: 60_000 });
    await page.request.get("/api/exercises", { timeout: 60_000 });
    await context.close();
  });

  test.afterAll(async () => {
    await resetScopingData();
  });

  test("owner creates org exercise; org member sees it in picker", async ({
    page,
  }) => {
    await loginAsOwner(page);
    await page.goto("/admin/exercises");
    await expect(page.getByRole("heading", { name: "動作庫" })).toBeVisible();

    // 全域內建動作：唯讀（內建 badge、無操作按鈕）
    const builtinRow = page.locator("li").filter({ hasText: "槓鈴臥推" });
    await expect(builtinRow.getByText("內建")).toBeVisible();
    await expect(
      builtinRow.getByRole("button", { name: /編輯|刪除/ })
    ).toHaveCount(0);

    // 建立館自訂動作
    await page.getByRole("button", { name: "新增動作" }).click();
    await page.fill("#exercise-name", ORG_EXERCISE_NAME);
    await page.getByRole("button", { name: "新增", exact: true }).click();

    const orgRow = page.locator("li").filter({ hasText: ORG_EXERCISE_NAME });
    await expect(orgRow).toBeVisible();
    await expect(orgRow.getByText("內建")).toHaveCount(0);
    await expect(
      orgRow.getByRole("button", { name: `編輯 ${ORG_EXERCISE_NAME}` })
    ).toBeVisible();

    // 本館 MEMBER 的動作選擇器看得到館動作
    await loginAsMember(page);
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByPlaceholder("搜尋動作...").fill(ORG_EXERCISE_NAME);
    await expect(
      page.getByRole("button", { name: new RegExp(ORG_EXERCISE_NAME) })
    ).toBeVisible();
  });

  test("exercises from another org are not visible", async ({ page }) => {
    // 直接以 service key 造他館與他館動作（不需他館登入）
    const orgBId = crypto.randomUUID();
    const now = new Date().toISOString();
    await rest("Organization", {
      method: "POST",
      body: JSON.stringify({
        id: orgBId,
        name: "E2E Scoping Org B",
        slug: ORG_B_SLUG,
        plan: "FREE",
        inviteCode: `EB${Date.now().toString(36).toUpperCase()}`.slice(0, 8),
        bookingCutoffHours: 2,
        createdAt: now,
        updatedAt: now,
      }),
    });
    await rest("Exercise", {
      method: "POST",
      body: JSON.stringify({
        id: crypto.randomUUID(),
        name: ORG_B_EXERCISE_NAME,
        muscleGroup: "CHEST",
        category: "STRENGTH",
        isCustom: false,
        orgId: orgBId,
        createdAt: now,
        updatedAt: now,
      }),
    });

    await loginAsMember(page);
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByPlaceholder("搜尋動作...").fill(ORG_B_EXERCISE_NAME);
    // 先等空狀態出現（auto-waiting），再斷言他館動作不存在
    await expect(page.getByText("找不到符合的動作")).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(ORG_B_EXERCISE_NAME) })
    ).toHaveCount(0);
  });

  test("owner cannot edit or delete a global exercise (403)", async ({
    page,
  }) => {
    await loginAsOwner(page);
    const rows = (await (
      await rest("Exercise?orgId=is.null&isCustom=eq.false&select=id&limit=1")
    ).json()) as { id: string }[];
    const globalId = rows[0].id;

    const patchRes = await page.request.patch(
      `/api/admin/exercises/${globalId}`,
      { data: { name: "hacked" } }
    );
    expect(patchRes.status()).toBe(403);

    const deleteRes = await page.request.delete(
      `/api/admin/exercises/${globalId}`
    );
    expect(deleteRes.status()).toBe(403);
  });

  test("owner can access coach dashboard (role hierarchy)", async ({
    page,
  }) => {
    await loginAsOwner(page);
    await page.goto("/dashboard/coach");
    await expect(
      page.getByRole("heading", { name: "教練總覽" })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/coach/);
  });

  test("member gets 403 from org admin APIs", async ({ page }) => {
    await loginAsMember(page);
    const res = await page.request.get("/api/admin/members");
    expect(res.status()).toBe(403);
  });
});
