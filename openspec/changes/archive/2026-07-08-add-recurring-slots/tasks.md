## 1. 時區修正（前置，完成並驗證後才進行後續）

- [x] 1.1 撰寫 migration SQL：`AppointmentSlot.startTime/endTime/createdAt`、`Appointment.expiresAt/createdAt/cancelledAt` 改 `timestamptz`（`USING <col> AT TIME ZONE 'UTC'`），於 Supabase SQL Editor 執行
- [x] 1.2 `schema.prisma` 對應欄位加 `@db.Timestamptz(3)`，`npx prisma generate`
- [x] 1.3 顯示驗證：UTC 寫入的時段在教練頁與學員預約頁均正確顯示當地時間（由 approval E2E 的 06:15 顯示斷言覆蓋，-8h 偏移消失）
- [x] 1.4 移除 `e2e/appointment-approval.spec.ts` 的 `toLocalIso` workaround（改標準 `toISOString()`），跑 `npm run test:e2e` 確認綠燈（49/49）

## 2. 時段固定一小時

- [x] 2.1 `POST /api/slots` 改為只收 `startTime`，server 計算 `endTime = +1h`（zod schema 同步調整）
- [x] 2.2 `weekly-schedule.tsx` 單次新增表單移除結束時間欄位，只留開始時間
- [x] 2.3 瀏覽器目視驗證：單次表單僅剩開始時間欄位；批次產生的時段顯示 03:30–04:30（長度一小時、時間正確）

## 3. 批次產生 API

- [x] 3.1 新增 `POST /api/slots/batch`：收 `{ startTimes: string[] }`，驗證（COACH role、非空、≤84 筆、合法 ISO、未來時間）
- [x] 3.2 衝突檢查：單次查詢範圍內 OPEN/BOOKED 時段 + 記憶體 overlap 比對（含批次內部自查），無衝突者單次 `.insert([...])`，回傳 `{ created, skipped }`
- [x] 3.3 API 驗證（Playwright request context，7 項）：正常批次、部分衝突、全衝突、超過上限 400、過去時間 400、批次內重複跳過、MEMBER 403

## 4. 批次 UI（每週重複模式）

- [x] 4.1 `weekly-schedule.tsx` 表單加模式切換（單次 / 每週重複），每週重複含週幾 chips 多選 + 開始時間 + 日期區間，樣式依 design.md 互動視覺規格
- [x] 4.2 client 展開邏輯 + 筆數預覽（「將產生 N 筆時段」，0 或 >84 時 disabled）
- [x] 4.3 送出與結果回饋：success banner 顯示成功筆數，有跳過時第二行橘字列出跳過日期
- [x] 4.4 瀏覽器驗證（Playwright + 截圖目視）：批次產生 2 週 4 筆，切到下週確認有排進去；再產生一次全數跳過（橘字列 7/14、7/16、7/21、7/23）

## 5. 教練頁週切換導覽

- [x] 5.1 `coach/page.tsx` 讀 `searchParams.week`（偏移，預設 0），weekStart/weekEnd 依偏移計算
- [x] 5.2 行程面板標題列加 `‹` `›` 導覽與週日期範圍顯示，非本週時顯示「回到本週」連結與「此週尚無排課」空狀態文案
- [x] 5.3 瀏覽器驗證：切到下週看到未來時段與「回到本週」連結（原 bug 的預約場景由 E2E 6.1 覆蓋）

## 6. E2E 測試

- [x] 6.1 新增 `e2e/recurring-slots.spec.ts`：happy path（批次產生 → 週導覽驗證下週有時段）+ edge case（重複產生同批次 → 全數跳過且回饋顯示）
- [x] 6.2 開場自癒重置（清除測試教練專用時段窗的 slots），locator 圈定目標卡片、斷言用 auto-waiting
- [x] 6.3 `npm run test:e2e` 全數綠燈 51/51（含既有 spec；`coach-dashboard.spec.ts` 同步改單欄位表單與「不在此週」文案，時區修正無回歸）
