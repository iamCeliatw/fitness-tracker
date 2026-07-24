## MODIFIED Requirements

### Requirement: Onboarding API
`POST /api/onboarding` SHALL 驗證登入身份後補完 membership：`mode=create`（orgName）建立 org 並成為 OWNER；`mode=join`（inviteCode）驗證邀請碼後以 MEMBER 加入。org 建立與邀請碼驗證邏輯 SHALL 與 `/api/auth/register` 共用（`src/lib/org.ts`）。系統 SHALL 在 DB 層以 `@@unique([userId])` constraint 保證一人一館——重複 insert 時 DB 回傳 `23505 unique violation`，API MUST 將此視為「已有 membership」並回傳 409，而非 500。register 既有行為 MUST 不變。

#### Scenario: 邀請碼加入
- **WHEN** 無 membership 用戶以有效邀請碼呼叫 `mode=join`
- **THEN** 建立 `OrganizationMember(role=MEMBER)`，回傳 201

#### Scenario: 無效邀請碼
- **WHEN** 用戶以不存在的邀請碼呼叫 `mode=join`
- **THEN** 回傳 422「邀請碼無效」，不建立任何資料

#### Scenario: 已有 membership 重複呼叫
- **WHEN** 已有 OrganizationMember 記錄的用戶呼叫本 API
- **THEN** 回傳 409，不建立任何 org 或 membership

#### Scenario: 並發重複呼叫觸發 DB unique violation
- **WHEN** 無 membership 用戶同時送出兩個 `mode=join` 請求
- **THEN** 第一個成功；第二個因 DB `23505` constraint 被捕捉，回傳 409，不拋出 500

#### Scenario: 未登入呼叫
- **WHEN** 未登入請求 `POST /api/onboarding`
- **THEN** 回傳 401
