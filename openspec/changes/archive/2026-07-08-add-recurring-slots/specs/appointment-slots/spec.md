## MODIFIED Requirements

### Requirement: Coach can create available time slots
教練（OrgRole = COACH）SHALL 能在所屬 Organization 內建立可預約的時段（AppointmentSlot）。時段長度固定為一小時：建立時只提供 startTime，endTime 由系統計算為 startTime + 1 小時。時段不得與該教練現有的 OPEN 或 BOOKED 時段重疊。

#### Scenario: Coach creates a non-overlapping slot
- **WHEN** coach submits a new slot with a startTime that does not overlap with their existing slots
- **THEN** system creates the slot with status OPEN, endTime = startTime + 1 hour, and returns 201

#### Scenario: Coach attempts to create an overlapping slot
- **WHEN** coach submits a slot whose one-hour range overlaps with an existing OPEN or BOOKED slot for the same coach
- **THEN** system returns 409 with error message indicating the conflict

#### Scenario: Non-coach user attempts to create a slot
- **WHEN** a MEMBER user calls POST /api/slots
- **THEN** system returns 403

## ADDED Requirements

### Requirement: Slot times are stored and displayed timezone-correctly
時段相關時間欄位 SHALL 以帶時區格式（timestamptz）儲存，API 回傳的時間字串 SHALL 帶有時區標記，UI SHALL 以使用者當地時區顯示。教練建立 10:00 的時段，畫面上任何地方 SHALL 顯示 10:00。

#### Scenario: Created slot displays at the entered local time
- **WHEN** coach 在台灣（UTC+8）建立 10:00 的時段
- **THEN** 教練頁與學員預約頁皆顯示 10:00（而非偏移後的 02:00）

#### Scenario: API returns timezone-marked timestamps
- **WHEN** any client fetches slots from the API
- **THEN** startTime/endTime 字串帶有時區標記（如 `+00:00` 或 `Z`），JS `new Date()` 解析後與寫入語意一致
