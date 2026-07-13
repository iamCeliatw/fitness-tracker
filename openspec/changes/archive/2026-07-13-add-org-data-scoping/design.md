# Design: add-org-data-scoping

## Context

`add-org-onboarding` 完成了人的隔離（membership、邀請碼、一人一館、/admin 頁面守門 ADMIN-or-OWNER），但資料層與 API 層還停在單租戶時代：

- `/api/admin/{members,coach-students,exercises}` 用 `getAdminContext()`（全域 `User.role=ADMIN`）守門，OWNER 打不進、查詢無 org 過濾
- `Exercise` 無 `orgId`，動作庫全平台共用；已有兩層自訂（`isCustom=false` 官方 / `isCustom=true, createdById` 個人）
- `requireOrgRole(...roles)` 是精確匹配，OWNER 無法通過 COACH 檢查——小館「館主兼主教練」場景卡死
- `AppointmentSlot` / `Appointment` / `CoachStudent` 已有 orgId（Phase 2 完成），不在本次範圍

已定案的前提（brainstorming 2026-07-09）：一人一館；全域 ADMIN = 平台 superadmin、無 org settings 存取權；健身記錄是個人資產。

## Goals / Non-Goals

**Goals:**
- Exercise 三層動作庫：全域內建 / 館自訂 / 個人自訂，跨館隔離
- OrgRole 階層化：OWNER ≥ ADMIN ≥ COACH ≥ MEMBER，一個 helper 統一所有 org 守門
- Admin API 補 org scope：members / coach-students / exercises 查詢與操作限定 caller 的 org

**Non-Goals:**
- WorkoutLog / BodyRecord / FoodEntry 不加 orgId（記錄跟人；教練檢視權限由 CoachStudent 配對控制）
- 不做館內總覽報表、不動 Stripe/計費
- 不改 middleware/proxy 的全域 role 導向（OWNER 的全域 role 是 USER，本來就能進 /dashboard/*）
- 個人自訂動作行為不變（不升級成館級、不收掉）

## Decisions

### D1: Exercise 用 nullable orgId，不複製 seed
`orgId=null` = 平台全域（含現有 23 筆 seed 與個人自訂），有值 = 館自訂。替代方案「每館複製一份 seed」被否決：資料量隨館數成長、平台更新內建動作無法同步。零資料遷移，migration SQL 只有 `ADD COLUMN` + FK(`ON DELETE CASCADE`) + index。

三層判別（互斥）：
| 層級 | 條件 | 可見範圍 |
|------|------|----------|
| 全域內建 | `orgId IS NULL AND isCustom=false` | 所有人 |
| 館自訂 | `orgId=<org>`（`isCustom=false, createdById=建立者`） | 該館成員 |
| 個人自訂 | `orgId IS NULL AND isCustom=true` | `createdById` 本人 |

### D2: 階層比較放在 helper，不動 schema
`OrgRole` 維持單一 enum 欄位。`ORG_ROLE_RANK = { OWNER: 4, ADMIN: 3, COACH: 2, MEMBER: 1 }`，`requireOrgRole(minRole)` 改為 `rank(membership.role) >= rank(minRole)`。替代方案「多角色欄位」被否決：schema 改動大、一人一館下沒有多角色需求。

新增 API 版 `getOrgContext(minRole)`（回 `null` 而非 redirect，回傳 `{ userId, orgId, role, admin }`）：
- 取代 `getOwnerContext()`（= `getOrgContext("OWNER")`），刪掉舊 helper
- 取代 `/api/slots` POST 的 inline `role !== "COACH"` 檢查（改 `getOrgContext("COACH")`，OWNER/org-ADMIN 因此可開時段）

### D3: admin exercises API 雙路徑守門
`/api/admin/exercises` 同時服務兩種 caller：
- **org 管理者**（`getOrgContext("ADMIN")`）：列表回全域 + 本館；建立強制 `orgId=ctx.orgId`；PATCH/DELETE 僅限 `orgId=ctx.orgId` 的列，動到全域列回 403
- **平台 ADMIN**（`getAdminContext()`，現有行為）：管理 `orgId=null` 的全域動作

守門順序：先試 org context，miss 再試平台 ADMIN。members / coach-students 只有 org 路徑（**BREAKING**：平台 ADMIN 不再能透過這些 API 跨館管理成員——它本來就不該管館內事務）。

### D4: 動作選擇器可見性用單一 .or() 查詢
`GET /api/exercises`：先查 caller 的 membership 拿 orgId，query 改為
`or(and(orgId.is.null,isCustom.eq.false), orgId.eq.<myOrg>, createdById.eq.<me>)`。
無 membership 的用戶（理論上不存在，防禦性）退回現行「內建 + 自己的」。

### D5: 教練候選人 = COACH 以上
`/api/admin/coach-students` 的候選查詢從 `.eq("role","COACH")` 改為 `.in("role", ["COACH","ADMIN","OWNER"])` 並限定本館。與 D2 階層一致：能過 COACH 守門的人就能被配對。

## Risks / Trade-offs

- [BREAKING：平台 ADMIN 失去 members/coach-students API 存取] → 該行為是缺口而非 feature（跨館裸奔）；平台 ADMIN 的職責只剩全域動作與 audit-logs，已與「superadmin 無 org 事務權」的定案一致
- [org-ADMIN 權限擴大（可進教練 Dashboard、開時段）] → 階層語意的自然結果；若未來要收緊改 rank 表即可，單點控制
- [`.or()` 巢狀條件在 Supabase JS 的語法容易寫錯] → E2E 直接驗證三層可見性 + 跨館隔離，錯了立刻紅
- [E2E 測試帳號角色是共用資源] → 依 Harness 規則 5：動 test account 角色前先 `grep e2e/`；跨館隔離測試需要第二個 org，測試內自建自清（自癒設計）

## Migration Plan

1. `prisma/schema.prisma` 加 `Exercise.orgId String?` + relation；Organization 加 `exercises Exercise[]`
2. 手動 SQL（Supabase SQL Editor）：
   ```sql
   ALTER TABLE "Exercise" ADD COLUMN "orgId" TEXT REFERENCES "Organization"(id) ON DELETE CASCADE;
   CREATE INDEX "Exercise_orgId_idx" ON "Exercise"("orgId");
   ```
3. `npx prisma generate`
4. 部署 code（向後相容：舊 code 不讀 orgId 也不會壞）
5. Rollback：revert code 即可；欄位留著無害（nullable、無 NOT NULL 約束）

## 互動視覺規格

- `/admin/exercises` 列表：全域動作顯示灰色「內建」badge（唯讀，無編輯/刪除按鈕）；本館動作顯示現行操作按鈕。既有 hover/transition 樣式不變（`transition-colors duration-150`）
- 動作選擇器：館自訂動作與內建動作混排（依現行 muscleGroup + name 排序），不加額外標示（會員不需要知道來源）
- 空狀態、Dialog 表單樣式沿用 `add-admin-exercises` 現有實作，無新視覺元素

## Open Questions

無——角色階層範圍、個人自訂去留、記錄歸屬皆已在 brainstorming 定案。
