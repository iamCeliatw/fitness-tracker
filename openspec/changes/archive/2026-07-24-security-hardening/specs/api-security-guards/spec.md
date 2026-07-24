## ADDED Requirements

### Requirement: Org member role 變更不得操作同級或上級
`PATCH /api/admin/members/[id]` SHALL 在執行更新前比較操作者與目標成員的職級；目標職級 ≥ 操作者職級時 MUST 回傳 403，不執行任何更新。

#### Scenario: ADMIN 嘗試降級 OWNER
- **WHEN** org-ADMIN（rank 3）對 org-OWNER（rank 4）的 membership 送出 `PATCH { role: "MEMBER" }`
- **THEN** 系統回傳 403，`OrganizationMember.role` 維持 `OWNER` 不變

#### Scenario: ADMIN 降級 COACH（合法）
- **WHEN** org-ADMIN 對 org-COACH 的 membership 送出 `PATCH { role: "MEMBER" }`
- **THEN** 系統執行更新，回傳 200，`OrganizationMember.role` 改為 `MEMBER`

#### Scenario: OWNER 降級 ADMIN（合法）
- **WHEN** org-OWNER 對 org-ADMIN 的 membership 送出 `PATCH { role: "MEMBER" }`
- **THEN** 系統執行更新，回傳 200

### Requirement: Appointment 預約需驗證 org membership
`POST /api/appointments` SHALL 在 fetch slot 後確認發出請求的用戶在 `slot.orgId` 擁有有效的 `OrganizationMember`（role 不限）；無 membership 者 MUST 回傳 403。

#### Scenario: 跨 org 使用者嘗試預約
- **WHEN** 屬於 Org-X 的已登入用戶以屬於 Org-Y 的 slot UUID 呼叫 `POST /api/appointments`
- **THEN** 系統回傳 403，不建立任何 Appointment，slot.status 維持 OPEN

#### Scenario: 同 org 使用者正常預約
- **WHEN** 屬於 Org-X 的用戶以同屬 Org-X 的 OPEN slot 呼叫 `POST /api/appointments`
- **THEN** 預約流程正常進行（不受此 guard 影響）

### Requirement: Appointment slot claim 為原子操作
`POST /api/appointments` 的 slot 狀態鎖定 SHALL 以 conditional UPDATE（`WHERE status='OPEN'`）實作；若 UPDATE 影響行數為 0，MUST 回傳 409，不建立 Appointment。

#### Scenario: 並發預約同一 slot——後到者被拒
- **WHEN** 兩個用戶幾乎同時對同一 OPEN slot 送出預約請求
- **THEN** 最多只有一個請求成功取得 slot（另一個收到 409），Appointment 最多建立一筆

#### Scenario: Slot 已被鎖定
- **WHEN** slot 的 conditional UPDATE 回傳 0 rows affected（已被他人搶走）
- **THEN** 系統回傳 409「此時段已被預約」，不寫入 Appointment

### Requirement: Coach slot 刪除需驗現職級
`DELETE /api/slots/[id]` SHALL 在驗證 `slot.coachId === user.id` 之後，進一步確認該用戶目前仍持有 COACH 或以上的 org 職級；不符者 MUST 回傳 403。

#### Scenario: 已降級的前教練嘗試刪除自己的 slot
- **WHEN** 曾是 COACH 但已被降為 MEMBER 的用戶對自己建立的 slot 送出 DELETE
- **THEN** 系統回傳 403，slot 不刪除

#### Scenario: 現任 COACH 正常刪除
- **WHEN** 仍是 COACH 的用戶對自己的 slot 送出 DELETE
- **THEN** 系統執行刪除，回傳 200
