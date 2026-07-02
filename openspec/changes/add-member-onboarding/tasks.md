## 1. Migration 與環境

- [ ] 1.1 撰寫 `prisma/migrations/20260702000000_member_onboarding/migration.sql`：canonical `handle_new_user` trigger（先於 Supabase Dashboard 抄下現行定義備查）、預設 org 不存在則建立、無 membership 用戶回填 MEMBER、audit trigger 補掛 OrganizationMember + CoachStudent（全部 idempotent）
- [ ] 1.2 於 Supabase SQL Editor 執行 migration SQL，驗證：trigger 存在、回填生效（`test@gmail.com`、`celia@gmail.com` 有 membership）
- [ ] 1.3 `.env` 範本 + `.env.local` 加 `BOOTSTRAP_ADMIN_EMAIL`（部署文件註記 Vercel 需補設）

## 2. 註冊流程

- [ ] 2.1 `POST /api/auth/register`：zod 驗證 → signUp → 加入預設 org（MEMBER，失敗不擋註冊只 log）→ bootstrap admin 升級（不分大小寫、冪等）
- [ ] 2.2 `register-form.tsx` 改呼叫 API，錯誤訊息維持（409 →「此 Email 已被註冊」）
- [ ] 2.3 瀏覽器目視確認：註冊新帳號 → 登入 → 確認 membership 存在（`/api/auth/me` 或 DB）

## 3. Admin API

- [ ] 3.1 `GET /api/admin/members`：org 成員 + User 資訊 + ACTIVE 配對摘要（驗證 ADMIN）
- [ ] 3.2 `PATCH /api/admin/members/[id]`：COACH↔MEMBER 切換，降級防呆（ACTIVE 配對或未來 OPEN/BOOKED 時段 → 409），`setAuditActor`
- [ ] 3.3 `POST /api/admin/coach-students` + `PATCH /api/admin/coach-students/[id]`：建立配對（重複 ACTIVE → 409）、結束配對（ENDED），`setAuditActor`

## 4. Admin UI

- [ ] 4.1 `/admin/members` 頁 + admin-sidebar「成員」連結（`requireRole("ADMIN")`，layout 分層契約）
- [ ] 4.2 `member-list.tsx`：成員列表（名字/email/badge/加入時間）、升降按鈕 + AlertDialog、409 錯誤顯示；hover transition 規格
- [ ] 4.3 `coach-pairing-panel.tsx`：教練卡片 + ACTIVE 學員、指派 Dialog（排除已配對學員）、結束配對 AlertDialog、空狀態「尚無配對學員」
- [ ] 4.4 瀏覽器目視確認：升降角色、配對建立/結束、空狀態、窄螢幕排版

## 5. E2E 測試

- [ ] 5.1 `e2e/admin-members.spec.ts` happy path：admin 登入 → 列表可見 → 升 COACH → badge 更新 → 指派學員 → 配對出現 → 結束配對（測試資料自行清理或隨機隔離）
- [ ] 5.2 edge：非 admin 訪問 `/admin/members` 被導回 `/dashboard`；降級有 ACTIVE 配對的教練顯示錯誤且角色不變
- [ ] 5.3 註冊 E2E：隨機 email 註冊 → 登入成功 → 確認自動取得 MEMBER membership（測後清理帳號）
- [ ] 5.4 `npm run test:e2e` 全綠（含既有 spec 無回歸）
