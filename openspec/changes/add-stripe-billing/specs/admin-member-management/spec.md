## MODIFIED Requirements

### Requirement: org 角色升降
org 管理者（org-ADMIN 以上）SHALL 能將**本館**成員在 `MEMBER` 與 `COACH` 之間切換（`PATCH /api/admin/members/[id]`，`[id]` = OrganizationMember.id），操作需經 UI 二次確認；對非本館成員的操作 SHALL 回 403。升級為 COACH 時 SHALL 先通過方案席次檢查（`assertCoachSeatAvailable`）：FREE org 已有 1 位 role=COACH 成員時回 403 與 `code: "PLAN_LIMIT"`。

#### Scenario: 升為教練
- **WHEN** org 管理者對本館某 MEMBER 執行「升為教練」並確認（方案席次未滿）
- **THEN** 該成員 org 角色變為 COACH，列表 badge 即時更新，該用戶可存取 `/dashboard/coach`

#### Scenario: FREE 方案席次已滿擋下升級
- **WHEN** FREE org 已有 1 位 role=COACH 成員，管理者再升級另一位 MEMBER
- **THEN** API 回 403 與 code=PLAN_LIMIT，角色不變，UI 顯示含升級連結的提示

#### Scenario: 降級防呆
- **WHEN** org 管理者將仍有 ACTIVE CoachStudent 配對或未來 OPEN/BOOKED 時段的 COACH 降為 MEMBER
- **THEN** API 回傳 409 與原因訊息，角色不變，UI 顯示錯誤

#### Scenario: 跨館操作被拒
- **WHEN** org 管理者對其他館的 OrganizationMember 發出 PATCH
- **THEN** 回傳 403，角色不變
