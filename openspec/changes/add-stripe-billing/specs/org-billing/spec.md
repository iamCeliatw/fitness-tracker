## ADDED Requirements

### Requirement: OWNER 透過 Stripe Checkout 升級 PRO
系統 SHALL 提供 `POST /api/billing/checkout`（`getOrgContext("OWNER")` 守門）：為 caller 的 org 建立 Stripe hosted Checkout session（月費訂閱，`STRIPE_PRICE_ID_PRO`），session 附 `metadata.orgId` 與 `client_reference_id`，並回傳 Checkout URL 供 redirect。成功付款後 Stripe SHALL redirect 回 `/admin/settings?upgraded=1`。

#### Scenario: OWNER 發起升級
- **WHEN** FREE org 的 OWNER 在方案卡片按「升級 PRO」
- **THEN** 系統建立 Checkout session 並將瀏覽器導向 Stripe hosted 付款頁

#### Scenario: 非 OWNER 呼叫 checkout API
- **WHEN** OrgRole 為 ADMIN/COACH/MEMBER 的用戶呼叫 `POST /api/billing/checkout`
- **THEN** 回傳 403，不建立 session

### Requirement: PRO org 透過 Customer Portal 管理訂閱
系統 SHALL 提供 `POST /api/billing/portal`（`getOrgContext("OWNER")` 守門）：以 org 的 `stripeCustomerId` 建立 Stripe Customer Portal session 並回傳 URL。org 無 `stripeCustomerId` 時 SHALL 回 400。

#### Scenario: PRO OWNER 開啟管理訂閱
- **WHEN** PRO org 的 OWNER 按「管理訂閱」
- **THEN** 瀏覽器導向 Stripe Customer Portal，可更新付款方式或取消訂閱

#### Scenario: FREE org 呼叫 portal API
- **WHEN** 無 stripeCustomerId 的 org OWNER 呼叫 `POST /api/billing/portal`
- **THEN** 回傳 400

### Requirement: Webhook 為 plan 狀態唯一寫入來源
系統 SHALL 提供 `POST /api/webhooks/stripe`，以 raw body + `STRIPE_WEBHOOK_SECRET` 驗簽（驗簽失敗回 400）。handler SHALL 冪等（重放同一事件結果不變），並處理：
- `checkout.session.completed`：依 `metadata.orgId` 寫入 `stripeCustomerId`、`stripeSubscriptionId`，`plan` 設為 `PRO`
- `customer.subscription.updated`：同步 `subscriptionStatus`
- `customer.subscription.deleted`：`plan` 設回 `FREE`

Checkout 成功的 redirect 頁面 SHALL NOT 寫入 DB——plan 變更只發生在 webhook。

#### Scenario: 付款完成升級生效
- **WHEN** Stripe 送達 `checkout.session.completed`（含 metadata.orgId）
- **THEN** 該 org 的 plan 變為 PRO，stripeCustomerId/stripeSubscriptionId 被記錄

#### Scenario: 訂閱取消自動降級
- **WHEN** Stripe 送達 `customer.subscription.deleted`
- **THEN** 該 org 的 plan 變回 FREE

#### Scenario: 驗簽失敗
- **WHEN** 請求缺少或帶有無效的 `stripe-signature` header
- **THEN** 回傳 400，不做任何寫入

#### Scenario: 事件重放冪等
- **WHEN** 同一 `checkout.session.completed` 事件被投遞兩次
- **THEN** 第二次處理後 org 狀態與第一次相同，回 200

### Requirement: 方案與帳單卡片
`/admin/settings` SHALL 顯示「方案與帳單」卡片：目前方案 badge（FREE 灰／PRO 品牌色）與方案說明。FREE 顯示「升級 PRO」主按鈕；PRO 顯示「管理訂閱」按鈕。帶 `?upgraded=1` 返回且 plan 尚未更新時 SHALL 顯示「付款處理中」提示而非直接顯示 PRO。

#### Scenario: FREE org 檢視卡片
- **WHEN** FREE org 的 OWNER 造訪 `/admin/settings`
- **THEN** 卡片顯示 FREE badge、PRO 賣點說明（教練無上限、週期性時段）與「升級 PRO」按鈕

#### Scenario: PRO org 檢視卡片
- **WHEN** PRO org 的 OWNER 造訪 `/admin/settings`
- **THEN** 卡片顯示 PRO badge 與「管理訂閱」按鈕，不顯示升級按鈕

#### Scenario: 付款後 webhook 尚未落地
- **WHEN** OWNER 帶 `?upgraded=1` 返回但 DB plan 仍為 FREE
- **THEN** 卡片顯示「付款處理中，請稍後重新整理」提示
