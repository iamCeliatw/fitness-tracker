import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Workout UX improvements", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/dashboard/workout/new");
    await page.waitForLoadState("networkidle");
  });

  test("exercise picker dialog has fixed height when switching muscle tabs", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "新增動作" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const boxBefore = await dialog.boundingBox();

    // Switch to a different muscle group tab
    await page.getByRole("tab", { name: "胸" }).click();
    const boxAfter = await dialog.boundingBox();

    // Allow up to 30px variance (e.g. scrollbar appear/disappear), reject large jumps (100px+)
    const heightDiff = Math.abs(
      (boxBefore?.height ?? 0) - (boxAfter?.height ?? 0),
    );
    expect(heightDiff).toBeLessThan(30);
  });

  test("copy button appears from second set, copies previous set values", async ({
    page,
  }) => {
    // Open picker and add an exercise
    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /槓鈴臥推/ }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // First set — no copy button
    const firstSetRow = page
      .locator('[name="exercises.0.sets.0.reps"]')
      .locator("..");
    await expect(
      firstSetRow.getByRole("button", { name: /copy/i }),
    ).not.toBeVisible();

    // Fill first set values
    await page.fill('[name="exercises.0.sets.0.reps"]', "8");
    await page.fill('[name="exercises.0.sets.0.weight"]', "60");

    // Add a second set
    await page.getByRole("button", { name: "新增一組" }).click();

    // Second set should have copy button — click it
    await page
      .locator('[name="exercises.0.sets.1.reps"]')
      .locator("..")
      .getByRole("button")
      .nth(0)
      .click();

    // Verify copied values
    await expect(page.locator('[name="exercises.0.sets.1.reps"]')).toHaveValue(
      "8",
    );
    await expect(
      page.locator('[name="exercises.0.sets.1.weight"]'),
    ).toHaveValue("60");
  });

  test("custom exercise can be created and added to workout", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "新增動作" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Open custom exercise form
    await page.getByRole("button", { name: "新增自訂動作" }).click();
    await expect(page.getByPlaceholder("動作名稱")).toBeVisible();

    // Submit button disabled when name is empty
    const submitBtn = page.getByRole("button", { name: "建立並加入" });
    await expect(submitBtn).toBeDisabled();

    // Fill in custom exercise details
    const uniqueName = `測試動作_${Date.now()}`;
    await page.fill('[placeholder="動作名稱"]', uniqueName);

    // Select muscle group
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "胸" }).click();

    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Dialog should close and exercise added to form (check the exercise card in the form)
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.locator("form").getByText(uniqueName)).toBeVisible();

    // Re-open picker — custom exercise should appear in list (check within dialog)
    await page.getByRole("button", { name: "新增動作" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("dialog").getByText(uniqueName)).toBeVisible();
  });
});
