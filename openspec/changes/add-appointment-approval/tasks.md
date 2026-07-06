## 1. Schema 與 Migration

- [ ] 1.1 `prisma/schema.prisma`：`Appointment` 加 `expiresAt DateTime?`、`rejectedReason String?`、status 註解擴為 PENDING|CONFIRMED|REJECTED|EXPIRED|CANCELLED；`Organization` 加 `approvalTimeoutHours Int @default(24)`
- [ ] 1.2 手動 SQL 於 Supabase SQL Editor 執行（design.md Migration Plan 的 ALTER TABLE 兩句）→ `npx prisma generate`

## 2. API

- [ ] 2.1 `src/lib/appointments.ts`：`expireStalePending(orgId)` — 查過期 PENDING 的 id+slotId → UPDATE appointments 轉 EXPIRED → UPDATE slots 回 OPEN
- [ ] 2.2 `POST /api/appointments`：改建 PENDING + 計算 expiresAt（min(now+timeout, startTime-cutoff)）；overlap 檢查擴為 PENDING+CONFIRMED
- [ ] 2.3 `PATCH /api/appointments/[id]`：confirm/reject（zod 驗證 action、reason 選填）；coachId 本人限定 403、非 PENDING 409、confirm 前先結算過期；reject 寫 rejectedReason + slot 回 OPEN
- [ ] 2.4 `DELETE /api/appointments/[id]`：補終態守門（REJECTED/EXPIRED/CANCELLED 回 409）
- [ ] 2.5 `GET /api/slots`、`GET /api/appointments`、教練 Dashboard server page：查詢前呼叫 `expireStalePending`
- [ ] 2.6 `/api/admin/settings` GET/PATCH 加 `approvalTimeoutHours`（正整數驗證）

## 3. UI

- [ ] 3.1 `my-appointment-list.tsx`：五狀態 badge（橘/綠/紅/灰/灰）、REJECTED 顯示原因、PENDING/CONFIRMED 才有取消按鈕
- [ ] 3.2 教練 Dashboard「待確認預約」panel：PENDING 列表（學員/時段/備註）+ 確認按鈕 + 拒絕 Dialog（Textarea 選填原因）+ 空狀態「目前沒有待確認的預約」，卡片與按鈕 transition 依 design.md 互動視覺規格
- [ ] 3.3 `weekly-schedule.tsx`：pending 時段橘色系樣式與 confirmed 區隔
- [ ] 3.4 `/admin/settings`：加「教練回覆期限（小時）」欄位

## 4. E2E 測試

- [ ] 4.1 修改既有 spec：`appointment-booking.spec.ts`（預約後斷言待確認狀態）、`audit-log.spec.ts`（booking 建 PENDING 的斷言）
- [ ] 4.2 `e2e/appointment-approval.spec.ts`：happy path — 學員預約 → 教練 panel 確認 → 學員端顯示已確認
- [ ] 4.3 拒絕 path：教練填原因拒絕 → 學員端顯示已拒絕+原因 → 時段重新可預約
- [ ] 4.4 過期 edge case：將 PENDING 的 expiresAt 改為過去 → 觸發讀取 → 學員端顯示已過期、時段釋出
- [ ] 4.5 `npm run test:e2e` 全綠（含既有 43 筆不回歸）
