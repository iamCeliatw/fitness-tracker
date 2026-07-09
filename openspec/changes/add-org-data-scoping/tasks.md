# Tasks: add-org-data-scoping

## 1. Schema 與 migration

- [x] 1.1 `prisma/schema.prisma`：Exercise 加 `orgId String?` + `org Organization?` relation（`onDelete: Cascade`）+ `@@index([orgId])`；Organization 加 `exercises Exercise[]`
- [ ] 1.2 手動撰寫 migration SQL（ADD COLUMN + FK + index），在 Supabase SQL Editor 執行，`npx prisma generate` 確認型別

## 2. 角色階層 helper

- [x] 2.1 `src/lib/auth-helpers.ts`：加 `ORG_ROLE_RANK`，`requireOrgRole` 改為 `requireOrgRole(minRole)` rank 比較；更新兩個 call site（settings 頁 OWNER、coach 頁 COACH）
- [x] 2.2 新增 `getOrgContext(minRole)`（API 版，回 null，含 `{ userId, orgId, role, admin }`）；刪除 `getOwnerContext`，settings 兩個 API route 改用 `getOrgContext("OWNER")`
- [x] 2.3 `src/app/api/slots/route.ts` POST：inline `role !== "COACH"` 檢查改用 `getOrgContext("COACH")`（OWNER/org-ADMIN 可開時段）

## 3. Admin API org scope

- [x] 3.1 `/api/admin/members`（GET、PATCH [id]）：`getAdminContext` → `getOrgContext("ADMIN")`，查詢與更新限定 `orgId=ctx.orgId`，跨館 PATCH 回 403
- [x] 3.2 `/api/admin/coach-students`（GET、POST、PATCH [id]）：同上改守門與 org 過濾；教練候選查詢 `.eq("role","COACH")` → `.in("role",["COACH","ADMIN","OWNER"])`
- [x] 3.3 `/api/admin/exercises`（GET、POST、PATCH/DELETE [id]）：雙路徑守門（先 `getOrgContext("ADMIN")`，miss 再 `getAdminContext`）——org 路徑：列表回全域＋本館、POST 掛 `orgId=ctx.orgId`、PATCH/DELETE 限本館列（全域列回 403）；平台路徑：維持現行（限 `orgId IS NULL`）

## 4. 動作可見性與前端

- [x] 4.1 `GET /api/exercises`：查 caller membership，`.or()` 改為「全域內建＋本館＋自己的個人自訂」；無 membership 退回現行條件
- [x] 4.2 `/admin/exercises` 頁面：全域動作顯示灰色「內建」badge 且隱藏編輯/刪除按鈕（org 管理者視角）；沿用現有 hover/transition 樣式
- [x] 4.3 配對面板：教練候選清單顯示 COACH/ADMIN/OWNER（badge 樣式沿用現有 role badge）

## 5. E2E 測試

- [ ] 5.1 跑 E2E 前置：`grep e2e/` 確認測試帳號角色不與本 change 衝突；查 port 殘留
- [ ] 5.2 org-exercise-isolation.spec：OWNER 建館動作 → 本館 MEMBER 選擇器可見（happy path）；第二個 org 的成員不可見（隔離，測試內自建自清）；OWNER PATCH 全域動作回 403（edge）
- [ ] 5.3 org-role-hierarchy.spec：OWNER 進 /dashboard/coach 不被導走（happy path）；MEMBER 打 `/api/admin/members` 回 403（edge）
- [ ] 5.4 `npm run test:e2e` 全綠後才勾 5.2/5.3
