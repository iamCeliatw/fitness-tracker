/**
 * Prerequisites:
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD: OrgRole=MEMBER
 * - TEST_COACH_EMAIL / TEST_COACH_PASSWORD: OrgRole=COACH
 * - Migration applied: Appointment.expiresAt / rejectedReason, Organization.approvalTimeoutHours
 *
 * 本 spec 專用時段窗：+21 天的 06:15–07:15（冷門時間，降低與共用 DB 其他資料撞名機率）。
 * 開場自癒重置：刪除該窗內測試教練的 slots 與其 appointments。
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

/**
 * 時間欄位是 TIMESTAMP 無時區，PostgREST 讀回無 Z 後綴、JS 以本地時間解析。
 * 寫入本地 wall time（無 Z）才能讓頁面顯示 06:15（帶 Z 會被 -8h 顯示成 22:15）。
 */
function toLocalIso(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

function slotWindow() {
  const start = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
  start.setHours(6, 15, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

async function getIds() {
  const [coach] = await pg<{ id: string }>(
    `User?email=eq.${encodeURIComponent(process.env.TEST_COACH_EMAIL!)}&select=id`,
  );
  const [student] = await pg<{ id: string }>(
    `User?email=eq.${encodeURIComponent(process.env.TEST_USER_EMAIL!)}&select=id`,
  );
  const [org] = await pg<{ id: string }>(`Organization?slug=eq.e2e-test-org&select=id`);
  return { coachId: coach.id, studentId: student.id, orgId: org.id };
}

/** 自癒重置：清掉專用時段窗內的測試資料（失敗殘留、並行手動測試都可能毒害環境） */
async function resetWindow(coachId: string) {
  const dayStart = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
  const dayEnd = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString();
  const slots = await pg<{ id: string }>(
    `AppointmentSlot?coachId=eq.${coachId}&startTime=gte.${dayStart}&startTime=lte.${dayEnd}&select=id`,
  );
  if (slots.length === 0) return;
  const ids = slots.map((s) => s.id).join(",");
  await pg(`Appointment?slotId=in.(${ids})`, { method: "DELETE" });
  await pg(`AppointmentSlot?id=in.(${ids})`, { method: "DELETE" });
}

async function createOpenSlot(coachId: string, orgId: string) {
  const { start, end } = slotWindow();
  const id = crypto.randomUUID();
  await pg("AppointmentSlot", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      id,
      coachId,
      orgId,
      startTime: toLocalIso(start),
      endTime: toLocalIso(end),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    }),
  });
  return id;
}

async function login(page: Page, email: string, password: string, landing: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(landing);
}

const loginStudent = (page: Page) =>
  login(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!, "/dashboard");
const loginCoach = (page: Page) =>
  login(page, process.env.TEST_COACH_EMAIL!, process.env.TEST_COACH_PASSWORD!, "/dashboard");

/** 學員預約卡片（圈定在「我的預約」區塊 + 專用時段的時間文字） */
function myAppointmentCard(page: Page) {
  return page
    .locator("section", { has: page.getByText("我的預約") })
    .locator("div.rounded-lg")
    .filter({ hasText: "06:15" })
    .first();
}

