# 文章素材：add-recurring-slots — 每週重複時段 + 時區地基修正

> Change 週期：2026-07-06 需求確認 → 2026-07-08 ship。分支 `feat/add-recurring-slots`。

## 要解決什麼問題

用戶原話（2026-07-06）：

> 「教練每週都固定時間的話要每週手動新增不太好，看是不是可以一次新增一段時間內的固定時段」
> 「時段先調整成固定一小時」

教練每週固定開課，卻要逐筆手動新增時段，每筆還要填開始、結束兩個 datetime-local——重複勞動且容易漏排。

但動工前先撞到一個更深的坑：**所有時段顯示都偏移 -8 小時**（建 10:00 顯示 02:00）。批次產生建立在「每週二 10:00」這種 wall-time 語意上，時區地基不修，上面蓋什麼都是歪的。所以這個 change 實際包了兩件事：時區修正（前置）+ 重複時段。

## 時區 bug 的完整病理（教學價值最高）

三個環節各自「都沒錯」，串起來就錯了：

1. 欄位是 `TIMESTAMP`（無時區）——Prisma `DateTime` 的預設對應
2. App 寫入 `toISOString()`，值是 UTC
3. PostgREST 讀回無時區欄位時**不帶 `Z` 後綴**，JS `new Date("2026-07-07T02:00:00")` 把它當**本地時間**解析

寫入語意是 UTC、讀回語意變本地 → 台灣（UTC+8）固定偏 -8h。E2E 之前靠 `toLocalIso`（寫入本地 wall time）繞過，等於把錯誤語意寫進測試。

**修法選擇（D1）**：
- ❌ 每個讀取點手動補 `Z`——散彈槍，漏一處錯一處
- ❌ 寫入端改存台灣 wall time——workaround 不是修正
- ✅ 欄位改 `TIMESTAMPTZ`：`ALTER ... USING <col> AT TIME ZONE 'UTC'`（現存值本來就是 UTC 值，型別轉換時標記 UTC 即可，**零資料搬移**）。讀回自帶 `+00:00`，前端顯示程式碼一行都不用改，還能順手刪掉 E2E 的 workaround。

一句話結論：**修 root cause 的 diff 反而最小。**

## 關鍵設計決策與取捨

- **D2 批次展開在 client 做**：`POST /api/slots/batch` 只收 `{ startTimes: string[] }`。瀏覽器原生知道使用者時區，「每週二 10:00」在 client 展開天然正確；若 server 展開，client 要多傳時區 offset、server 多一段易錯換算。時區問題剛咬過一口，這個決策幾乎是反射。
- **D3 衝突檢查一次查詢 + 記憶體比對**：撈出區間內該教練所有 OPEN/BOOKED 時段，記憶體逐筆比 overlap，衝突跳過、無衝突整批單次 `.insert([...])`（Supabase client 無交易，但單次 insert 即原子）。回傳 `{ created, skipped }`，UI 顯示成功筆數 + 跳過日期。check-then-insert 的 race 與現有單筆行為一致，接受。
- **D4 固定一小時**：兩個 API 都只收 startTime，`endTime = startTime + 1h` server 算。Schema 不變（仍存 endTime），既有讀取路徑零改動。BREAKING 但唯一 caller 在同 change 內一併改。
- **D5 週切換導覽**：`/dashboard/coach?week=<offset>`，直接沿用 body 頁 30/90 天切換的 query param pattern。順帶修掉「確認了下週預約卻從畫面上消失」的問題，也是批次產生結果的驗證介面。
- **不做**：批次系列管理（batchId / 刪整批）、月曆視圖、recurrence rule 動態展開——直接具現化成多筆 slot，需要時再補 nullable 欄位。YAGNI。

## SDD 流程怎麼走

explore（時區 bug 病理釐清）→ propose（proposal / design / 3 份 delta specs / 20 tasks）→ apply（migration SQL 手動在 Supabase SQL Editor 執行 → 先驗證 -8h 消失才進後續 task 群）→ QA（E2E 51 綠 + build + lint）→ ship（spec sync + archive + PR）。

Migration 排序是重點：時區轉換排第一個 task 群，**確認既有畫面時間正確後才動批次功能**——地基驗收完才蓋樓。

## 踩到的坑

1. **QA 時 E2E 大規模假死**：51 個測試 40+ 個 30 秒 timeout，只有不需登入的通過。不是 code 壞——是 port 3000 被另一個專案的 dev server 佔用（`reuseExistingServer` 誤認）。關掉佔用者重跑，51/51 全綠。教訓：**測試大面積齊刷刷失敗，先懷疑環境，不要急著看 code**。失敗的「形狀」（全部 30s timeout、只有無登入測試活著）本身就是診斷線索。
2. **E2E workaround 是負債**：`toLocalIso` 當初繞過時區 bug，root cause 修掉後它反而變成錯誤語意的來源，必須同 change 內移除。workaround 要留註解標明「為什麼存在、何時該刪」。
3. **dev DB 測試殘留**：migration 前由 E2E 寫入的 wall-time 資料語意錯誤，靠 E2E 開場自癒重置清掉——「會寫 DB 的測試開場先重置自身狀態」這條防護網規則再次回本。

## 可引用的數字

- 批次上限 84 筆（12 週 × 7 天），超過整批 400
- 一次 `.insert([...])` 寫入，回傳 `{ created: 8, skipped: [] }` 格式
- E2E 51 tests / 4.4 分鐘全綠；新增 recurring-slots spec 2 條（批次建立 + 重複建立全跳過回報）
