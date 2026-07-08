/**
 * 體重追蹤 E2E
 * - 起源：2026-07-08 production bug——BodyRecord insert 送了不存在的 updatedAt 欄位，
 *   新增記錄一律 500（此 spec 先作為 bug 重現，修復後轉綠）
 * - 自癒設計：開場與結束都清除 TEST_USER 的 E2E 標記記錄（weight=61.8 專用值）
 */
import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// E2E 專用辨識值：一般人不會剛好量出這個組合，也方便清除
const E2E_WEIGHT = "61.8";

async function resetBodyRecords() {
  const users = await (
    await fetch(
      `${SUPABASE_URL}/rest/v1/User?email=eq.${encodeURIComponent(
        process.env.TEST_USER_EMAIL!
      )}&select=id`,
      { headers: adminHeaders }
    )
  ).json();
  const userId = users[0]?.id;
  if (!userId) return;
  await fetch(
    `${SUPABASE_URL}/rest/v1/BodyRecord?userId=eq.${userId}&weight=eq.${E2E_WEIGHT}`,
    { method: "DELETE", headers: adminHeaders }
  );
}

test.describe("Body record tracking", () => {
  test.beforeAll(async () => {
    await resetBodyRecords();
  });

  test.afterAll(async () => {
    await resetBodyRecords();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("create a body record and see it in the list", async ({ page }) => {
    await page.goto("/dashboard/body");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("70.5").fill(E2E_WEIGHT);
    await page.getByRole("button", { name: "新增記錄" }).click();

    // 新記錄出現在歷史列表（router.refresh 後）
    await expect(page.getByText(`${E2E_WEIGHT} kg`)).toBeVisible();
    // 表單無錯誤訊息殘留
    await expect(page.getByText("儲存失敗", { exact: false })).not.toBeVisible();
  });

  test("submitting without weight shows validation error", async ({ page }) => {
    await page.goto("/dashboard/body");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "新增記錄" }).click();

    await expect(page.getByText("請輸入體重")).toBeVisible();
  });
});
