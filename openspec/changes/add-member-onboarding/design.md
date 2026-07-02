## Context

現況（2026-07-02 調查確認）：

- 註冊 = client-side `supabase.auth.signUp`（`register-form.tsx:47`），`src/app/api/auth/register/` 是空目錄
- `User` row 由線上 DB 的 trigger 自動建立，但該 trigger SQL 不在版控內
- `OrganizationMember` / `CoachStudent` 沒有任何產品寫入路徑；ADMIN 靠手動改 DB
- 線上 DB 已有一個 Organization 與 5 個 User（2 個真人帳號無 membership）
- 專案慣例：runtime 全用 Supabase client（HTTPS）、無交易改序列操作＋補償、migration SQL 手寫並於 Supabase SQL Editor 執行

使用者已確認設計（詳見 `docs/superpowers/specs/2026-07-02-member-onboarding-design.md`）。

## Goals / Non-Goals

**Goals:**
- 註冊自動取得組織身分（預設 org 的 MEMBER）
- Bootstrap admin 可由環境變數重現（重建 DB／新環境不再手動改資料）
- 管理員能在 UI 完成教練任命與教練↔學員配對
- trigger SQL 成為版控內的 canonical 版本

**Non-Goals:**
- UI 升全域 ADMIN、多 org、邀請制、email 通知、教練審核
- user menu（身分顯示 + 登出）→ 獨立 change `add-user-menu`

## Decisions

### D1：商業邏輯放 server API，trigger 只做同步（方案 A）
`handle_new_user` trigger 僅負責 `auth.users → public."User"`。org 加入與 admin 升級放 `POST /api/auth/register`（TS 能讀 env、能被 E2E 覆蓋）。
（否決：B 全塞 trigger — 讀不到 Vercel env、難測試；C 首次登入 lazy 補建 — 寫入邏輯進讀取路徑。）

### D2：Bootstrap admin 用 `BOOTSTRAP_ADMIN_EMAIL`
註冊時 email 不分大小寫比對，相符則 `User.role = 'ADMIN'`。冪等：已是 ADMIN 不重複寫。

### D3：單一組織假設
「預設 org」= `Organization ORDER BY "createdAt" ASC LIMIT 1`。migration 保證至少存在一個（不存在則建 `LIFTLOG`）。

### D4：membership 建立失敗不擋註冊
signUp 成功後建 membership 失敗 → log error、註冊仍回成功（帳號已存在，擋了也無法回滾 auth user）。缺 membership 屬可修復狀態。

### D5：降級防呆
COACH → MEMBER 前檢查：無 ACTIVE CoachStudent 且無未來 OPEN/BOOKED AppointmentSlot，違反回 409。

### D6：回填既有用戶
migration 內 `INSERT ... SELECT` 把無 membership 的 User 全部補為預設 org MEMBER（防重：`WHERE NOT EXISTS`）。

### D7：audit trigger 補掛
既有 `audit_trigger_fn` 只掛在 Appointment／AppointmentSlot／WorkoutLog。migration 以相同 pattern（`DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`）補掛 `OrganizationMember` 與 `CoachStudent`，角色升降與配對操作才會留痕。

## 架構

```
註冊：register-form → POST /api/auth/register
        1. zod 驗證
        2. anon client signUp（name metadata）──→ DB trigger 建 User row
        3. admin client：查預設 org → INSERT OrganizationMember(MEMBER)
        4. email == BOOTSTRAP_ADMIN_EMAIL → UPDATE User.role='ADMIN'

管理：/admin/members（requireRole ADMIN）
        ├─ GET   /api/admin/members            成員列表＋配對摘要
        ├─ PATCH /api/admin/members/[id]       org 角色（[id]=OrganizationMember.id）
        ├─ POST  /api/admin/coach-students     建立配對（重複→409）
        └─ PATCH /api/admin/coach-students/[id] 結束配對（status=ENDED）
```

新增檔案：`src/app/admin/members/page.tsx`、`src/components/admin/member-list.tsx`、`src/components/admin/coach-pairing-panel.tsx`、`src/app/api/auth/register/route.ts`、admin API routes、`prisma/migrations/20260702000000_member_onboarding/migration.sql`。
修改：`register-form.tsx`（改打 API）、`admin-sidebar.tsx`（加「成員」連結）。

## 互動視覺規格

- 列表列／卡片 hover：`transition-colors duration-150 hover:border-gray-700`（同 booking 列表）
- 角色 badge：MEMBER 灰（`border-gray-700 text-gray-400`）、COACH 橘（`bg-orange-500/15 text-orange-400`）
- 按鈕至少 `transition-colors`；升降角色與結束配對用 AlertDialog 二次確認
- 空狀態：無配對 →「尚無配對學員」灰字置中（同 coach dashboard pattern）
- Dialog / AlertDialog 用既有 shadcn 元件

## Risks / Trade-offs

- [signUp 成功但 membership 寫入失敗 → 半完成帳號] → D4：不擋註冊 + log；資料可由 admin 或重跑回填 SQL 修復
- [覆蓋線上既有 trigger 定義未知，CREATE OR REPLACE 可能改變行為] → 執行前先在 Supabase Dashboard 抄下現行定義備查；新版功能為超集（User 同步不變）
- [E2E 註冊測試產生殘留帳號] → 用隨機 email + 測試內清理（admin client delete）
- [BOOTSTRAP_ADMIN_EMAIL 沒設] → 純略過升級邏輯，不報錯

## Migration Plan

1. commit migration SQL → 手動於 Supabase SQL Editor 執行（idempotent，可重跑）
2. Vercel 補 `BOOTSTRAP_ADMIN_EMAIL` env
3. rollback：revert commits；trigger 可重跑舊定義還原（備查副本）
