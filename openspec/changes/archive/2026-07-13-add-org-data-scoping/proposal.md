# Proposal: add-org-data-scoping

## Why

多租戶 onboarding（`add-org-onboarding`）只做了「人的隔離」（membership、邀請碼、/admin 頁面守門），但**資料與 API 還沒有 org 隔離**：`/api/admin/members`、`/api/admin/coach-students`、`/api/admin/exercises` 仍用全域 ADMIN 守門（多租戶之前的產物），OWNER 打不進這些 API、查詢也跨館可見；動作庫是全平台共用，館無法建立自己的動作。Stripe 訂閱（計費主體 = org）依賴完整的 org 隔離，必須先補這一層。

## What Changes

- **Exercise 加 nullable `orgId`**（唯一 schema 改動）：形成三層動作庫——全域內建（`orgId=null, isCustom=false`）、館自訂（`orgId=<org>`）、個人自訂（`isCustom=true, createdById`）。現有資料零遷移。
- **WorkoutLog / BodyRecord / FoodEntry 不加 orgId**（已決策：健身記錄是個人資產，換館跟著人走；教練查看權限由 CoachStudent 配對控制，配對已有 orgId）。
- **OrgRole 階層化**：`requireOrgRole` 改為 rank 比較（OWNER ≥ ADMIN ≥ COACH ≥ MEMBER），OWNER/org-ADMIN 自動通過 COACH 檢查（可進教練 Dashboard、開時段、被配對學員）。新增 API 版 `getOrgContext(minRole)` 統一守門，取代 `getOwnerContext` 與 `/api/slots` 的 inline role check。
- **Admin API org scope（修既有缺口）**：members / coach-students / exercises 三組 admin API 從全域 ADMIN 守門改為 `getOrgContext("ADMIN")`，所有查詢限定 caller 的 org。**BREAKING**：全域 ADMIN 不再能透過這些 API 管理館內成員與配對（僅保留全域動作管理）。
- **動作選擇器可見性**：`GET /api/exercises` 從「內建 + 自己的」擴為「內建 + 自己館的 + 自己的」。

## Capabilities

### New Capabilities
- `org-role-hierarchy`: OrgRole 階層比較（OWNER ≥ ADMIN ≥ COACH ≥ MEMBER）、`requireOrgRole(minRole)` 與 API 版 `getOrgContext(minRole)` 守門、OWNER/org-ADMIN 可作為教練候選人。
- `org-exercise-library`: 館自訂動作層級——三層可見性規則（全域/館/個人）、館動作的建立歸屬與隔離。

### Modified Capabilities
- `admin-exercise-management`: 守門從全域 ADMIN 改為 org-ADMIN 以上；列表顯示全域（唯讀）+ 本館動作；新增自動掛本館 `orgId`；改/刪全域動作回 403；平台 ADMIN 保留全域動作管理路徑。
- `admin-member-management`: members / coach-students API 守門改為 org-ADMIN 以上，查詢限定本館；教練候選人從 `role=COACH` 擴為 COACH 以上（含 ADMIN/OWNER）。
- `coach-dashboard`: 存取要求從「OrgRole = COACH」放寬為「COACH 以上」（OWNER/org-ADMIN 可進）。
- `workout-exercise-picker`: 動作庫清單包含本館自訂動作（含肌群篩選與搜尋一致適用）。

## Impact

- **Schema / migration**：`Exercise.orgId String?` + FK + index，手動 SQL 在 Supabase SQL Editor 執行（本機無法 prisma migrate）。
- **後端**：`src/lib/auth-helpers.ts`（requireOrgRole 階層化、getOrgContext 新增、getOwnerContext 汰換）、`src/lib/admin-api.ts`（getAdminContext 僅留全域動作路徑）、`src/app/api/admin/{members,coach-students,exercises}/`、`src/app/api/exercises/route.ts`、`src/app/api/slots/route.ts`。
- **前端**：`/admin/exercises` 列表全域/本館標示與唯讀處理、配對 UI 教練候選清單。
- **E2E**：跨館隔離、OWNER 進教練 Dashboard、OWNER 改全域動作 403。測試帳號角色狀態是共用資源（migration/seed 動 test account 前先 grep e2e/）。
