/**
 * Prerequisites:
 * - TEST_COACH_EMAIL / TEST_COACH_PASSWORD: OrgRole=COACH
 * - Migration applied: booking 時間欄位 timestamptz
 *
 * 本 spec 專用時段窗：下週一起 14 天內的每週二、四 04:45（冷門時間，
 * 與 approval spec 的 06:15 錯開）。開場自癒重置：刪除該窗內測試教練 04:00–06:00 的 slots。
 */
import { test, expect, type Page } from "@playwright/test";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function pg<T = unknown>(path: string, init?: RequestInit): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 測試區間：下週一起 14 天（必含 2 個週二 + 2 個週四 = 4 筆） */
function testRange() {
  const from = new Date();
  from.setDate(from.getDate() + (((8 - from.getDay()) % 7) || 7));
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 13);
  return { from, to };
}

/** 自癒重置：清掉測試窗內 04:00–06:00 的測試教練 slots（失敗殘留會毒害下次執行） */
async function resetWindow(coachId: string) {
  const { from, to } = testRange();
  const lo = new Date(from);
  lo.setHours(4, 0, 0, 0);
  const hi = new Date(to);
  hi.setHours(6, 0, 0, 0);
  const slots = await pg<{ id: string }>(
    `AppointmentSlot?coachId=eq.${coachId}&startTime=gte.${lo.toISOString()}&startTime=lte.${hi.toISOString()}&select=id`,
  );
  if (slots.length === 0) return;
  const ids = slots.map((s) => s.id).join(",");
  await pg(`Appointment?slotId=in.(${ids})`, { method: "DELETE" });
  await pg(`AppointmentSlot?id=in.(${ids})`, { method: "DELETE" });
}

async function getCoachId() {
  const [coach] = await pg<{ id: string }>(
    `User?email=eq.${encodeURIComponent(process.env.TEST_COACH_EMAIL!)}&select=id`,
  );
  return coach.id;
}

async function loginCoach(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", process.env.TEST_COACH_EMAIL!);
  await page.fill("#password", process.env.TEST_COACH_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

/** 行程面板（圈定 section，共用 DB 裡同類卡片隨時可能出現在別區） */
function schedulePanel(page: Page) {
  return page.locator("section", { has: page.getByRole("link", { name: "下一週" }) });
}

async function submitRecurringBatch(page: Page) {
  const { from, to } = testRange();
  await page.getByRole("button", { name: "新增時段" }).click();
  await page.getByRole("button", { name: "每週重複" }).click();
  // 未選任何條件時送出鈕 disabled（空展開）
  await expect(page.getByRole("button", { name: /產生 0 筆時段/ })).toBeDisabled();
  await page.getByRole("button", { name: "二", exact: true }).click();
  await page.getByRole("button", { name: "四", exact: true }).click();
  await page.locator('input[type="time"]').fill("04:45");
  const dates = page.locator('input[type="date"]');
  await dates.nth(0).fill(dateStr(from));
  await dates.nth(1).fill(dateStr(to));
  await expect(page.getByText("將產生 4 筆時段")).toBeVisible();
  await page.getByRole("button", { name: "產生 4 筆時段" }).click();
}

test.describe("Recurring slots — batch creation and week navigation", () => {
  test("coach batch-creates weekly slots and sees them via week navigation", async ({ page }) => {
    await resetWindow(await getCoachId());
    await loginCoach(page);
    await page.goto("/dashboard/coach");

    await submitRecurringBatch(page);
    await expect(page.getByText("已產生 4 筆時段")).toBeVisible();

    // 週導覽：下週應有 2 筆 04:45 時段（原「確認的未來行程看不見」bug 的可見性驗證）
    await page.getByRole("link", { name: "下一週" }).click();
    const nextWeekCards = schedulePanel(page)
      .locator("div.rounded-lg")
      .filter({ hasText: "04:45" });
    await expect(nextWeekCards).toHaveCount(2);
    await expect(page.getByRole("link", { name: "回到本週" })).toBeVisible();

    // 回到本週後導覽連結消失
    await page.getByRole("link", { name: "回到本週" }).click();
    await expect(page.getByRole("link", { name: "回到本週" })).not.toBeVisible();
  });

  test("re-creating the same batch skips all occurrences and reports them", async ({ page }) => {
    await resetWindow(await getCoachId());
    await loginCoach(page);
    await page.goto("/dashboard/coach");

    await submitRecurringBatch(page);
    await expect(page.getByText("已產生 4 筆時段")).toBeVisible();

    // 同一批次再送一次 → 全數因重疊跳過，橘字回饋列出日期
    await submitRecurringBatch(page);
    await expect(page.getByText("已產生 0 筆時段")).toBeVisible();
    await expect(page.getByText(/4 筆因重疊跳過（/)).toBeVisible();
  });
});
