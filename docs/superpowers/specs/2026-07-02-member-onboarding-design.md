# Member Onboarding — 設計文件

日期：2026-07-02
狀態：使用者已確認設計方向（方案 A + 三項假設）

## 問題

目前「教練／學員／管理員」三種身分都沒有產品化的建立流程：

- 註冊只做 `supabase.auth.signUp`，不建立 `OrganizationMember` → 新用戶不隸屬任何組織
- COACH / MEMBER 身分只能由 E2E setup script 或手動改 DB 產生
- ADMIN 是手動在 Supabase Dashboard 改 `User.role` 來的
- `auth.users → public.User` 的同步 trigger 只存在於線上 DB，SQL 未入版控（重建 DB 註冊會無聲壞掉）

## 已確認的決策

| 決策點 | 結論 |
|--------|------|
| 架構 | **方案 A**：server 註冊 API + 精簡 trigger（商業邏輯在 TS，trigger 只做 User 同步） |
| Bootstrap admin | 環境變數 `BOOTSTRAP_ADMIN_EMAIL`，註冊時 email 相符自動升 ADMIN |
| 管理頁範圍 | 角色管理（升降 COACH）+ CoachStudent 配對管理；不做 UI 升 ADMIN |
| 組織模型 | 單一組織假設：註冊加入「最早建立的 Organization」；不處理多 org |
| 舊帳號 | migration 回填：無 membership 的既有 User → 預設 org MEMBER |

否決方案：B（全塞 DB trigger — trigger 讀不到 env、難測試）、C（首次登入 lazy 補建 — 寫入邏輯放讀取路徑）。

## 設計

### 1. Migration SQL（入版控，手動於 Supabase SQL Editor 執行）

`prisma/migrations/20260702000000_member_onboarding/migration.sql`：

- `CREATE OR REPLACE FUNCTION handle_new_user()` + `DROP TRIGGER IF EXISTS` / `CREATE TRIGGER` on `auth.users`：同步建立 `public."User"`（id, email, name from metadata, role 預設 USER）。此為 canonical 版本，覆蓋線上既有 trigger，idempotent
- 預設 org 不存在則建立（名稱 `LIFTLOG`，`bookingCutoffHours` 預設值）
- 回填：`INSERT INTO "OrganizationMember" ... SELECT` 無 membership 的既有 User → 預設 org MEMBER（`ON CONFLICT DO NOTHING` 等效防重）

### 2. 註冊流程改造

- 新增 `POST /api/auth/register`：
  1. zod 驗證（name / email / password，規則同現有前端 schema）
  2. `supabase.auth.signUp`（anon client，帶 name metadata）→ 失敗回傳對應錯誤（已註冊 → 409）
  3. admin client 查最早的 Organization → 建 `OrganizationMember(role=MEMBER)`
     - 失敗採補償策略：記 console error，不擋註冊（缺 membership 可由之後的 `/api/auth/me` 偵測）
  4. `email === process.env.BOOTSTRAP_ADMIN_EMAIL`（不分大小寫）→ `User.role = 'ADMIN'`
- `register-form.tsx`：改呼叫 `POST /api/auth/register`，錯誤訊息處理保留（「此 Email 已被註冊」），成功後導 `/login?registered=true`（不變）

### 3. Admin 成員管理

**頁面 `/admin/members`**（`requireRole("ADMIN")`；admin-sidebar 加「成員」連結）：

- 成員列表：名字／email／org 角色 badge／加入時間
  - 動作：「升為教練」／「降為會員」，AlertDialog 二次確認
  - 降級防呆：該教練有 ACTIVE 配對或未來 OPEN/BOOKED 時段 → API 回 409，UI 顯示原因
- 配對面板：每位 COACH 一張卡，列 ACTIVE 學員
  - 「指派學員」Dialog：選學員（下拉，排除已配對者）→ 建立 CoachStudent(ACTIVE)
  - 「結束配對」：AlertDialog 確認 → status = ENDED

**API**（皆驗證 ADMIN、`setAuditActor`）：

| Route | 動作 |
|-------|------|
| `GET /api/admin/members` | org 成員 + User 資訊 + 配對摘要 |
| `PATCH /api/admin/members/[id]` | 改 org 角色（COACH↔MEMBER），`[id]` = OrganizationMember.id，降級防呆 409 |
| `POST /api/admin/coach-students` | 建立配對（重複配對 → 409） |
| `PATCH /api/admin/coach-students/[id]` | 結束配對（status=ENDED） |

### 4. 環境變數

`BOOTSTRAP_ADMIN_EMAIL` → `.env` 範本、`.env.local`、部署文件提醒 Vercel 補設。無新測試角色。

## 互動視覺規格

- 列表列／卡片 hover：`transition-colors duration-150 hover:border-gray-700`（同 booking 列表）
- 角色 badge：MEMBER 灰（`border-gray-700 text-gray-400`）、COACH 橘（`bg-orange-500/15 text-orange-400`），同 landing chip 樣式
- 按鈕：至少 `transition-colors`
- 空狀態：無成員／無配對 →「尚無配對學員」灰字置中卡片（同 coach dashboard pattern）
- Dialog / AlertDialog 用既有 shadcn 元件，無自訂動畫

## 錯誤處理

- 註冊：signUp 失敗 → 4xx 對應訊息；membership 建立失敗 → 不擋註冊，log 錯誤
- 降級 409：`{ error: "該教練仍有進行中的配對或未來時段" }`
- 重複配對 409：`{ error: "此學員已配對給該教練" }`
- Supabase JS 無交易：依專案慣例序列操作 + 錯誤補償

## E2E 測試（`e2e/admin-members.spec.ts` + 註冊補充）

- Happy path：admin 登入 → `/admin/members` 列表可見 → 升某 MEMBER 為 COACH → badge 更新 → 指派學員 → 配對出現 → 結束配對
- Edge 1：非 admin 訪問 `/admin/members` → 被導回 `/dashboard`
- Edge 2：降級有 ACTIVE 配對的教練 → 錯誤訊息可見、角色不變
- 註冊流程：新帳號註冊後（隨機 email）登入，`/api/auth/me` 顯示 MEMBER membership
- 測試資料清理：E2E 建立的臨時帳號/配對在測試內自行清理或用隨機值隔離

## 不做的事（YAGNI）

- UI 升全域 ADMIN、多 org 切換、邀請制、email 通知、教練審核流程
- user menu（身分 badge + 登出）為獨立 change `add-user-menu`，不併入