test.describe("Appointment approval — coach confirmation flow", () => {
  test("student books → pending; coach confirms → student sees confirmed", async ({
    page,
    browser,
  }) => {
    const { coachId, orgId } = await getIds();
    await resetWindow(coachId);
    await createOpenSlot(coachId, orgId);

    // 學員預約
    await loginStudent(page);
    await page.goto("/dashboard/booking");
    const slotCard = page
      .locator("section", { has: page.getByText("可預約時段") })
      .locator("div.rounded-lg")
      .filter({ hasText: "06:15" })
      .first();
    await slotCard.getByRole("button", { name: "預約" }).click();

    // 學員端顯示待確認
    await expect(myAppointmentCard(page).getByText("待確認")).toBeVisible();

    // 教練確認（獨立 context）
    const coachContext = await browser.newContext();
    const coachPage = await coachContext.newPage();
    await loginCoach(coachPage);
    await coachPage.goto("/dashboard/coach");
    const pendingCard = coachPage
      .locator("section", { has: coachPage.getByText("待確認預約") })
      .locator("div.rounded-lg")
      .filter({ hasText: "06:15" })
      .first();
    await pendingCard.getByRole("button", { name: "確認" }).click();
    // 確認後離開待確認 panel
    await expect(pendingCard).not.toBeVisible();
    await coachContext.close();

    // 學員端轉為已確認
    await page.reload();
    await expect(myAppointmentCard(page).getByText("已確認")).toBeVisible();
  });

  test("coach rejects with reason → student sees rejection; slot reopens", async ({
    page,
    browser,
  }) => {
    const { coachId, orgId } = await getIds();
    await resetWindow(coachId);
    await createOpenSlot(coachId, orgId);

    await loginStudent(page);
    await page.goto("/dashboard/booking");
    const availableSection = page.locator("section", { has: page.getByText("可預約時段") });
    await availableSection
      .locator("div.rounded-lg")
      .filter({ hasText: "06:15" })
      .first()
      .getByRole("button", { name: "預約" })
      .click();
    await expect(myAppointmentCard(page).getByText("待確認")).toBeVisible();

    // 教練拒絕並填原因
    const coachContext = await browser.newContext();
    const coachPage = await coachContext.newPage();
    await loginCoach(coachPage);
    await coachPage.goto("/dashboard/coach");
    const pendingCard = coachPage
      .locator("section", { has: coachPage.getByText("待確認預約") })
      .locator("div.rounded-lg")
      .filter({ hasText: "06:15" })
      .first();
    await pendingCard.getByRole("button", { name: "拒絕" }).click();
    await coachPage.locator("#reject-reason").fill("當天有私人行程");
    await coachPage.getByRole("button", { name: "確認拒絕" }).click();
    await expect(pendingCard).not.toBeVisible();
    await coachContext.close();

    // 學員端：已拒絕 + 原因，時段回到可預約列表
    await page.reload();
    const rejectedCard = myAppointmentCard(page);
    await expect(rejectedCard.getByText("已拒絕")).toBeVisible();
    await expect(rejectedCard.getByText("拒絕原因：當天有私人行程")).toBeVisible();
    await expect(
      availableSection.locator("div.rounded-lg").filter({ hasText: "06:15" }).first(),
    ).toBeVisible();

    // 再預約同一時段：Appointment row 已存在（REJECTED、slotId unique）
    // → 走 UPDATE 重啟路徑而非 INSERT，預約需再次成功進入待確認
    await availableSection
      .locator("div.rounded-lg")
      .filter({ hasText: "06:15" })
      .first()
      .getByRole("button", { name: "預約" })
      .click();
    await expect(myAppointmentCard(page).getByText("待確認")).toBeVisible();
  });

  test("pending appointment past expiresAt is settled as expired on read", async ({ page }) => {
    const { coachId, studentId, orgId } = await getIds();
    await resetWindow(coachId);
    const slotId = await createOpenSlot(coachId, orgId);

    // 直接建一筆已逾期的 PENDING（expiresAt 在過去）+ 鎖定 slot
    await pg("Appointment", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        slotId,
        studentId,
        coachId,
        orgId,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }),
    });
    await pg(`AppointmentSlot?id=eq.${slotId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "BOOKED" }),
    });

    // 學員開頁觸發惰性結算 → 已過期、無取消按鈕、時段釋出
    await loginStudent(page);
    await page.goto("/dashboard/booking");
    const expiredCard = myAppointmentCard(page);
    await expect(expiredCard.getByText("已過期")).toBeVisible();
    await expect(expiredCard.getByRole("button", { name: "取消" })).not.toBeVisible();
    await expect(
      page
        .locator("section", { has: page.getByText("可預約時段") })
        .locator("div.rounded-lg")
        .filter({ hasText: "06:15" })
        .first(),
    ).toBeVisible();
  });
});
