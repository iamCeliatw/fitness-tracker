## Context

教練排課目前逐筆手動新增（startTime + endTime 兩個 datetime-local），每週固定開課的教練重複勞動。底層存在時區 bug：時間欄位為 `TIMESTAMP`（無時區），app 寫入 `toISOString()`（UTC），PostgREST 讀回無 `Z` 後綴、JS 當本地時間解析，所有時段顯示固定偏移 -8h（E2E 目前以 `toLocalIso` 寫入本地 wall time 繞過）。批次產生建立在「每週二 10:00」wall-time 語意上，時區必須先修正。

教練頁行程面板查詢寫死本週（`coach/page.tsx` 的 `weekStart ~ weekEnd`），已確認的下週預約會從畫面上消失；批次產生多週時段後也無法驗證結果。

相關約束：本機無法 `prisma migrate`（migration SQL 手動於 Supabase SQL Editor 執行）；Supabase JS client 無交易，但批次 insert 單次 `.insert([...])` 即為原子操作。

## Goals / Non-Goals

**Goals:**
- 修正時區地基：booking 相關時間欄位改 `TIMESTAMPTZ`，顯示自動正確
- 時段固定一小時：表單只選開始時間
- 一次產生一段日期區間內的每週固定時段，衝突跳過並回報
- 教練頁行程面板可週切換，涵蓋「查看未來已確認預約」與「驗證批次產生結果」

**Non-Goals:**
- 批次系列管理（batchId、刪整批）——個別刪除已足夠，未來需要時補 nullable 欄位即可
- 月曆視圖——留待未來獨立 change
- 非 booking 資料表的時區轉換（WorkoutLog/FoodEntry/BodyRecord 的 date 為日期語意，另案處理）
- Recurrence rule 儲存與動態展開——直接具現化為多筆 AppointmentSlot

## Decisions

### D1. 時區修正：欄位改 TIMESTAMPTZ（而非讀取端補 Z）
`AppointmentSlot.startTime/endTime/createdAt`、`Appointment.expiresAt/createdAt/cancelledAt` 改為 `timestamptz`，migration 用 `USING <col> AT TIME ZONE 'UTC'`（現存值即為 UTC 值，型別轉換時標記 UTC，不需搬資料）。讀回自帶 `+00:00`，`new Date()` 解析正確，前端顯示程式碼不用改。

替代方案：每個讀取點手動補 `Z`（散彈槍，漏一處錯一處）、寫入端改存台灣 wall time（每個寫入點都要記得不轉 UTC，是 workaround 不是修正）。均否決。

同時移除 `e2e/appointment-approval.spec.ts` 的 `toLocalIso` workaround，改用標準 `toISOString()`。

### D2. 批次展開在 client 做，server 收具體時間清單
`POST /api/slots/batch` 的 body 是 `{ startTimes: string[] }`（ISO 格式，每筆時段 = startTime + 1h）。「週幾 + 時間 + 日期區間 → 具體日期清單」的展開由瀏覽器完成——瀏覽器原生知道使用者時區，「每週二 10:00」的 wall-time 語意在 client 端天然正確，server 完全不需要處理時區換算。

Server 驗證：陣列非空、上限 84 筆（12 週 × 7 天）、每筆為合法 ISO 且在未來。

替代方案：server 收 `{ weekdays, time, dateRange }` 自行展開——需要 client 額外傳時區 offset，server 多一段易錯的換算邏輯。否決。

### D3. 批次衝突檢查：一次查詢 + 記憶體比對，整批單次 insert
先以一次查詢撈出該教練在 `[min(startTimes), max(endTime)]` 範圍內所有 OPEN/BOOKED 時段，在記憶體中逐筆比對 overlap（固定一小時，比對簡單），衝突者跳過；無衝突者一次 `.insert([...])` 寫入。回傳 `{ created: number, skipped: string[] }`（skipped 為被跳過時段的 ISO startTime，UI 轉為日期顯示）。

