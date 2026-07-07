## ADDED Requirements

### Requirement: Coach can manage pending appointment requests
教練 SHALL 能在 /dashboard/coach 的「待確認預約」panel 查看自己所有 PENDING 預約（學員名、時段、備註），並對每筆執行確認或拒絕；拒絕時開啟 Dialog 可選填原因。

#### Scenario: Coach confirms from the panel
- **WHEN** coach clicks 確認 on a pending request
- **THEN** the request leaves the pending panel and the weekly schedule shows the slot as confirmed

#### Scenario: Coach rejects with reason from the panel
- **WHEN** coach clicks 拒絕, fills an optional reason in the dialog, and submits
- **THEN** the request leaves the panel and the slot returns to bookable state

#### Scenario: No pending requests
- **WHEN** coach has no PENDING appointments
- **THEN** the panel shows empty state 「目前沒有待確認的預約」

## MODIFIED Requirements

### Requirement: Coach can view their weekly appointment schedule
教練 SHALL 能在 /dashboard/coach 查看本週（週一至週日）所有 AppointmentSlot 及其預約狀態；有預約的時段 SHALL 區分待確認（pending，橘色系）與已確認（confirmed，現行樣式）。

#### Scenario: Coach views weekly schedule
- **WHEN** coach navigates to /dashboard/coach
- **THEN** system displays all AppointmentSlots for the current week, showing time, student name (if booked), and status

#### Scenario: Schedule distinguishes pending from confirmed
- **WHEN** a slot's appointment is PENDING
- **THEN** the schedule entry uses the pending (orange) style, distinct from CONFIRMED entries

#### Scenario: Coach views schedule with no slots this week
- **WHEN** coach has no AppointmentSlots in the current week
- **THEN** schedule panel displays empty state with "本週尚無排課" and a "+ 新增時段" button
