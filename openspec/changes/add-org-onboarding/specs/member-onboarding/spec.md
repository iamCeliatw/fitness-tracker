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

## REMOVED Requirements

### Requirement: 註冊自動加入預設組織
**Reason**: 多租戶 onboarding 取代「預設組織」概念——org 不再有全域預設，註冊時由用戶選擇建館或以邀請碼加入。
**Migration**: 既有 org 視為第一家館（migration 補 inviteCode）；既有 memberships 不動。新註冊行為見「註冊須選擇組織歸屬」與 `org-onboarding` capability。