批次內部自身也要去重/查衝突（同一批展開理論上不重疊，但仍檢查，防 client 亂傳）。

Check 與 insert 之間的 race（另一請求同時建立重疊時段）與現有單筆 POST 相同，接受此限制。

### D4. 固定一小時：server 端計算 endTime
單筆 `POST /api/slots` 與批次 API 都只收 startTime，`endTime = startTime + 1h` 由 server 計算。單筆表單移除結束時間欄位。Slot schema 不變（仍存 endTime），既有讀取路徑零改動。

### D5. 週切換：query param 控制週偏移，沿用 body 頁 pattern
`/dashboard/coach?week=<offset>`（預設 0 = 本週），server component 讀 `searchParams`，`weekStart = startOfWeek(now) + offset 週`。與 body 頁 30/90 天切換同一 pattern（`<Link>` 換 query param，server 重新查詢）。面板標題顯示該週日期範圍（如「7/6 – 7/12」），offset ≠ 0 時提供「回到本週」連結。

### D6. 批次 UI：weekly-schedule 表單加「每週重複」模式
新增時段表單改為兩種模式切換：單次（選一個開始時間）/ 每週重複（週幾多選 chips + 時間 + 日期區間）。展開與筆數預覽（「將產生 N 筆時段」）在 client 完成後送出。

## 互動視覺規格

- **模式切換**（單次 / 每週重複）：pill toggle，選中 `bg-blue-600 text-white`，未選 `text-gray-400 hover:text-white`，`transition-colors`
- **週幾 chips**：多選按鈕（一 ~ 日），選中 `bg-blue-600 border-blue-500 text-white`，未選 `border-gray-700 text-gray-400 hover:border-gray-600`，皆 `transition-colors duration-150`
- **筆數預覽**：表單下方灰字「將產生 N 筆時段（YYYY/M/D ~ YYYY/M/D）」，選滿條件即時更新；N = 0 或超過 84 時送出鈕 disabled
- **結果回饋**：沿用現有綠色 success banner；有跳過時同一 banner 內第二行橘字「N 筆因重疊跳過（7/15、7/22）」
- **週導覽**：面板標題列 `‹` `›` icon 按鈕（`text-gray-500 hover:text-white transition-colors`）+ 中間日期範圍文字；非本週時顯示「回到本週」小連結（`text-blue-400 hover:text-blue-300 transition-colors`）
- **空狀態**：任一週無時段顯示現有「本週尚無排課」樣式，非本週文案改「此週尚無排課」

## Risks / Trade-offs

- [TIMESTAMPTZ migration 影響所有讀取 booking 時間的畫面] → 現存值已是 UTC，`USING ... AT TIME ZONE 'UTC'` 語意正確；migration 後以既有 E2E 全數重跑驗證，並手動目視一個已知時段的顯示時間
- [E2E 移除 toLocalIso 後，舊資料（migration 前由 E2E 寫入的 wall-time 值）語意錯誤] → dev DB 的測試殘留資料由 E2E 自癒重置清掉；正式資料皆由 app 寫入（UTC 語意），不受影響
- [批次 check-then-insert 的 race window] → 與現有單筆行為一致，unique constraint 不存在但實際同教練併發建立場景極少，接受
- [`?week=` offset 無上限] → 查詢本身有範圍界定，任意 offset 只是查到空週，無風險；不做人為上限
- [POST /api/slots BREAKING（不再收 endTime）] → 唯一 caller 是 weekly-schedule.tsx，同 change 內一併修改

## Migration Plan

1. 撰寫 migration SQL（TIMESTAMPTZ 轉換）→ Supabase SQL Editor 執行 → `schema.prisma` 同步改 `@db.Timestamptz` → `npx prisma generate`
2. 確認既有畫面時間顯示正確（原 -8h bug 消失）後，才進行後續 task 群
3. Rollback：`ALTER ... TYPE timestamp USING <col> AT TIME ZONE 'UTC'` 反向轉換即可，無資料損失

## Open Questions

（無——展開端、衝突語意、上限、UI 模式均已決定）
