## ADDED Requirements

### Requirement: Coach can view their students' weekly progress
教練職能者（OrgRole 為 COACH 以上，含 ADMIN、OWNER）SHALL 能在 /dashboard/coach 查看所有透過 CoachStudent 關聯的學員本週（過去 7 天）訓練次數與飲食記錄天數。

#### Scenario: Coach views student list with progress
- **WHEN** coach navigates to /dashboard/coach
- **THEN** system displays each student's name, weekly workout count, and number of days with food entries in the past 7 days

#### Scenario: OWNER accesses coach dashboard
- **WHEN** OrgRole 為 OWNER 的用戶造訪 /dashboard/coach
- **THEN** 正常顯示教練 Dashboard（不被導回 /dashboard），學員列表為以其為 coach 的 ACTIVE 配對

#### Scenario: Student has no activity this week
- **WHEN** a student has no WorkoutLog or FoodEntry in the past 7 days
- **THEN** student card shows "本週訓練 0 次" and "飲食達標 0/7 天"

#### Scenario: Coach has no students
- **WHEN** coach has no CoachStudent relationships in the current org
- **THEN** system displays empty state with message "目前沒有學員"

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
/dashboard/coach SHALL 只允許 OrgRole 為 COACH 以上（含 ADMIN、OWNER，階層比較）的使用者存取。

#### Scenario: Non-coach user accesses coach dashboard
- **WHEN** a MEMBER user navigates to /dashboard/coach
- **THEN** system redirects to /dashboard

#### Scenario: Unauthenticated user accesses coach dashboard
- **WHEN** unauthenticated user accesses /dashboard/coach
- **THEN** system redirects to /login
