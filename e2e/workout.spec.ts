import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Workout log flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("navigate to new workout page from list", async ({ page }) => {
    await page.goto("/dashboard/workout");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "訓練日誌" })).toBeVisible();

    await page.getByRole("link", { name: "新增訓練" }).first().click();
    await expect(page).toHaveURL("/dashboard/workout/new");
  });

  test("create a workout log end-to-end", async ({ page }) => {
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="duration"]', "45");

    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("槓鈴臥推")).toBeVisible();
    await page.getByRole("button", { name: /槓鈴臥推/ }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await page.fill('input[name="exercises.0.sets.0.reps"]', "10");
    await page.fill('input[name="exercises.0.sets.0.weight"]', "80");

    await page.getByRole("button", { name: "儲存訓練" }).click();

    await expect(page).toHaveURL("/dashboard/workout");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/1 個動作・1 組/).first()).toBeVisible();
  });

  test("cannot submit without adding an exercise", async ({ page }) => {
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "儲存訓練" }).click();

    await expect(page.getByText("請至少加入一個動作")).toBeVisible();
    await expect(page).toHaveURL("/dashboard/workout/new");
  });
});
