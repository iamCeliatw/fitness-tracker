# Proposal: add-stripe-billing

## Why

`Organization.plan`（FREE | PRO | ENTERPRISE）欄位自建立以來從未被任何功能讀取——平台沒有商業模式的展示點。作為 backlog 商業化路線的最後一個 change，導入 Stripe 訂閱讓 plan 欄位活起來：org 可付費升級 PRO，FREE 方案受功能限制，完成面試 Demo 的商業化故事線。

## What Changes

- **Billing 金流**：OWNER 可從 `/admin/settings` 的「方案與帳單」卡片發起 Stripe hosted Checkout 升級 PRO；PRO org 可開 Stripe Customer Portal 管理/取消訂閱
- **Webhook 同步**：新增 `POST /api/webhooks/stripe`（驗簽），為唯一寫入 `Organization.plan` 的地方；訂閱取消/付款失敗自動降回 FREE
- **Plan gating**（新增 `src/lib/plan.ts` 共用 helper）：
  - FREE org 教練上限 1 位：`/admin/members` 升級 COACH 的 API 在已有 1 位教練時回 403 + 升級提示
  - FREE org 不可使用週期性時段批次建立：`POST /api/slots/batch` 回 403，UI 入口顯示升級提示
  - 訂閱失效採「既有資料不動、只擋新增」：超額教練保留身分，僅無法再新增
- **Schema**：`Organization` 加 `stripeCustomerId`、`stripeSubscriptionId`、`subscriptionStatus`（手寫 SQL → Supabase SQL Editor）
- ENTERPRISE 維持 enum 佔位，UI 不出現

## Capabilities

### New Capabilities
- `org-billing`: Stripe 訂閱生命週期——Checkout 升級、Customer Portal、webhook 同步 plan 狀態、billing UI 卡片
- `plan-gating`: FREE/PRO 功能限制的判定規則與擋下時的升級提示行為

### Modified Capabilities
- `admin-member-management`: 升級成員為 COACH 時新增 plan 限制——FREE org 已有 1 位教練（含 OWNER/org-ADMIN 以上不計？見 design）則拒絕
- `slot-batch-creation`: 批次建立週期性時段改為 PRO 限定，FREE org 呼叫回 403

## Impact

- **Schema**: `Organization` +3 欄位（migration SQL 手動執行）
- **API**: 新增 `/api/billing/checkout`、`/api/billing/portal`、`/api/webhooks/stripe`；修改 `/api/admin/members`（升級 COACH gating）、`/api/slots/batch`（plan gating）
- **UI**: `/admin/settings` 新增方案卡片；recurring slots 表單入口的 FREE 擋下提示
- **依賴**: 新增 `stripe` npm 套件
- **Env**（三處同步：.env 範本 / .env.local / Vercel）: `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_ID_PRO`
- **前置作業**: Stripe 帳號（test mode）+ PRO 月費 Price；本機 webhook 用 `stripe listen` 轉發
- **測試**: E2E 測 gating 路徑；付款流程 Stripe test mode 手動驗證
