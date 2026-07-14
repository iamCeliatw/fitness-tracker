## MODIFIED Requirements

### Requirement: Coach can batch-create weekly recurring slots
教練（OrgRole = COACH）SHALL 能一次建立一段日期區間內的每週固定重複時段：選擇週幾（可多選）、開始時間與日期區間，系統展開為多筆固定一小時的 AppointmentSlot。展開由 client 完成，`POST /api/slots/batch` 接收具體的 startTime 清單（上限 84 筆，約 12 週）。此功能 SHALL 為 PRO 限定：FREE org 呼叫 `POST /api/slots/batch` 回 403 與 `code: "PLAN_LIMIT"`（`assertRecurringSlotsAllowed`），單次建立時段不受方案限制。

#### Scenario: Coach batch-creates recurring slots
- **WHEN** PRO org 的 coach submits 每週二、四 10:00、日期區間 4 週（8 筆 startTimes）且均無衝突
- **THEN** system creates 8 個 OPEN、長度一小時的 slots，回傳 201 與 `{ created: 8, skipped: [] }`

#### Scenario: FREE org 呼叫批次建立被擋
- **WHEN** FREE org 的 coach calls POST /api/slots/batch
- **THEN** system returns 403 with code=PLAN_LIMIT，不建立任何 slot

#### Scenario: Conflicting occurrences are skipped and reported
- **WHEN** batch 中有 2 筆與該教練現有 OPEN/BOOKED 時段重疊
- **THEN** system 只建立無衝突的筆數，回傳被跳過時段的 startTime 清單，UI 顯示成功筆數與跳過日期

#### Scenario: Batch exceeds the 84-slot cap
- **WHEN** coach submits 超過 84 筆 startTimes
- **THEN** system returns 400 with error message，不建立任何 slot

#### Scenario: Non-coach user attempts batch creation
- **WHEN** a MEMBER user calls POST /api/slots/batch
- **THEN** system returns 403
