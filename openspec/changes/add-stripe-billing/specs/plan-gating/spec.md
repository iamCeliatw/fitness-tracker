## ADDED Requirements

### Requirement: FREE 方案限制定義
系統 SHALL 在 `src/lib/plan.ts` 集中定義方案限制：FREE = 教練席次 1（`OrganizationMember.role = 'COACH'` 的筆數，OWNER/org-ADMIN 不佔席次）、週期性時段批次建立停用；PRO = 無上限、全功能。gate 檢查失敗 SHALL 回 403 與 `{ error, code: "PLAN_LIMIT" }`，UI 依 `code` 顯示含 `/admin/settings` 連結的升級提示。

#### Scenario: FREE org 教練席次已滿
- **WHEN** FREE org 已有 1 位 role=COACH 成員，管理者再將另一位 MEMBER 升級為 COACH
- **THEN** API 回 403 與 code=PLAN_LIMIT，UI 顯示升級提示連結

#### Scenario: PRO org 不受席次限制
- **WHEN** PRO org 已有多位教練，管理者再升級一位 MEMBER 為 COACH
- **THEN** 升級成功

#### Scenario: OWNER 不佔教練席次
- **WHEN** FREE org 只有 OWNER（可通過 COACH 權限檢查）而無 role=COACH 成員，管理者升級一位 MEMBER 為 COACH
- **THEN** 升級成功（席次由 0 → 1）

### Requirement: 訂閱失效採「既有不動、擋新增」
org 從 PRO 降回 FREE 時，系統 SHALL 保留既有超額資料：超過席次的 COACH 保留角色、配對與時段；已建立的週期性時段不刪除。僅新增動作（再升級教練、再批次建立時段）受 FREE 限制。

#### Scenario: 降級後超額教練不受影響
- **WHEN** 有 3 位教練的 PRO org 訂閱取消降回 FREE
- **THEN** 3 位教練角色與配對維持不變，但再升級第 4 位教練被 403 擋下

### Requirement: FREE org 的週期性時段入口顯示升級提示
FREE org 的教練在時段管理介面 SHALL 看得到批次建立入口但為 disabled 狀態，附「升級 PRO 解鎖」說明；功能不隱藏。

#### Scenario: FREE org 教練檢視批次建立入口
- **WHEN** FREE org 的教練開啟新增時段介面
- **THEN** 批次建立（週期性）選項顯示為 disabled 並附升級說明，單次建立不受影響
