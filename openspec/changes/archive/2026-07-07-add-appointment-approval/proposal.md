## Why

學員按下預約後立刻建立 `CONFIRMED` 預約並回報成功，教練完全沒有確認環節——「按下預約立刻回成功」不符合真實教練排課情境。預約應進入待確認狀態，由教練確認或拒絕後才定案。

## What Changes

- **BREAKING**：`POST /api/appointments` 改建立 `PENDING` 預約（原直接 `CONFIRMED`），時段立即鎖定（先到先得）
- 新增教練確認/拒絕 API（`PATCH /api/appointments/[id]`，拒絕可選填原因）與教練 Dashboard「待確認預約」panel
- 新增過期機制：`expiresAt = min(申請時間 + approvalTimeoutHours, 開課前 bookingCutoffHours)`，逾期未回覆自動轉 `EXPIRED` 並釋放時段（讀取時惰性結算，無 cron）
- `Appointment.status` 值域擴為 `PENDING | CONFIRMED | REJECTED | EXPIRED | CANCELLED`，學員端預約列表顯示對應狀態 badge
- Org 設定新增 `approvalTimeoutHours`（預設 24，`/admin/settings` 可調）
- Schema 變更：`Appointment` 加 `expiresAt`、`rejectedReason`；`Organization` 加 `approvalTimeoutHours`（手動 SQL）
- 既有 E2E 同步修改：`appointment-booking.spec.ts`、`audit-log.spec.ts` 中「預約即成功/CONFIRMED」的斷言

## Capabilities

### New Capabilities
- `appointment-approval`: 預約確認制——PENDING 狀態機（確認/拒絕/過期/取消）、教練回覆 API 與 UI、過期惰性結算、`approvalTimeoutHours` org 設定

### Modified Capabilities
- `appointment-booking`: 預約建立行為改變——送出後為 PENDING（非 CONFIRMED）、學員端狀態 badge 與拒絕原因顯示、overlap 檢查擴及 PENDING
- `coach-dashboard`: 新增「待確認預約」panel（確認/拒絕操作）、本週行程區分 pending/confirmed

## Impact

- API：`src/app/api/appointments/route.ts`（POST 改 PENDING）、新增 `src/app/api/appointments/[id]/route.ts` PATCH、`src/app/api/slots/route.ts` 與 `src/app/api/admin/settings/route.ts`（加惰性結算 / 新設定）
- 新增 `src/lib/appointments.ts`（`expireStalePending`）
- UI：`src/components/booking/my-appointment-list.tsx`、`src/components/coach/`（新 panel）、`src/components/admin/`（settings 表單）
- Schema：`prisma/schema.prisma` + 手動 SQL（Supabase SQL Editor）
- E2E：新增 `e2e/appointment-approval.spec.ts`；修改 `appointment-booking.spec.ts`、`audit-log.spec.ts`
