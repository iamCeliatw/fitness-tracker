## MODIFIED Requirements

### Requirement: API provides exercise library
系統 SHALL 在 `GET /api/exercises` 回傳 caller 可見的動作清單：全域內建（`orgId IS NULL AND isCustom=false`）＋ 本館自訂（`orgId=caller 的 org`）＋ 自己的個人自訂（`createdById=caller`），支援 `muscleGroup` query param 篩選。無 membership 的用戶退回「全域內建＋自己的個人自訂」。

#### Scenario: Fetch all exercises
- **WHEN** 某館成員呼叫 `GET /api/exercises`（無 query param）
- **THEN** 回傳全域內建、本館自訂與自己的個人自訂動作（id, name, muscleGroup, category），不含其他館的動作

#### Scenario: Filter by muscle group
- **WHEN** 呼叫 `GET /api/exercises?muscleGroup=CHEST`
- **THEN** 只回傳可見範圍內 muscleGroup 為 CHEST 的動作

#### Scenario: Unauthenticated request rejected
- **WHEN** 未登入用戶呼叫 `GET /api/exercises`
- **THEN** 系統回傳 401
