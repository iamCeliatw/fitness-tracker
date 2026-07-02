## ADDED Requirements

### Requirement: 註冊自動加入預設組織
系統 SHALL 在用戶註冊成功後，自動將其以 `MEMBER` 角色加入預設組織（最早建立的 Organization）。

#### Scenario: 新用戶註冊
- **WHEN** 用戶以有效的 name/email/password 呼叫 `POST /api/auth/register`
- **THEN** 建立 auth 帳號與 `User` row，並建立 `OrganizationMember(role=MEMBER)` 指向預設組織，回傳 201

#### Scenario: 重複 email 註冊
- **WHEN** 用戶以已註冊的 email 呼叫 `POST /api/auth/register`
- **THEN** 回傳 409 與「此 Email 已被註冊」，不建立任何資料

#### Scenario: membership 建立失敗
- **WHEN** signUp 成功但 OrganizationMember 寫入失敗
- **THEN** 註冊仍回傳成功，錯誤記錄於 server log（帳號可用，membership 屬可修復狀態）

### Requirement: Bootstrap admin 自動升級
系統 SHALL 在註冊時將 email 與環境變數 `BOOTSTRAP_ADMIN_EMAIL` 比對（不分大小寫），相符者 `User.role` 設為 `ADMIN`。

#### Scenario: bootstrap email 註冊
- **WHEN** `BOOTSTRAP_ADMIN_EMAIL=celia@example.com`，用戶以 `Celia@Example.com` 註冊
- **THEN** 該用戶 `User.role = 'ADMIN'`，登入後導向 `/admin`

#### Scenario: 環境變數未設定
- **WHEN** `BOOTSTRAP_ADMIN_EMAIL` 未設定時任何用戶註冊
- **THEN** 升級邏輯直接略過，所有新用戶為 `USER`，不產生錯誤

### Requirement: User 同步 trigger 入版控
`auth.users → public."User"` 的同步 trigger SHALL 以 idempotent SQL 形式納入 `prisma/migrations/`，作為 canonical 版本。

#### Scenario: 重建資料庫
- **WHEN** 在全新 Supabase 專案執行版控內的 migration SQL
- **THEN** trigger 存在、預設組織存在，註冊流程可完整運作

### Requirement: 既有用戶回填
Migration SHALL 將執行當下無任何 `OrganizationMember` 的既有 `User` 回填為預設組織的 `MEMBER`，且可重複執行不產生重複資料。

#### Scenario: 回填無 membership 的用戶
- **WHEN** migration 執行時存在無 membership 的 User
- **THEN** 這些 User 取得預設組織的 MEMBER membership；重跑 migration 不新增重複列
