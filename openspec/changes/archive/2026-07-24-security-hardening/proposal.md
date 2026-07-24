## Why

Claude Security 靜態掃描在 API 層發現 22 個漏洞（去重後 14 項可修補的程式碼問題），涵蓋特權提升、IDOR、race condition、輸入驗證缺失等類別，部分 HIGH 嚴重度問題可在不需特殊前置條件下被利用。作為面試 Demo 作品，修補這些問題同時展示對安全設計的認知。

## What Changes

- **BREAKING** `OrganizationMember` 加 `@@unique([userId])` DB constraint（破壞「一人多 org」的假設，但此為設計意圖）
- 邀請碼從 8 hex（32-bit）升到 22 char base64url（128-bit）
- `PATCH /api/admin/members/[id]` 加 rank-vs-rank 比較，防止 ADMIN 降級 OWNER
- `POST /api/appointments` 加 org membership 驗證，防止跨 org 搶 slot
- `POST /api/auth/register` 的 `BOOTSTRAP_ADMIN_EMAIL` 加 secret token 二次驗證
- `bookSchema.notes`、`respondSchema.reason`、所有 registerSchema / onboardingSchema 欄位加 `.max()` 上限
- `POST /api/appointments` slot claim 改為 conditional UPDATE（atomic）
- `GET /api/health` 移除 userCount，改回傳純 `{ status: "ok" }`
- 密碼最低長度從 6 升到 8
- `DELETE /api/slots/[id]` 加現職級驗證（`getOrgContext('COACH')`）
- `GET /api/food-entries` 與 `GET /api/body-records` 驗 date/range query param，無效 → 400

## Capabilities

### New Capabilities

- `api-security-guards`: API 層安全防護——rank check、org membership check、atomic booking、role re-verification on delete
- `input-validation-hardening`: 所有 public/authenticated endpoint 的輸入長度上限與格式驗證

### Modified Capabilities

- `member-onboarding`: 邀請碼 entropy 升級（`generateInviteCode` 產生 128-bit token）
- `org-role-hierarchy`: PATCH member role 加 rank-vs-rank guard，防止 ADMIN 降級 OWNER
- `appointment-booking`: booking POST 加 org check；slot claim 改 atomic；slot DELETE 加職級驗證
- `post-login-onboarding`: onboarding TOCTOU 修補，加 userId unique constraint

## Impact

- **Schema migration**：`OrganizationMember` 加 `UNIQUE(user_id)` — 需在 Supabase SQL Editor 執行
- **API routes**：`admin/members/[id]`、`appointments`、`appointments/[id]`、`slots/[id]`、`auth/register`、`onboarding`、`health`、`food-entries`、`body-records`
- **Lib**：`src/lib/invite-code.ts`
- **Env var**：新增 `BOOTSTRAP_ADMIN_SECRET`（選填，未設則 bootstrap 功能完全停用）
- **Breaking**：邀請碼格式改變，現有 DB 裡的舊 invite code 需更新（seed 會重新產生）
