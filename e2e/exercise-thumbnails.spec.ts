/**
 * Prerequisites:
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: a user with OrgRole=MEMBER
 * - 內建動作已 backfill imageUrl（prisma/migrations/20260714000000_add_exercise_image_url/backfill.sql）
 */
import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Exercise thumbnails", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("built-in exercises show demo photo thumbnails in picker", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    // 內建動作列有示範照（next/image src 含 exercises 路徑）
    const row = dialog.getByRole("button", { name: /槓鈴臥推/ });
    await expect(row.locator('img[src*="exercises"]')).toBeVisible();
    // 清單內至少多筆內建動作有縮圖
    expect(await dialog.locator('img[src*="exercises"]').count()).toBeGreaterThan(5);
  });

  test("custom exercise shows muscle-group fallback square", async ({ page }) => {
    // 建立自訂動作（unique name，共用 DB 不清理，沿用 workout-ux pattern）
    await page.getByRole("button", { name: "新增自訂動作" }).click();
    const uniqueName = `縮圖測試_${Date.now()}`;
    await page.fill('[placeholder="動作名稱"]', uniqueName);
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "胸" }).click();
    await page.getByRole("button", { name: "建立並加入" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // 重開選擇器：自訂動作列顯示 fallback 方塊、無 img
    await page.getByRole("button", { name: "新增動作" }).click();
    const dialog = page.getByRole("dialog");
    const row = dialog.getByRole("button", { name: new RegExp(uniqueName) });
    await expect(row.getByTestId("exercise-thumb-fallback")).toBeVisible();
    await expect(row.locator("img")).toHaveCount(0);
  });
});
