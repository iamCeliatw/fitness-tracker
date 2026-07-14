# Design: add-stripe-billing

## Context

`Organization.plan` 欄位已存在（`FREE | PRO | ENTERPRISE`，default FREE）但無任何讀取者。org 隔離（add-org-data-scoping）已完成：`getOrgContext(minRole)` 是所有 org API 的守門，`/admin/settings` 已是 OWNER 限定頁。本機封鎖 5432/6543，但 Stripe API 與 `stripe listen` 走 HTTPS outbound，不受影響。

計費主體 = org，付費者 = OWNER。探索階段已拍板：FREE 限制 = 教練 1 位上限 + 無週期性時段批次建立。

## Goals / Non-Goals

**Goals:**
- OWNER 可透過 Stripe hosted Checkout 訂閱 PRO（月費）、透過 Customer Portal 管理/取消
- webhook 為 `plan` 唯一寫入來源，訂閱失效自動降 FREE
- FREE gating：教練席次 1、週期性時段停用，擋下時給明確升級提示
- gate 邏輯集中在 `src/lib/plan.ts`，兩個檢查點共用

**Non-Goals:**
- ENTERPRISE 方案（enum 佔位，UI 不出現）
- 發票/收據頁、用量計費、年繳、優惠券（Portal 內建的不另做）
- Stripe Elements / 自組付款表單（一律 hosted 頁面）
- 成員人數上限、audit log 保留期限制（未列入本次賣點）

## Decisions

### D1: Hosted Checkout + Customer Portal，不碰 Elements
零 PCI 負擔、前端零 Stripe SDK（只需 server 端 `stripe` npm 套件）。Checkout session 由 `POST /api/billing/checkout` 建立後 303 redirect；Portal 同理。替代方案 Embedded Checkout 需要 publishable key + 前端元件，對兩顆按鈕的需求是過度工程。

### D2: webhook 是 plan 的唯一真相源
`POST /api/webhooks/stripe`（`stripe.webhooks.constructEvent` 驗簽）處理三個事件：
- `checkout.session.completed` → 存 `stripeCustomerId`/`stripeSubscriptionId`、`plan = PRO`
- `customer.subscription.updated` → 依 `status` 同步 `subscriptionStatus`；`active/trialing` 以外不動 plan（等 deleted）
- `customer.subscription.deleted` → `plan = FREE`

Checkout 成功後的 redirect 頁**不寫 DB**（redirect 可被偽造；webhook 才可信）。redirect 回 `/admin/settings?upgraded=1` 只做樂觀 UI 提示，實際狀態以 DB 為準。org ↔ Stripe 對應靠 Checkout session 的 `metadata.orgId` + `client_reference_id` 雙保險。

### D3: 教練席次的計算口徑
FREE 上限 = `OrganizationMember` 中 `role = 'COACH'` 的**確切筆數 ≥ 1 時擋升級**。OWNER/org-ADMIN 雖然通過 COACH 權限檢查（可開時段、被配對），但不佔教練席次——他們是管理者順便帶課，計入會讓 FREE 連一位專職教練都請不了，賣點失真。

### D4: 失效降級 =「既有不動、擋新增」
降回 FREE 後：超額教練保留 COACH 身分與既有配對/時段，僅 `PATCH` 升級新教練被擋；已建立的週期性時段不刪，僅 `POST /api/slots/batch` 被擋。不做資料回收——實作最簡、對用戶最無害，demo 也好解釋。

### D5: gate helper 形狀
```
src/lib/plan.ts
  PLAN_LIMITS = { FREE: { coachSeats: 1, recurringSlots: false }, PRO: {...} }
  assertCoachSeatAvailable(admin, orgId)  → throws PlanLimitError
  assertRecurringSlotsAllowed(admin, orgId) → throws PlanLimitError
```
API 端 catch `PlanLimitError` → 403 + `{ error, code: "PLAN_LIMIT" }`，UI 以 `code` 判斷顯示升級提示（連到 /admin/settings）。查 plan 直接 select Organization 一次，不做 cache——量級不需要。

### D6: Schema 變更（手寫 SQL → Supabase SQL Editor）
```sql
ALTER TABLE "Organization"
  ADD COLUMN "stripeCustomerId" TEXT UNIQUE,
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "subscriptionStatus" TEXT;
```
皆 nullable（FREE org 全 null）。同步改 `schema.prisma` + `npx prisma generate`。

### D7: Env 與本機開發
`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_ID_PRO` 三處同步（.env 範本 / .env.local / Vercel Production+Preview）。本機 webhook：`stripe listen --forward-to localhost:3000/api/webhooks/stripe`（`stripe listen` 輸出的 whsec 即本機 `STRIPE_WEBHOOK_SECRET`）。webhook route 需讀 raw body 驗簽（`req.text()`，不可先 json parse）。

## 互動視覺規格

- **方案卡片**（/admin/settings，`InviteCodeCard` 之下）：Card 樣式同現有卡片（`transition-colors duration-150 hover:border-gray-700`）。內容：plan badge（FREE=灰、PRO=品牌色）、方案說明一行、按鈕列
  - FREE：主按鈕「升級 PRO」（`transition-colors`）
  - PRO：badge + 次要按鈕「管理訂閱」（開 Portal）
  - `?upgraded=1` 返回時：卡片頂部顯示成功提示列（若 webhook 尚未落地 plan 仍顯示 FREE，提示「付款處理中，稍後重新整理」）
- **升級提示（被 gate 擋下時）**：
  - /admin/members 升 COACH 失敗：既有 toast/錯誤顯示機制 + 文案內含「升級 PRO 解鎖」連結至 /admin/settings
  - recurring slots 表單（coach 端）：FREE org 直接在批次建立入口顯示 disabled 狀態 + 說明文字（不隱藏功能——看得到才有升級動機）；API 403 為第二道防線
- **空狀態**：無（本 change 無列表頁）

## Risks / Trade-offs

- [webhook 未送達（本機忘開 stripe listen / Vercel 端點設錯）→ 付了錢 plan 沒升] → UI 有「付款處理中」提示；Stripe Dashboard 可手動 resend event；D2 的 metadata.orgId 讓 event 可重放
- [webhook 重複投遞] → handler 冪等：所有寫入都是「設成目標狀態」而非累加，重放無害
- [coach 席次檢查與升級寫入非交易（Supabase client 無多步交易）] → race 條件下可能短暫超額；量級（單館後台操作）可忽略，不補償
- [測試帳號狀態污染：E2E 若把 e2e-test-org 升成 PRO 未還原，gating 測試失效] → E2E 開場自我重置 plan（自癒 pattern，service key 直寫 Organization.plan）
- [Stripe test mode 與 prod key 混用] → key 一律走 env，.env 範本註明 test mode

## Migration Plan

1. Schema SQL（D6）於 Supabase SQL Editor 執行 → `prisma generate`
2. 程式部署（gating 對 FREE org 立即生效——現存唯一真實 org 若已有 >1 教練不受影響，D4 口徑只擋新增）
3. Vercel env 三變數設定 → redeploy
4. Stripe Dashboard：建 Product/Price（取得 `STRIPE_PRICE_ID_PRO`）、加 webhook endpoint（production domain `/api/webhooks/stripe`，取得 prod `STRIPE_WEBHOOK_SECRET`）
5. 回滾：拔掉 settings 卡片入口即可；schema 欄位 nullable，留著無害

## Open Questions

- PRO 月費金額（test mode 隨意，正式化再定）——不阻塞實作，暫定 NT$990/月建 Price
