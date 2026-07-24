## ADDED Requirements

### Requirement: Org role 操作不得影響同級或上級成員
`PATCH /api/admin/members/[id]` SHALL 在已有「操作者需達 ADMIN 門檻」的 guard 之外，額外比對目標成員的現有 role rank 與操作者的 role rank；目標 rank ≥ 操作者 rank 時 MUST 回傳 403，不執行任何資料庫更新。此規則獨立於目標成員的新 role，僅檢查**現有** role。

#### Scenario: ADMIN 嘗試對 OWNER 做任何角色變更
- **WHEN** org-ADMIN（rank 3）對 org-OWNER（rank 4）的 membership 送出 PATCH（無論新 role 為何）
- **THEN** 系統回傳 403，membership 維持不變

#### Scenario: ADMIN 修改 COACH 或 MEMBER（合法）
- **WHEN** org-ADMIN 對 org-COACH（rank 2）或 org-MEMBER（rank 1）送出合法的 PATCH
- **THEN** 系統執行更新，回傳 200

#### Scenario: OWNER 可對所有成員（含 ADMIN）進行角色變更
- **WHEN** org-OWNER（rank 4）對 org-ADMIN（rank 3）送出 PATCH
- **THEN** 系統執行更新，回傳 200（OWNER rank 4 > ADMIN rank 3，通過）
