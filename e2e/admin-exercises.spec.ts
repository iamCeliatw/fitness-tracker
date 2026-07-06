/**
 * Admin 動作庫管理 E2E
 * - 測試動作用固定前綴「E2E 測試動作」/「E2E 引用動作」，開場先清除殘留（自癒設計）
 * - 409 測試的引用資料（WorkoutLog + WorkoutLogExercise）由 service key 直接建立，
 *   結束與開場都會清除，不污染共用 dev DB
 */
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { loginAsTestUser } from "./helpers/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const TEST_NAME = "E2E 測試動作";
const REFERENCED_NAME = "E2E 引用動作";
const LOG_MARKER = "E2E-admin-exercises";

async function rest(path: string, init?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...adminHeaders, ...(init?.headers ?? {}) },
  });
  return res;
}

/** 清除本 spec 的所有測試資料（殘留與正常結束都走這裡） */
async function resetTestData() {
  const exRes = await rest(
    `Exercise?name=like.${encodeURIComponent("E2E *")}&select=id`
  );
  const exercises: { id: string }[] = await exRes.json();
  const ids = exercises.map((e) => e.id);

  if (ids.length > 0) {
    const idList = `(${ids.join(",")})`;
    await rest(`WorkoutLogExercise?exerciseId=in.${idList}`, { method: "DELETE" });
  }
  await rest(`WorkoutLog?notes=eq.${LOG_MARKER}`, { method: "DELETE" });
  if (ids.length > 0) {
    await rest(`Exercise?id=in.(${ids.join(",")})`, { method: "DELETE" });
  }
}

async function getUserId(email: string): Promise<string> {
  const rows = await (
    await rest(`User?email=eq.${encodeURIComponent(email)}&select=id`)
  ).json();
  return rows[0].id;
}

/** 建立一個被訓練記錄引用的動作，回傳動作名稱 */
async function seedReferencedExercise() {
  const now = new Date().toISOString();
  const exerciseId = randomUUID();
  const logId = randomUUID();
  const userId = await getUserId(process.env.TEST_USER_EMAIL!);

  await rest("Exercise", {
    method: "POST",
    body: JSON.stringify({
      id: exerciseId,
      name: REFERENCED_NAME,
      muscleGroup: "CHEST",
      category: "STRENGTH",
      isCustom: false,
      createdAt: now,
      updatedAt: now,
    }),
  });
  await rest("WorkoutLog", {
    method: "POST",
    body: JSON.stringify({
      id: logId,
      date: now,
      notes: LOG_MARKER,
      userId,
      createdAt: now,
      updatedAt: now,
    }),
  });
  await rest("WorkoutLogExercise", {
    method: "POST",
    body: JSON.stringify({ id: randomUUID(), logId, exerciseId }),
  });
}

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_ADMIN_EMAIL!);
  await page.fill("#password", process.env.TEST_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/admin");
}

test.describe("Admin exercise management", () => {
  // 暖身：E2E 每次起全新 dev server，/admin/exercises 首次 on-demand 編譯可能超過
  // 預設 timeout，且編譯完成的 HMR reload 會 abort 進行中的導航（ERR_ABORTED）。
  // 先用獨立 context 載一次，正式測試跑在已編譯的 route 上。
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000); // 暖身要吃掉多次首次編譯，放寬 hook timeout
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsAdmin(page);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto("/admin/exercises", { timeout: 60_000 });
        break;
      } catch {
        // 編譯觸發的 reload 造成 abort：重試一次即可命中已編譯的 route
      }
    }
    // API routes 也是首次呼叫才編譯：先各打一發（404 無害），避免正式測試的
    // fetch 卡在編譯超過 timeout
    await page.request.get("/api/admin/exercises", { timeout: 60_000 });
    await page.request.delete("/api/admin/exercises/warmup-nonexistent-id", {
      timeout: 60_000,
    });
    await context.close();
  });

  test.beforeEach(async () => {
    await resetTestData();
  });

  test.afterAll(async () => {
    await resetTestData();
  });

  test("admin can create, edit, and delete an exercise", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/exercises");
    await expect(page.getByRole("heading", { name: "動作庫" })).toBeVisible();

    // 新增
    await page.getByRole("button", { name: "新增動作" }).click();
    await page.fill("#exercise-name", TEST_NAME);
    await page.getByRole("button", { name: "新增", exact: true }).click();

    const row = page.locator("li").filter({ hasText: TEST_NAME });
    await expect(row).toBeVisible();

    // 編輯
    await row.getByRole("button", { name: `編輯 ${TEST_NAME}` }).click();
    await page.fill("#exercise-name", `${TEST_NAME}-改`);
    await page.getByRole("button", { name: "儲存", exact: true }).click();

    const updatedRow = page.locator("li").filter({ hasText: `${TEST_NAME}-改` });
    await expect(updatedRow).toBeVisible();

    // 刪除
    await updatedRow.getByRole("button", { name: `刪除 ${TEST_NAME}-改` }).click();
    await page.getByRole("button", { name: "刪除", exact: true }).click();
    await expect(updatedRow).not.toBeVisible();
  });

  test("deleting a referenced exercise is blocked with an error", async ({ page }) => {
    await seedReferencedExercise();

    await loginAsAdmin(page);
    await page.goto("/admin/exercises");

    const row = page.locator("li").filter({ hasText: REFERENCED_NAME });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: `刪除 ${REFERENCED_NAME}` }).click();
    await page.getByRole("button", { name: "刪除", exact: true }).click();

    await expect(
      page.getByText("此動作已被訓練記錄或計畫使用，無法刪除")
    ).toBeVisible();
    await expect(row).toBeVisible();
  });

  test("non-admin member is redirected away from /admin/exercises", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin/exercises");
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });
});
