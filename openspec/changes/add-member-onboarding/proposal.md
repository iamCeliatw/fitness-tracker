## Why

三種身分（管理員／教練／學員）目前都沒有產品化的建立流程：註冊只做 `auth.signUp` 不建立組織身分，COACH/MEMBER 只能靠測試 script 或手動改 DB，ADMIN 是手動改資料庫來的；且 `auth.users → public.User` 同步 trigger 只存在線上 DB、SQL 未入版控，重建 DB 時註冊會無聲壞掉。預約系統要能真正運作，身分生命週期必須補完。

## What Changes

- 新增 `POST /api/auth/register`：signUp 後自動將新用戶以 MEMBER 加入預設組織；email 符合 `BOOTSTRAP_ADMIN_EMAIL` 時自動升為全域 ADMIN
- `register-form.tsx` 改呼叫註冊 API（原本直接呼叫 supabase client signUp）
- 新增 `/admin/members` 成員管理頁：成員列表、升降 COACH（含降級防呆）、CoachStudent 配對指派與結束
- 新增 admin API：`GET/PATCH /api/admin/members`、`POST/PATCH /api/admin/coach-students`
- Migration SQL 入版控：canonical `handle_new_user` trigger、預設 org 建立、既有無 membership 用戶回填為 MEMBER
- 新增環境變數 `BOOTSTRAP_ADMIN_EMAIL`
- 新增 E2E 測試 `e2e/admin-members.spec.ts` 與註冊 membership 驗證

## Capabilities

### New Capabilities
- `member-onboarding`: 註冊自動入 org（MEMBER）、bootstrap admin 升級、User 同步 trigger 版控與既有用戶回填
- `admin-member-management`: 管理員的成員列表、org 角色升降（含防呆）、教練學員配對管理

### Modified Capabilities

（無 — main specs 中無 user-registration capability，註冊行為變更全部落在新的 `member-onboarding` spec）

## Impact

- **程式碼**：`src/app/api/auth/register/`（原空目錄補實作）、`src/app/admin/members/`、`src/app/api/admin/members/`、`src/app/api/admin/coach-students/`、`src/components/admin/`（成員列表、配對面板）、`register-form.tsx`
- **資料庫**：新 migration（trigger + 預設 org + 回填），需手動於 Supabase SQL Editor 執行；無 schema.prisma 模型變更
- **環境變數**：`BOOTSTRAP_ADMIN_EMAIL`（`.env` 範本、`.env.local`、Vercel）
- **依賴**：無新增
- **測試**：新增 admin-members E2E；既有 E2E 的測試帳號機制不變
