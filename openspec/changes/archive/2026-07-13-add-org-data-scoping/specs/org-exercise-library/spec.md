## ADDED Requirements

### Requirement: 三層動作庫
Exercise SHALL 支援三個互斥層級：全域內建（`orgId IS NULL AND isCustom=false`，所有人可見）、館自訂（`orgId=<org>`，僅該館成員可見）、個人自訂（`orgId IS NULL AND isCustom=true`，僅 `createdById` 本人可見）。現有 seed 動作與個人自訂動作維持 `orgId=null`，不做資料遷移。

#### Scenario: 館成員看得到本館動作
- **WHEN** 某館的 MEMBER 呼叫 `GET /api/exercises`
- **THEN** 回傳包含全域內建、本館自訂、與自己的個人自訂動作

#### Scenario: 跨館隔離
- **WHEN** A 館成員呼叫 `GET /api/exercises`
- **THEN** 回傳不包含 B 館的館自訂動作

#### Scenario: 個人自訂不受影響
- **WHEN** 用戶在訓練表單自建動作
- **THEN** 動作以 `isCustom=true, createdById=本人, orgId=null` 建立，僅本人可見（現行行為不變）

### Requirement: 館自訂動作管理
org-ADMIN 以上 SHALL 能透過 `/admin/exercises` 建立、編輯、刪除本館動作（`orgId=本館`）。建立時 orgId SHALL 由 server 依 caller 的 membership 決定，不接受 client 指定。對全域動作（`orgId IS NULL`）的 PATCH/DELETE SHALL 回 403。

#### Scenario: OWNER 建立館動作
- **WHEN** OWNER 在 /admin/exercises 新增動作
- **THEN** 動作以 `orgId=本館, isCustom=false` 建立，全館成員的動作選擇器可見

#### Scenario: 改全域動作被拒
- **WHEN** OWNER 對全域內建動作發出 PATCH 或 DELETE
- **THEN** 回傳 403，動作不變

#### Scenario: 平台 ADMIN 管理全域動作
- **WHEN** 全域 ADMIN（無 org membership）呼叫 `/api/admin/exercises` CRUD
- **THEN** 操作範圍限定 `orgId IS NULL` 的全域動作（現行行為保留）
