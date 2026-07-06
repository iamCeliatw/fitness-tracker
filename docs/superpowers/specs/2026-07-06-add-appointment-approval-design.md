# add-appointment-approval — 預約教練確認制設計

日期：2026-07-06
狀態：設計已確認（brainstorming 完成）

## 問題

目前學員按下預約立刻建立 `CONFIRMED` 預約並回成功，教練沒有確認環節。用戶原話：「按下預約立刻回成功這個很怪，應該是要等教練確認時間」。

## 確認的決策

1. **先到先得，立即鎖定**：學員送出預約後時段即鎖住（slot → `BOOKED`），其他學員不能申請；教練只需對這一筆確認或拒絕。維持 `Appointment.slotId @unique` 不變。
2. **過期規則**：`expiresAt = min(申請時間 + approvalTimeoutHours, 開課前 bookingCutoffHours)`。cutoff 是 PENDING 的最後死線——教練到 cutoff 沒回覆即過期（時段釋出但實際已不可訂，等於空堂）。`approvalTimeoutHours` 為 org 設定，預設 24。
3. **拒絕原因選填**：教練拒絕時可選填一句原因，學員端顯示於預約卡片。
4. **無 cron**：過期用惰性結算——讀取 API 時批次把過期 PENDING 轉 `EXPIRED` 並釋放時段。

## 狀態機

```
學員預約 ──→ PENDING（slot 鎖定為 BOOKED）
              ├─ 教練確認 ──→ CONFIRMED
              ├─ 教練拒絕（選填原因）──→ REJECTED，slot 回 OPEN
              ├─ 過期（惰性結算）──→ EXPIRED，slot 回 OPEN
              └─ 學員/教練取消 ──→ CANCELLED，slot 回 OPEN
CONFIRMED ──取消──→ CANCELLED，slot 回 OPEN（現行為不變）
```

- slot 狀態機不變（`OPEN | BOOKED | CANCELLED`），PENDING 鎖定沿用 `BOOKED`；pending/confirmed 區別由關聯 Appointment 提供
- 學員 overlap 檢查從 `CONFIRMED` 擴為 `PENDING + CONFIRMED`

## Schema 變更（手動 SQL → Supabase SQL Editor，不用 prisma migrate）

- `Appointment.status` 值域擴為 `PENDING | CONFIRMED | REJECTED | EXPIRED | CANCELLED`（String 欄位，改註解）
- `Appointment` 新增 `expiresAt TIMESTAMP NULL`（建立時凍結，org 設定事後修改不溯及既往）、`rejectedReason TEXT NULL`
- `Organization` 新增 `approvalTimeoutHours INTEGER NOT NULL DEFAULT 24`

## API

- `POST /api/appointments`：改建 `PENDING` + 計算 `expiresAt`，其餘檢查（cutoff、overlap、slot 狀態）不變
- 新增 `PATCH /api/appointments/[id]`：body `{ action: "confirm" | "reject", reason?: string }`；僅該預約 `coachId` 本人可操作；僅限 PENDING（否則 409）；reject 釋放 slot 並寫入 `rejectedReason`
- 新增 `src/lib/appointments.ts`：`expireStalePending(orgId)` — 單一 UPDATE 將 `status = PENDING AND expiresAt < now()` 轉 `EXPIRED` + 釋放對應 slots；於 `GET /api/slots`、`GET /api/appointments`、教練 Dashboard 查詢前呼叫
- `/api/admin/settings` GET/PATCH 加入 `approvalTimeoutHours`

## UI

- **學員端** `my-appointment-list`：狀態 badge——待確認（橘）/ 已確認（綠）/ 已拒絕（紅 + 原因）/ 已過期（灰）/ 已取消（灰）；PENDING 仍可取消
- **教練端** `/dashboard/coach`：新增「待確認預約」panel（學員、時段、備註 + 確認/拒絕按鈕；拒絕開 Dialog 選填原因）；本週行程區分 pending / confirmed 樣式
- **Admin** `/admin/settings`：新增「教練回覆期限（小時）」欄位

## 互動視覺規格

- badge 沿用現有配色系統（橘 = 進行中注意、綠 = 成功、紅 = 否定、灰 = 終態）
- 確認/拒絕按鈕至少 `transition-colors`；卡片 `transition-colors duration-150 hover:border-gray-700`
- 拒絕原因 Dialog 用 shadcn 現成 Dialog，無自訂動畫
- 待確認 panel 空狀態：「目前沒有待確認的預約」

## 測試

- 新 E2E（`appointment-approval.spec.ts`）：
  1. happy path：學員預約 → 教練 Dashboard 確認 → 學員端顯示已確認
  2. 拒絕：填原因 → 學員端顯示已拒絕 + 原因、時段重新可訂
  3. 過期：測試中將 `expiresAt` 改為過去 → 觸發讀取 → 顯示已過期、時段釋出
- 既有 spec 需同步修改：`appointment-booking.spec.ts`（預約秒成功斷言）、`audit-log.spec.ts`（booking 建 CONFIRMED 斷言）
- E2E 遵守三規則：auto-waiting 斷言、開場自癒重置、locator 圈定卡片範圍
