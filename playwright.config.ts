import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env for anything not in .env.local

import { defineConfig, devices } from "@playwright/test";

// port 3000 可能被其他專案的 dev server 佔用（reuseExistingServer 會誤認），
// 需要時用 E2E_PORT 指定獨立 port，例：E2E_PORT=3100 npm run test:e2e
const PORT = process.env.E2E_PORT ?? "3000";

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  expect: { timeout: 10_000 },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // 直接呼叫 next dev，不經 npm 包裝：Windows 上 Playwright 殺 npm 時
    // 孫子程序可能存活成孤兒，Next 單實例鎖會擋掉下一次啟動
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
