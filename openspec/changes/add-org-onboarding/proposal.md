## Why

目前註冊寫死加入「最早建立的 Organization」，整個系統實質上是單租戶：無法開第二家健身房，也沒有任何加入指定健身房的途徑。這是商業化 roadmap（多租戶 → Stripe 訂閱）的第一個前置，計費主體是 org，org 必須先能被用戶自助建立。

## What Changes

- 註冊流程分岔：新增「建立我的健身房」（輸入館名 → 建 Organization，註冊者成為 `OWNER`）與「用邀請碼加入」（貼碼 → 加入該 org 成為 `MEMBER`）兩種入口
- **BREAKING** 移除「自動加入最早 org」行為：註冊必須二選一（建館或邀請碼），不再有預設 org fallback
- `Organization` 新增 `inviteCode` 欄位（unique、隨機字串）；OWNER 可在 `/admin/settings` 查看與重置邀請碼（舊碼即刻作廢）
- `requireOrgRole` 語意重構：從「查 (userId, role) 是否存在」改為「查該 user 的唯一 membership，再驗角色」——採一人一館模型（產品層限制，schema 保留多館彈性）
- `/admin/settings` 守門從全域 `requireRole("ADMIN")` 改為 `requireOrgRole("OWNER")`；全域 `ADMIN` 保留為平台 superadmin，其餘 `/admin` 路由不動
- Migration：現有唯一 org 補上 `inviteCode`，既有 memberships（含三個 test accounts）不動

不在本次範圍（屬下一個 change `add-org-data-scoping`）：`orgId` 補到 Exercise/WorkoutLog/BodyRecord/FoodEntry 等資料表、API 全面 org scope 過濾。

## Capabilities

### New Capabilities
- `org-onboarding`: 健身房建立（註冊成為 OWNER）、邀請碼加入、邀請碼查看/重置、org 設定頁的 OWNER 守門

### Modified Capabilities
- `member-onboarding`: 「註冊自動加入預設組織」需求改為「註冊時二選一：建立 org 或邀請碼加入」；既有回填/bootstrap admin 需求不變

## Impact

- Schema：`Organization.inviteCode`（手動 SQL，Supabase SQL Editor 執行）
- API：`POST /api/auth/register`（分岔邏輯）、`/api/admin/settings`（邀請碼查看/重置 + 守門變更）
- Lib：`src/lib/auth-helpers.ts` 的 `requireOrgRole`（呼叫端：slots、appointments、coach/admin 頁面需回歸測試）
- UI：`/register` 表單（二選一入口）、`/admin/settings`（邀請碼區塊）
- Middleware：`src/proxy.ts` 導向邏輯需確認 OWNER（OrgRole）與全域 ADMIN（User.role）並存時的路由行為
- E2E：register spec 需改寫；新增 org-onboarding spec（建館 happy path + 無效邀請碼 edge case）
