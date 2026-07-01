## ADDED Requirements

### Requirement: Coach can create available time slots
教練（OrgRole = COACH）SHALL 能在所屬 Organization 內建立可預約的時段（AppointmentSlot）。時段必須有明確的 startTime 與 endTime，且不得與該教練現有的 OPEN 或 BOOKED 時段重疊。

#### Scenario: Coach creates a non-overlapping slot
- **WHEN** coach submits a new slot with startTime and endTime that do not overlap with their existing slots
- **THEN** system creates the slot with status OPEN and returns 201

#### Scenario: Coach attempts to create an overlapping slot
- **WHEN** coach submits a slot whose time range overlaps with an existing OPEN or BOOKED slot for the same coach
- **THEN** system returns 409 with error message indicating the conflict

#### Scenario: Non-coach user attempts to create a slot
- **WHEN** a MEMBER user calls POST /api/slots
- **THEN** system returns 403

### Requirement: Coach can delete open slots
教練 SHALL 能刪除狀態為 OPEN 的時段。已被預約（BOOKED）的時段不得直接刪除，需先透過取消 Appointment 使其回到 OPEN 狀態。

#### Scenario: Coach deletes an OPEN slot
- **WHEN** coach sends DELETE /api/slots/[id] for a slot with status OPEN
- **THEN** system deletes the slot and returns 200

#### Scenario: Coach attempts to delete a BOOKED slot
- **WHEN** coach sends DELETE /api/slots/[id] for a slot with status BOOKED
- **THEN** system returns 409 with error message "請先取消該時段的預約"

### Requirement: Any org member can view available slots
組織內的 COACH 和 MEMBER SHALL 都能查詢該 org 內狀態為 OPEN 的時段列表。

#### Scenario: Member views available slots
- **WHEN** authenticated MEMBER sends GET /api/slots
- **THEN** system returns list of OPEN slots for their organization

#### Scenario: Unauthenticated request
- **WHEN** unauthenticated user sends GET /api/slots
- **THEN** system returns 401
