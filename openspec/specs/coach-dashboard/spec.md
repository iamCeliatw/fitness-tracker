## ADDED Requirements

### Requirement: Coach can view their students' weekly progress
教練（OrgRole = COACH）SHALL 能在 /dashboard/coach 查看所有透過 CoachStudent 關聯的學員本週（過去 7 天）訓練次數與飲食記錄天數。

#### Scenario: Coach views student list with progress
- **WHEN** coach navigates to /dashboard/coach
- **THEN** system displays each student's name, weekly workout count, and number of days with food entries in the past 7 days

#### Scenario: Student has no activity this week
- **WHEN** a student has no WorkoutLog or FoodEntry in the past 7 days
- **THEN** student card shows "本週訓練 0 次" and "飲食達標 0/7 天"

#### Scenario: Coach has no students
- **WHEN** coach has no CoachStudent relationships in the current org
- **THEN** system displays empty state with message "目前沒有學員"

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

### Requirement: Coach dashboard is protected by OrgRole
/dashboard/coach SHALL 只允許 OrgRole = COACH 的使用者存取。

#### Scenario: Non-coach user accesses coach dashboard
- **WHEN** a MEMBER user navigates to /dashboard/coach
- **THEN** system redirects to /dashboard

#### Scenario: Unauthenticated user accesses coach dashboard
- **WHEN** unauthenticated user accesses /dashboard/coach
- **THEN** system redirects to /login
