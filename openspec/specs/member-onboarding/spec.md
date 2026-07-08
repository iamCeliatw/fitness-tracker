## ADDED Requirements

### Requirement: 註冊須選擇組織歸屬
`POST /api/auth/register` SHALL 要求二選一：`mode=create`（附 `orgName`，建立健身房成為 OWNER）或 `mode=join`（附 `inviteCode`，加入該 org 成為 MEMBER）。邀請碼 SHALL 在建立 auth 帳號**之前**驗證（trim + 不分大小寫比對），無效碼 MUST NOT 產生任何帳號或資料。

#### Scenario: 以邀請碼加入
- **WHEN** 用戶以 `mode=join` + 有效邀請碼完成註冊
- **THEN** 建立 auth 帳號與 `User` row，並建立指向該 org 的 `OrganizationMember(role=MEMBER)`，回傳 201

#### Scenario: 無效邀請碼
- **WHEN** 用戶以 `mode=join` + 不存在的邀請碼註冊
- **THEN** 回傳 422「邀請碼無效」，不呼叫 signUp、不建立任何資料

#### Scenario: 重複 email 註冊
- **WHEN** 用戶以已註冊的 email 註冊（任一 mode）
- **THEN** 回傳 409 與「此 Email 已被註冊」，不建立任何資料

#### Scenario: membership 寫入失敗
- **WHEN** signUp 成功但 membership 寫入失敗（join 模式）
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
