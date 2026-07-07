## Why

教練每週固定時間開課，目前必須逐筆手動新增時段（每筆還要填開始與結束兩個時間），重複勞動且容易漏排。同時存在一個底層時間 bug：時間欄位為 TIMESTAMP（無時區），寫入 UTC、讀回被當本地時間解析，所有時段顯示固定偏移 -8 小時——批次產生建立在「每週二 10:00」這種 wall-time 語意上，必須先修正時區地基。

## What Changes

- **時區修正（前置）**：所有時間欄位改為 `TIMESTAMPTZ`（AppointmentSlot.startTime/endTime、Appointment.expiresAt 等），讀回自帶時區標記，顯示自動正確；移除 E2E 中 `toLocalIso` 的 workaround
- **時段固定一小時**：新增時段表單只選開始時間，endTime 自動 +1 小時；API 同步調整（**BREAKING**：POST /api/slots 不再接受自由長度）
- **批次產生重複時段**：教練選擇週幾（可多選）+ 開始時間 + 日期區間（上限 12 週），一次產生區間內所有符合的時段；與現有時段重疊者跳過，回報成功筆數與被跳過的日期
- **教練頁週切換導覽**：本週行程面板加 `‹ 本週 ›` 導覽（query param 控制週偏移），解決「確認了下週預約卻看不見」的問題，同時作為批次產生結果的驗證介面
- 不做：批次系列管理（batchId / 刪整批）、月曆視圖——留待未來獨立 change

## Capabilities

### New Capabilities
- `slot-batch-creation`: 批次產生每週固定重複時段（週幾 + 時間 + 日期區間 → 多筆 slots，衝突跳過並回報）

### Modified Capabilities
- `appointment-slots`: 建立時段改為固定一小時（只提供 startTime）；時間以帶時區格式儲存與回傳，UI 依使用者當地時區正確顯示
- `coach-dashboard`: 本週行程面板改為可週切換導覽（預設本週，可前後翻週）

## Impact

- **Schema / DB**：時間欄位 `TIMESTAMP → TIMESTAMPTZ` 的 migration SQL（手動於 Supabase SQL Editor 執行；現存值即為 UTC，型別轉換時標記 UTC 即可，無需搬移資料）
- **API**：`POST /api/slots`（改固定一小時）、新增 `POST /api/slots/batch`
- **UI**：`src/components/coach/weekly-schedule.tsx`（表單改開始時間 only + 重複模式）、`src/app/dashboard/coach/page.tsx`（週偏移查詢 + 導覽）
- **E2E**：`appointment-approval.spec.ts` 移除 toLocalIso workaround；新增 recurring-slots spec
