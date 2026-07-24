## ADDED Requirements

### Requirement: 無 membership 用戶攔截
`dashboard/layout.tsx` SHALL 在既有 membership 查詢結果為 null 時 `redirect("/onboarding")`，MUST NOT 為此增加額外 DB 查詢。此攔截同時涵蓋 OAuth 首次登入用戶與既有的無 membership 用戶（如 org insert 失敗者）。

#### Scenario: OAuth 首次登入者進 dashboard
- **WHEN** 無 OrganizationMember 記錄的已登入用戶訪問任意 `/dashboard/*` 頁面
- **THEN** redirect 至 `/onboarding`

#### Scenario: 有 membership 用戶不受影響
- **WHEN** 有 OrganizationMember 記錄的用戶訪問 `/dashboard`
- **THEN** 頁面正常顯示，無多餘導向

### Requirement: Onboarding 補完頁
`/onboarding` 頁 SHALL 要求登入，提供與註冊一致的二選一：建立健身房（輸入館名）或以邀請碼加入，沿用 `(auth)` 深色風格與 register 的切換元件。已有 membership 的用戶進入 SHALL redirect 至 `/dashboard`。

#### Scenario: 無 membership 用戶完成建館
- **WHEN** 用戶在 `/onboarding` 選擇建立健身房並送出有效館名
- **THEN** 成為新 org 的 OWNER 並 redirect 至 `/dashboard`

#### Scenario: 已有 membership 用戶直接輸入 URL
- **WHEN** 已有 membership 的用戶訪問 `/onboarding`
- **THEN** redirect 至 `/dashboard`，不顯示表單

#### Scenario: 未登入訪問
- **WHEN** 未登入用戶訪問 `/onboarding`
- **THEN** redirect 至 `/login`

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
