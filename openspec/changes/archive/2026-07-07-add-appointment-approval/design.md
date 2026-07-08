## Context

`POST /api/appointments` 直接建 `CONFIRMED` + slot 轉 `BOOKED`，取消（DELETE）把 slot 放回 `OPEN`。`Appointment.slotId` 是 `@unique`（一時段一預約記錄）；status 欄位是 String + 註解（非 DB enum）。本機無法 `prisma migrate`，schema 變更走手動 SQL。專案無 cron 基礎設施。完整設計討論見 `docs/superpowers/specs/2026-07-06-add-appointment-approval-design.md`。

## Goals / Non-Goals

**Goals:**
- 預約進入 PENDING，教練確認/拒絕後定案；逾期未回自動過期釋放時段
- 兩端 UI 完整呈現五種狀態；教練回覆期限可由 admin 調整

**Non-Goals:**
- 多人競爭同一時段（維持先到先得 + `slotId @unique`）
- 通知系統（email / 站內推播）
- 排程系統（cron）——過期用惰性結算

## Decisions

### D1：先到先得，PENDING 即鎖定時段
學員送出後 slot 直接轉 `BOOKED`，其他人不可申請。維持 `slotId @unique`、slot 狀態機（`OPEN | BOOKED | CANCELLED`）皆不變；pending/confirmed 的區別由關聯 Appointment 的 status 提供。替代方案「多人申請教練擇一」需拆 unique 約束且狀態機複雜度大增，不採用。

### D2：expiresAt 建立時凍結
`expiresAt = min(now + org.approvalTimeoutHours, slot.startTime - org.bookingCutoffHours)`，在 POST 時計算存欄位。查詢過期只需 `status = 'PENDING' AND expiresAt < now()`，不用 join org 設定；org 設定事後修改不溯及既往。cutoff 是 PENDING 的最後死線：到 cutoff 未回覆即過期（時段釋出但已不可訂 = 空堂，符合現實）。

### D3：過期採讀取時惰性結算（無 cron）
新增 `src/lib/appointments.ts` 的 `expireStalePending(orgId)`：先查過期 PENDING 的 id + slotId，再兩個 UPDATE（appointments 轉 `EXPIRED`、slots 回 `OPEN`）。於 `GET /api/slots`、`GET /api/appointments`、教練 Dashboard server page 查詢前呼叫。Supabase client 無交易，順序為先改 appointment 再放 slot（與既有取消流程同向，最壞情況是 slot 晚一次讀取才釋出）。

### D4：教練回覆走 PATCH /api/appointments/[id]
body `{ action: "confirm" | "reject", reason?: string }`。權限：`appointment.coachId === user.id`。狀態守門：僅 PENDING 可操作，且 confirm 前先檢查 `expiresAt`（已過期則先結算、回 409）。reject 寫入 `rejectedReason` 並釋放 slot。不另開新 route，與既有 DELETE 同檔。

### D5：取消（DELETE）擴大適用 PENDING
現有 DELETE 已允許 student/coach 取消並釋放 slot，PENDING 狀態沿用同一路徑，僅補狀態守門（已是終態的預約回 409）。

## Risks / Trade-offs

- [既有 E2E 假設預約秒成功] → `appointment-booking.spec.ts`、`audit-log.spec.ts` 斷言同步改為 PENDING 流程，列入 tasks
- [惰性結算依賴有人讀取] → demo 場景每次進頁面都會觸發；無人讀取時 DB 內殘留過期 PENDING，但任何後續讀取都會先結算，對外行為一致
- [無交易的兩步 UPDATE] → 順序設計成失敗時偏向保守（appointment 已 EXPIRED 但 slot 未釋出），下次結算會補完；不會出現時段被搶但預約還活著
- [status 欄位改預設值] → 保持 DB default 不動，全部由 App 端明確指定 status，避免 SQL 改 default 與舊資料互動的意外

## Migration Plan

1. `prisma/schema.prisma`：`Appointment` 加 `expiresAt DateTime?`、`rejectedReason String?`、status 註解擴值域；`Organization` 加 `approvalTimeoutHours Int @default(24)`
2. 手動 SQL（Supabase SQL Editor）：
   ```sql
   ALTER TABLE "Appointment" ADD COLUMN "expiresAt" TIMESTAMP(3), ADD COLUMN "rejectedReason" TEXT;
   ALTER TABLE "Organization" ADD COLUMN "approvalTimeoutHours" INTEGER NOT NULL DEFAULT 24;
   ```
3. `npx prisma generate`
4. 既有 `CONFIRMED` 資料不受影響（新欄位皆 nullable / 有 default），不需回填

## 互動視覺規格

- 狀態 badge：待確認（橘 `text-orange-400`）/ 已確認（綠）/ 已拒絕（紅，卡片內附原因文字）/ 已過期（灰）/ 已取消（灰），沿用現有 badge 樣式系統
- 確認/拒絕按鈕：`transition-colors`；確認為主色（orange），拒絕為 ghost/紅
- 拒絕原因 Dialog：shadcn Dialog 現成元件，Textarea 選填，無自訂動畫
- 待確認 panel：卡片 `transition-colors duration-150 hover:border-gray-700`；空狀態文字「目前沒有待確認的預約」
- 教練本週行程：pending 時段以橘色系與 confirmed（現行樣式）區隔

## Open Questions

無——過期規則、鎖定策略、拒絕原因皆已於 brainstorming 與用戶確認。
