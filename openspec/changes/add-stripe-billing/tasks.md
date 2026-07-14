## 1. 前置作業（人工，實作前完成）

- [ ] 1.1 Stripe 帳號（test mode）：建 PRO 月費 Product/Price，取得 `STRIPE_PRICE_ID_PRO` 與 `STRIPE_SECRET_KEY`
- [ ] 1.2 Env 三處同步：`.env` 範本 + `.env.local.example` 註明、`.env.local` 實際值（`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID_PRO`）；Vercel 待部署階段設定
- [ ] 1.3 安裝 Stripe CLI 並確認 `stripe listen --forward-to localhost:3000/api/webhooks/stripe` 可跑（whsec 填入 .env.local）

## 2. Schema 與基礎

- [ ] 2.1 `schema.prisma`：Organization 加 `stripeCustomerId String? @unique`、`stripeSubscriptionId String?`、`subscriptionStatus String?`；手寫 ALTER TABLE SQL 於 Supabase SQL Editor 執行；`npx prisma generate`
- [ ] 2.2 `npm install stripe`；建 `src/lib/stripe.ts`（singleton client）
- [ ] 2.3 建 `src/lib/plan.ts`：`PLAN_LIMITS`、`PlanLimitError`、`assertCoachSeatAvailable(admin, orgId)`、`assertRecurringSlotsAllowed(admin, orgId)`

## 3. Billing API

- [ ] 3.1 `POST /api/billing/checkout`：OWNER 守門，建 Checkout session（subscription mode、`STRIPE_PRICE_ID_PRO`、metadata.orgId + client_reference_id、success_url=`/admin/settings?upgraded=1`、cancel_url=`/admin/settings`），回傳 url
- [ ] 3.2 `POST /api/billing/portal`：OWNER 守門，無 stripeCustomerId 回 400，回傳 Portal session url
- [ ] 3.3 `POST /api/webhooks/stripe`：raw body（`req.text()`）+ `constructEvent` 驗簽（失敗 400）；處理 checkout.session.completed / customer.subscription.updated / customer.subscription.deleted，寫入採冪等「設成目標狀態」；本機用 `stripe listen` + `stripe trigger` 驗證三事件

## 4. Plan gating

- [ ] 4.1 `PATCH /api/admin/members/[id]`：升 COACH 前呼叫 `assertCoachSeatAvailable`，PlanLimitError → 403 + code=PLAN_LIMIT；瀏覽器確認 FREE 第 2 位教練被擋、錯誤提示含升級連結
- [ ] 4.2 `POST /api/slots/batch`：開頭呼叫 `assertRecurringSlotsAllowed`，同上 403 處理
- [ ] 4.3 members 頁錯誤顯示：code=PLAN_LIMIT 時提示文案含「升級 PRO 解鎖」連結至 `/admin/settings`
- [ ] 4.4 時段批次建立入口（coach 端）：FREE org 顯示 disabled + 升級說明（不隱藏；需把 org plan 傳進表單元件），單次建立不受影響；瀏覽器目視確認

## 5. Billing UI

- [ ] 5.1 `/admin/settings` 加「方案與帳單」卡片元件（放 InviteCodeCard 之下）：plan badge（FREE 灰／PRO 品牌色）、賣點說明、FREE 顯示「升級 PRO」／PRO 顯示「管理訂閱」；卡片 `transition-colors duration-150 hover:border-gray-700`、按鈕 `transition-colors`
- [ ] 5.2 `?upgraded=1` 且 plan 仍 FREE 時顯示「付款處理中，請稍後重新整理」提示列
- [ ] 5.3 手動全流程驗證（Stripe test mode）：升級 PRO（卡號 4242…）→ webhook 落地 plan=PRO → 卡片變 PRO → Portal 取消 → plan 降回 FREE

## 6. E2E 測試

- [ ] 6.1 `e2e/plan-gating.spec.ts`：開場自我重置 e2e-test-org 的 plan 與教練席次狀態（service key 直寫，自癒 pattern）；happy path：FREE 已有 1 教練時升級第 2 位 → UI 顯示 PLAN_LIMIT 升級提示；edge：service key 把 plan 設 PRO 後同操作成功（結束後還原 FREE）
- [ ] 6.2 batch slots gating：FREE org coach 的批次建立入口 disabled + API 403；PRO 時可用
- [ ] 6.3 settings 方案卡片：FREE 顯示升級按鈕、（service key 設 PRO 後）顯示管理訂閱按鈕，結束還原
- [ ] 6.4 `npm run test:e2e` 全綠（先查 port 3000 殘留）
