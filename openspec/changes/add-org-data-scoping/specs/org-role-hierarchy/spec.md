## ADDED Requirements

### Requirement: OrgRole 階層比較
系統 SHALL 以階層方式判定 org 權限：`OWNER(4) ≥ ADMIN(3) ≥ COACH(2) ≥ MEMBER(1)`。`requireOrgRole(minRole)`（頁面用，未達門檻 redirect `/dashboard`）與 `getOrgContext(minRole)`（API 用，未達門檻回 `null`，回傳 `{ userId, orgId, role, admin }`）皆 SHALL 使用 rank 比較而非精確匹配。既有 `getOwnerContext()` SHALL 由 `getOrgContext("OWNER")` 取代並移除。

#### Scenario: OWNER 通過 COACH 門檻
- **WHEN** OrgRole 為 OWNER 的用戶存取要求 `COACH` 以上的頁面或 API
- **THEN** 檢查通過，取得的 context 含本人 orgId 與實際 role

#### Scenario: MEMBER 未達門檻
- **WHEN** OrgRole 為 MEMBER 的用戶存取要求 `COACH` 以上的頁面或 API
- **THEN** 頁面被導向 `/dashboard`；API 回傳 403

#### Scenario: 無 membership 的用戶
- **WHEN** 沒有任何 OrganizationMember 記錄的用戶存取要求 org 角色的頁面或 API
- **THEN** 頁面被導向 `/dashboard`；API 回傳 403

### Requirement: OWNER 與 org-ADMIN 可執行教練職能
OWNER 與 org-ADMIN SHALL 能進入 `/dashboard/coach`、建立可預約時段（`POST /api/slots`）、並可被配對為 CoachStudent 的教練方。

#### Scenario: OWNER 開時段
- **WHEN** OWNER 呼叫 `POST /api/slots` 建立時段
- **THEN** 時段建立成功，coachId 為該 OWNER 的 userId

#### Scenario: OWNER 進教練 Dashboard
- **WHEN** OWNER 造訪 `/dashboard/coach`
- **THEN** 正常顯示教練 Dashboard（不被導回 `/dashboard`）
