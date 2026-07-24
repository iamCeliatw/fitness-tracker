## ADDED Requirements

### Requirement: 所有 public endpoint 字串欄位有明確長度上限
`POST /api/auth/register` 的 `registerSchema` 中每個字串欄位 SHALL 有 `.max()` 上限：`name` ≤ 128、`orgName` ≤ 128、`password` ≤ 128、`inviteCode` 格式固定（max 22，與 22-char base64url 一致）。超出上限 MUST 回傳 422。

#### Scenario: orgName 超過 128 字元
- **WHEN** 未登入用戶送出 `POST /api/auth/register` 且 `orgName` 長度為 200 字元
- **THEN** Zod 驗證失敗，回傳 422，不呼叫 Supabase，不寫入任何資料

#### Scenario: 正常長度通過驗證
- **WHEN** 用戶送出 `name="Alice"、orgName="最強健身房"、password="12345678"`（皆在限制內）
- **THEN** 驗證通過，流程正常進行

### Requirement: Onboarding endpoint 字串欄位有明確長度上限
`POST /api/onboarding` 的 `onboardingSchema` 中 `orgName` SHALL ≤ 128 字元，`inviteCode` SHALL ≤ 22 字元。超出上限 MUST 回傳 422。

#### Scenario: 已登入用戶送出超長 orgName
- **WHEN** 已登入但無 membership 的用戶送出 `POST /api/onboarding { mode:"create", orgName: "A".repeat(200) }`
- **THEN** 回傳 422，不建立 org 或 membership

### Requirement: 密碼最低長度為 8 字元
`POST /api/auth/register` 的 `password` 欄位 SHALL 要求至少 8 字元（NIST SP 800-63B 最低門檻）。

#### Scenario: 6 字元密碼被拒
- **WHEN** 用戶送出密碼為 `"abc123"`（6 字元）
- **THEN** 回傳 422「密碼至少 8 個字元」

#### Scenario: 8 字元密碼通過
- **WHEN** 用戶送出密碼為 `"abc12345"`（8 字元）
- **THEN** 驗證通過

### Requirement: Appointment notes 與 rejectedReason 有長度上限
`POST /api/appointments` 的 `notes` SHALL ≤ 2000 字元；`PATCH /api/appointments/[id]` 的 `reason` SHALL ≤ 1000 字元。超出 MUST 回傳 422。

#### Scenario: notes 超過 2000 字元
- **WHEN** 已登入用戶送出 `POST /api/appointments { slotId: "...", notes: "X".repeat(2001) }`
- **THEN** 回傳 422，不建立 Appointment

#### Scenario: rejectedReason 超過 1000 字元
- **WHEN** COACH 送出拒絕理由超過 1000 字元
- **THEN** 回傳 422

### Requirement: date / range query param 格式驗證
`GET /api/food-entries` 的 `date` query param SHALL 符合 `YYYY-MM-DD` 格式，不符者 MUST 回傳 400（不拋出 500）；`GET /api/body-records` 的 `range` query param SHALL 為正整數，非數值或 NaN 時 MUST 回傳 400。

#### Scenario: 無效日期參數
- **WHEN** 已登入用戶送出 `GET /api/food-entries?date=INVALID`
- **THEN** 回傳 400，不拋出未處理的 RangeError

#### Scenario: 非數值 range 參數
- **WHEN** 已登入用戶送出 `GET /api/body-records?range=abc`
- **THEN** 回傳 400，不拋出未處理的 RangeError

#### Scenario: 有效 range 正常回傳
- **WHEN** 已登入用戶送出 `GET /api/body-records?range=30`
- **THEN** 回傳 200 與對應 30 天的資料
