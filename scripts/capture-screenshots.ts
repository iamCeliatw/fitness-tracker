/**
 * README 截圖：對 production 以 demo 帳號登入，截取關鍵頁面。
 * 執行：npx tsx scripts/capture-screenshots.ts [baseURL]
 * 輸出：docs/screenshots/*.png
 */
import { chromium, type Page } from "@playwright/test";
import * as fs from "node:fs";

const BASE = process.argv[2] ?? "https://fitness-tracker-mu-umber.vercel.app";
const OUT = "docs/screenshots";
const PASSWORD = "demo1234";

async function login(page: Page, email: string, landing: string) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`**${landing}`, { timeout: 30_000 });
}

async function shot(page: Page, path: string, name: string, fullPage = false) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500); // 等圖表動畫
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log(`✓ ${name}.png (${path})`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await shot(page, "/", "landing"); // hero 視窗即可，全頁截圖抓不到 scroll 進場動畫

  await login(page, "demo-member@example.com", "/dashboard");
  await shot(page, "/dashboard", "member-dashboard");
  await shot(page, "/dashboard/workout", "workout-log");
  await shot(page, "/dashboard/booking", "booking");
  await ctx.clearCookies();

  await login(page, "demo-coach@example.com", "/dashboard");
  await shot(page, "/dashboard/coach", "coach-dashboard");
  await ctx.clearCookies();

  await login(page, "demo-admin@example.com", "/admin");
  await shot(page, "/admin/exercises", "admin-exercises");

  await browser.close();
  console.log("\n完成 ✓ 截圖存於 " + OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
