## MODIFIED Requirements

### Requirement: Bootstrap admin 自動升級
系統 SHALL 在註冊時將 email 與環境變數 `BOOTSTRAP_ADMIN_EMAIL` 比對（不分大小寫），**且** request body 的 `adminSecret` 欄位與環境變數 `BOOTSTRAP_ADMIN_SECRET` 完全吻合，兩個條件同時滿足者 `User.role` 設為 `ADMIN`。`BOOTSTRAP_ADMIN_SECRET` 未設定時，bootstrap 路徑 MUST 靜默跳過，不升權、不報錯。

#### Scenario: bootstrap email + secret 皆正確
- **WHEN** `BOOTSTRAP_ADMIN_EMAIL=celia@example.com`、`BOOTSTRAP_ADMIN_SECRET=s3cr3t`，用戶以 `Celia@Example.com` + `adminSecret:"s3cr3t"` 註冊
- **THEN** 該用戶 `User.role = 'ADMIN'`，登入後導向 `/admin`

#### Scenario: email 正確但 secret 錯誤
- **WHEN** email 吻合但 `adminSecret` 不吻合
- **THEN** 升級邏輯跳過，用戶以 `USER` 建立，不回傳錯誤

#### Scenario: BOOTSTRAP_ADMIN_SECRET 未設定
- **WHEN** `BOOTSTRAP_ADMIN_SECRET` 未設定時任何用戶（包含 bootstrap email）註冊
- **THEN** 升級邏輯完全跳過，所有新用戶為 `USER`

### Requirement: 註冊須選擇組織歸屬
`POST /api/auth/register` SHALL 要求二選一：`mode=create`（附 `orgName`，建立健身房成為 OWNER）或 `mode=join`（附 `inviteCode`，加入該 org 成為 MEMBER）。邀請碼 SHALL 在建立 auth 帳號**之前**驗證（trim + 不分大小寫比對），無效碼 MUST NOT 產生任何帳號或資料。邀請碼 SHALL 為 22 字元 base64url 字串（128-bit entropy）。

#### Scenario: 以邀請碼加入
- **WHEN** 用戶以 `mode=join` + 有效邀請碼（22 字元 base64url）完成註冊
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
