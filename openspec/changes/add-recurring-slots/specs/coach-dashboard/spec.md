## MODIFIED Requirements

### Requirement: Coach can view their weekly appointment schedule
教練 SHALL 能在 /dashboard/coach 查看以週為單位的 AppointmentSlot 及其預約狀態，預設顯示本週（週一至週日），並 SHALL 能以導覽控制前後切換週次（query param 控制週偏移）；有預約的時段 SHALL 區分待確認（pending，橘色系）與已確認（confirmed，現行樣式）。

#### Scenario: Coach views weekly schedule
- **WHEN** coach navigates to /dashboard/coach
- **THEN** system displays all AppointmentSlots for the current week, showing time, student name (if booked), and status

#### Scenario: Coach navigates to a future week
- **WHEN** coach clicks the `›` navigation to view next week
- **THEN** system displays that week's slots（含已確認的未來預約），面板標題顯示該週日期範圍，並提供「回到本週」連結

#### Scenario: Schedule distinguishes pending from confirmed
- **WHEN** a slot's appointment is PENDING
- **THEN** the schedule entry uses the pending (orange) style, distinct from CONFIRMED entries

#### Scenario: Coach views schedule with no slots this week
- **WHEN** coach has no AppointmentSlots in the current week
- **THEN** schedule panel displays empty state with "本週尚無排課" and a "+ 新增時段" button

#### Scenario: Coach views an empty non-current week
- **WHEN** coach navigates to a week with no AppointmentSlots
- **THEN** schedule panel displays empty state with "此週尚無排課"
