## MODIFIED Requirements

### Requirement: 成員列表
系統 SHALL 提供 `/admin/members` 頁面（org-ADMIN 以上可存取），列出 **caller 所屬組織**所有成員的名字、email、org 角色 badge 與加入時間。`GET /api/admin/members` SHALL 以 `getOrgContext("ADMIN")` 守門並限定查詢 caller 的 orgId。

#### Scenario: org 管理者檢視成員列表
- **WHEN** OWNER 或 org-ADMIN 造訪 `/admin/members`
- **THEN** 顯示本館成員列表，每列含名字、email、角色 badge（COACH 橘／MEMBER 灰）、加入時間，不含其他館成員

#### Scenario: 非管理員存取
- **WHEN** OrgRole 為 MEMBER 或 COACH 的用戶造訪 `/admin/members`
- **THEN** 被重導至 `/dashboard`

#### Scenario: 全域 ADMIN 不再有館內成員權限
- **WHEN** 全域 ADMIN（無 org membership）呼叫 `GET /api/admin/members`
- **THEN** 回傳 403

### Requirement: org 角色升降
org 管理者（org-ADMIN 以上）SHALL 能將**本館**成員在 `MEMBER` 與 `COACH` 之間切換（`PATCH /api/admin/members/[id]`，`[id]` = OrganizationMember.id），操作需經 UI 二次確認；對非本館成員的操作 SHALL 回 403。

#### Scenario: 升為教練
- **WHEN** org 管理者對本館某 MEMBER 執行「升為教練」並確認
- **THEN** 該成員 org 角色變為 COACH，列表 badge 即時更新，該用戶可存取 `/dashboard/coach`

#### Scenario: 降級防呆
- **WHEN** org 管理者將仍有 ACTIVE CoachStudent 配對或未來 OPEN/BOOKED 時段的 COACH 降為 MEMBER
- **THEN** API 回傳 409 與原因訊息，角色不變，UI 顯示錯誤

#### Scenario: 跨館操作被拒
- **WHEN** org 管理者對其他館的 OrganizationMember 發出 PATCH
- **THEN** 回傳 403，角色不變

### Requirement: 教練學員配對管理
org 管理者（org-ADMIN 以上）SHALL 能建立與結束**本館**的 CoachStudent 配對：`POST /api/admin/coach-students` 建立（status=ACTIVE）、`PATCH /api/admin/coach-students/[id]` 結束（status=ENDED）。教練候選人 SHALL 為本館 OrgRole 為 COACH 以上的成員（含 ADMIN、OWNER）；學員候選人 SHALL 為本館成員。

#### Scenario: 指派學員給教練
- **WHEN** org 管理者在配對面板選擇教練與尚未配對給該教練的學員並確認
- **THEN** 建立 ACTIVE 配對，教練卡片即時顯示該學員，教練 dashboard 的學員列表包含該學員

#### Scenario: OWNER 出現在教練候選清單
- **WHEN** org 管理者開啟配對面板
- **THEN** 教練候選清單包含本館 role 為 COACH、ADMIN、OWNER 的成員

#### Scenario: 重複配對
- **WHEN** org 管理者對同一教練＋學員組合重複建立 ACTIVE 配對
- **THEN** API 回傳 409 與「此學員已配對給該教練」

#### Scenario: 結束後重新配對
- **WHEN** org 管理者對曾經結束（ENDED）的教練＋學員組合再次建立配對
- **THEN** 原配對列重新啟用（status 回 ACTIVE、assignedAt 更新），不新增重複列（unique constraint 不分 status）

#### Scenario: 結束配對
- **WHEN** org 管理者對 ACTIVE 配對執行「結束配對」並確認
- **THEN** 配對 status 變為 ENDED，教練卡片移除該學員

#### Scenario: 無配對空狀態
- **WHEN** 某教練沒有任何 ACTIVE 配對
- **THEN** 該教練卡片顯示「尚無配對學員」空狀態
