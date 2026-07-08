## Context

系統 schema 已是多租戶形狀（Organization / OrganizationMember / OrgRole），但產品層是單租戶：註冊寫死加入最早 org（`register/route.ts`）、`/api/admin/settings` 用無過濾 `.single()` 抓唯一 org、`requireOrgRole` 用 `(userId, role)` 查詢假設單一 membership。本 change 讓 org 可自助誕生、可透過邀請碼加入。

現況確認（2026-07-08 code 勘查）：
- `src/proxy.ts` 只擋未登入，**不做 role 導向**——role 守門在 layout/page 層，middleware 不需改動
- `/admin` layout 守全域 `ADMIN`；`/api/admin/settings` 有自己的 `getAdminUser()`（查 User.role）
- E2E 以 `TEST_ADMIN` 登入測 admin settings

## Goals / Non-Goals

**Goals:**
- 註冊二選一：建立健身房（成為 OWNER）或邀請碼加入（成為 MEMBER）
- 邀請碼可查看/重置（OWNER 於 `/admin/settings`）
- `requireOrgRole` 與 settings API 移除單一 org 假設

**Non-Goals:**
- `orgId` 補到個人資料表、API 全面 org scope（下一個 change `add-org-data-scoping`）
- Email 邀請、邀請待接受狀態、預指派角色（邀請碼加入一律 MEMBER，教練由 OWNER 事後升——升角色 UI 屬 admin-member-management 既有範圍，若缺則列入 data-scoping change）
- 一人多館的產品支援（schema 保留，產品層一人一館）
- org 切換器、login 導向邏輯變更

## Decisions

### D1. 一人一館（產品層）
`requireOrgRole` 改為：查該 user 的**唯一** membership（`.eq("userId", ...).single()`）→ 驗角色是否在允許清單。簽名改為 `requireOrgRole(...roles: OrgRole[])`，回傳 `{ userId, orgId, role, membership }`。
- 理由：砍掉 org switcher、current-org context、個人資料歸屬歧義三大複雜度；DB 的 `@@unique([orgId, userId])` 不變，未來要多館是加功能不是改架構。
- 替代案（一人多館 + cookie current-org）：對 Demo 與 Stripe 前置皆無必要，否決。
- 既有呼叫端（coach dashboard、slots、appointments 的 `requireOrgRole("COACH")` 等）行為不變，只是查詢語意修正。

### D2. 邀請碼而非 email 邀請
`Organization.inviteCode`（TEXT, UNIQUE, NOT NULL）。8 碼大寫英數，產生方式 `crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()`，撞 unique constraint 時重生一次。
- 理由：零新表、零寄信依賴，Demo 展示 30 秒走完；email 邀請需 Invitation 表 + token 生命週期 + 寄信整合。
- 已知天花板：碼外流靠重置補救、不能預指派角色、無待接受狀態。對 Demo 是 YAGNI。

### D3. 註冊分岔與失敗補償
`POST /api/auth/register` 收 `mode: "create" | "join"` + `orgName` 或 `inviteCode`（zod discriminated union）。
- **邀請碼驗證在 `auth.signUp` 之前**：無效碼直接 422，不產生孤兒 auth 帳號（signUp 不可逆，先驗便宜的）。
- signUp 成功後的 org/membership 寫入沿用既有「失敗不擋註冊」pattern：錯誤記 server log，帳號可用、membership 可回填修復。無膜 membership 的用戶進 `/dashboard` 個人功能不受影響，org 功能頁由 `requireOrgRole` redirect 回 dashboard（既有行為）。
- create 模式順序：signUp → insert Organization → insert OrganizationMember(OWNER)。org 成功但 member 失敗時補償刪除該 org（Supabase 無交易，沿用序列 + 補償 pattern）。

### D4. /admin 守門：ADMIN「或」OWNER
- `/admin` layout：全域 `ADMIN` **或** org `OWNER` 可進（否則 redirect `/dashboard`）
- `/admin/settings`（頁 + API）：守 `requireOrgRole("OWNER")`，org 由 membership 的 `orgId` 決定——settings API 的無過濾 `.single()` 一併修掉
- 其餘 `/admin` 頁（audit-logs、members、exercises）維持全域 `ADMIN`；sidebar 依身分只渲染有權限的項目
- 全域 `ADMIN` 定位為平台 superadmin；為了 org context 與 E2E 相容，migration 將 bootstrap admin 的既有 membership 升為 `OWNER`（見 D5）
- 替代案（org 設定另開 `/dashboard/org` 頁）：多一頁 + 兩處設定入口，否決。

### D5. Migration（手動 SQL，Supabase SQL Editor）
1. `ALTER TABLE "Organization" ADD COLUMN "inviteCode" TEXT`
2. 回填：`UPDATE ... SET "inviteCode" = upper(substr(md5(random()::text), 1, 8)) WHERE "inviteCode" IS NULL`
3. `SET NOT NULL` + `ADD CONSTRAINT ... UNIQUE ("inviteCode")`
4. 將 `BOOTSTRAP_ADMIN_EMAIL` 對應 user 的 OrganizationMember 升為 `OWNER`（讓 TEST_ADMIN 能過新守門，其餘 test accounts 不動）
5. 冪等：每步用 `IF NOT EXISTS` / 條件式 UPDATE，可重跑

## 互動視覺規格

- `/register` 二選一入口：shadcn **Tabs**（「建立健身房」/「我有邀請碼」），tab 切換內容用既有表單風格，tab trigger 有 `transition-colors`；切換不清空共用欄位（name/email/password）
- 邀請碼輸入：單一 text input，送出時 trim + 轉大寫；無效碼錯誤顯示在欄位下方（既有 react-hook-form 錯誤樣式）
- `/admin/settings` 邀請碼區塊：卡片式（`transition-colors duration-150 hover:border-gray-700`），顯示目前邀請碼（等寬字體）+「複製」按鈕（點擊後按鈕文字短暫變「已複製」，1.5s 還原）+「重置邀請碼」按鈕
- 重置為破壞性操作：**AlertDialog** 確認（「舊邀請碼將立即失效」），沿用刪除確認的既有 pattern
- 空狀態：migration 後 inviteCode 必存在，無空狀態；API 載入中沿用該頁既有 skeleton/loading 處理

## Risks / Trade-offs

- [`requireOrgRole` 語意變更影響所有呼叫端] → 簽名保持相容（單一 role 參數仍可用），跑既有 booking/coach E2E 回歸
- [邀請碼外流任何人可加入] → OWNER 可重置；Demo 接受此風險，正式化時再加 email 邀請
- [signUp 後寫入失敗產生無 membership 帳號] → 沿用既有可回填設計；org 功能頁已有 redirect 防護
- [migration 後仍只有一家館，第二家館路徑只有 E2E/手動覆蓋] → E2E 必含「建立新健身房 → 用其邀請碼加入」完整流程
- [/admin sidebar 對 OWNER 只剩一項，版面略空] → 接受，多租戶 org 管理頁屬後續 change

## Open Questions

- 無（explore 已定案；OWNER 是否兼任 COACH 權限等角色階層問題留給 add-org-data-scoping）
