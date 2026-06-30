## ADDED Requirements

### Requirement: System automatically records data mutations via DB trigger
系統 SHALL 透過 PostgreSQL trigger function 自動將 Appointment、AppointmentSlot、WorkoutLog 三張 table 的 INSERT/UPDATE/DELETE 操作寫入 AuditLog，不需要 API 層手動呼叫。

#### Scenario: Appointment is created
- **WHEN** an Appointment row is inserted into the database
- **THEN** an AuditLog entry is created with operation=INSERT, table="Appointment", recordId=appointment.id, newData=row JSON

#### Scenario: Appointment is cancelled (updated)
- **WHEN** an Appointment row is updated (e.g., status changes to CANCELLED)
- **THEN** an AuditLog entry is created with operation=UPDATE, oldData=previous row JSON, newData=updated row JSON

#### Scenario: WorkoutLog is deleted
- **WHEN** a WorkoutLog row is deleted
- **THEN** an AuditLog entry is created with operation=DELETE, oldData=deleted row JSON, newData=null

### Requirement: AuditLog records the actor who performed the operation
每筆 AuditLog SHALL 記錄執行操作的使用者 ID（actorId）。API route 必須在執行 DB 操作前透過 `set_config('app.current_user_id', userId)` 注入 actor 資訊。

#### Scenario: Authenticated API call triggers audit log
- **WHEN** an authenticated user performs a mutation through an API route that calls setAuditActor()
- **THEN** the resulting AuditLog entry has actorId equal to the user's Supabase auth UID

#### Scenario: Actor info not set
- **WHEN** a DB mutation occurs without app.current_user_id being set (e.g., direct DB access)
- **THEN** AuditLog entry is still created with actorId=null (trigger does not fail)

### Requirement: Admin can view audit logs with pagination
管理員（Role = ADMIN）SHALL 能在 /admin/audit-logs 查閱所有 AuditLog 紀錄，支援分頁，每頁顯示 20 筆，可按 table 類型篩選。

#### Scenario: Admin views first page of audit logs
- **WHEN** admin navigates to /admin/audit-logs
- **THEN** system displays the 20 most recent AuditLog entries sorted by createdAt DESC

#### Scenario: Admin expands a log entry
- **WHEN** admin clicks on an AuditLog entry
- **THEN** system shows the oldData and newData JSON content inline

#### Scenario: Admin filters by table
- **WHEN** admin selects a table filter (e.g., "Appointment")
- **THEN** system shows only AuditLog entries where table="Appointment"

#### Scenario: Non-admin user accesses audit logs
- **WHEN** a USER or COACH accesses /admin/audit-logs
- **THEN** system redirects to /dashboard
