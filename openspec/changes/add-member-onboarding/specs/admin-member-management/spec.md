## ADDED Requirements

### Requirement: 成員列表
系統 SHALL 提供 `/admin/members` 頁面（僅全域 ADMIN 可存取），列出預設組織所有成員的名字、email、org 角色 badge 與加入時間。

#### Scenario: 管理員檢視成員列表
- **WHEN** ADMIN 造訪 `/admin/members`
- **THEN** 顯示組織成員列表，每列含名字、email、角色 badge（COACH 橘／MEMBER 灰）、加入時間

#### Scenario: 非管理員存取
- **WHEN** 全域 role 為 USER 的用戶造訪 `/admin/members`
- **THEN** 被重導至 `/dashboard`

### Requirement: org 角色升降
管理員 SHALL 能將成員在 `MEMBER` 與 `COACH` 之間切換（`PATCH /api/admin/members/[id]`，`[id]` = OrganizationMember.id），操作需經 UI 二次確認。

#### Scenario: 升為教練
- **WHEN** ADMIN 對某 MEMBER 執行「升為教練」並確認
- **THEN** 該成員 org 角色變為 COACH，列表 badge 即時更新，該用戶可存取 `/dashboard/coach`

#### Scenario: 降級防呆
- **WHEN** ADMIN 將仍有 ACTIVE CoachStudent 配對或未來 OPEN/BOOKED 時段的 COACH 降為 MEMBER
- **THEN** API 回傳 409 與原因訊息，角色不變，UI 顯示錯誤

### Requirement: 教練學員配對管理
管理員 SHALL 能建立與結束 CoachStudent 配對：`POST /api/admin/coach-students` 建立（status=ACTIVE）、`PATCH /api/admin/coach-students/[id]` 結束（status=ENDED）。

#### Scenario: 指派學員給教練
- **WHEN** ADMIN 在配對面板選擇教練與尚未配對給該教練的學員並確認
- **THEN** 建立 ACTIVE 配對，教練卡片即時顯示該學員，教練 dashboard 的學員列表包含該學員

#### Scenario: 重複配對
- **WHEN** ADMIN 對同一教練＋學員組合重複建立 ACTIVE 配對
- **THEN** API 回傳 409 與「此學員已配對給該教練」

#### Scenario: 結束配對
- **WHEN** ADMIN 對 ACTIVE 配對執行「結束配對」並確認
- **THEN** 配對 status 變為 ENDED，教練卡片移除該學員

#### Scenario: 無配對空狀態
- **WHEN** 某教練沒有任何 ACTIVE 配對
- **THEN** 該教練卡片顯示「尚無配對學員」空狀態

### Requirement: 稽核紀錄
成員角色變更與配對操作 SHALL 透過 `setAuditActor` 讓既有 audit trigger 記錄操作者。

#### Scenario: 角色變更留痕
- **WHEN** ADMIN 完成一次角色升降
- **THEN** AuditLog 出現對應記錄且 actorId 為該 ADMIN
