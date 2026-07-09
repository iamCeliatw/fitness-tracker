## MODIFIED Requirements

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
