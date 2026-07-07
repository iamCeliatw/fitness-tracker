## ADDED Requirements

### Requirement: Coach can confirm a pending appointment
該預約的教練 SHALL 能透過 `PATCH /api/appointments/[id]`（`{ action: "confirm" }`）將 PENDING 預約轉為 CONFIRMED。非該預約教練回 403；非 PENDING 狀態回 409。

#### Scenario: Coach confirms a pending appointment
- **WHEN** coach sends PATCH /api/appointments/[id] with action "confirm" for their own PENDING appointment
- **THEN** system sets Appointment.status to CONFIRMED and returns 200; slot remains BOOKED

#### Scenario: Non-coach or another coach attempts to confirm
- **WHEN** a user whose id is not the appointment's coachId sends PATCH with action "confirm"
- **THEN** system returns 403

#### Scenario: Confirming a non-pending appointment
- **WHEN** coach sends PATCH with action "confirm" for an appointment whose status is not PENDING（含已過 expiresAt 而應過期者，系統先行結算）
- **THEN** system returns 409

### Requirement: Coach can reject a pending appointment with optional reason
該預約的教練 SHALL 能透過 `PATCH /api/appointments/[id]`（`{ action: "reject", reason?: string }`）拒絕 PENDING 預約：status 轉 REJECTED、`rejectedReason` 寫入（可為空）、slot 釋放回 OPEN。

#### Scenario: Coach rejects with a reason
- **WHEN** coach sends PATCH with action "reject" and reason "當天有私人行程"
- **THEN** system sets status to REJECTED, stores rejectedReason, sets Slot.status to OPEN, returns 200

#### Scenario: Coach rejects without a reason
- **WHEN** coach sends PATCH with action "reject" and no reason
- **THEN** system sets status to REJECTED with null rejectedReason and releases the slot

### Requirement: Pending appointments expire automatically
系統 SHALL 於建立預約時凍結 `expiresAt = min(now + org.approvalTimeoutHours, slot.startTime - org.bookingCutoffHours)`。讀取 slots／appointments／教練 Dashboard 時，系統 SHALL 先將 `status = PENDING AND expiresAt < now()` 的預約批次轉為 EXPIRED 並將其 slot 釋放回 OPEN（惰性結算，無排程系統）。

#### Scenario: Pending appointment passes its expiry
- **WHEN** a PENDING appointment's expiresAt is in the past and any user triggers a read of slots or appointments
- **THEN** system sets that appointment's status to EXPIRED and its Slot.status to OPEN before returning results

#### Scenario: Expiry frozen at creation
- **WHEN** admin changes approvalTimeoutHours after an appointment was created
- **THEN** the existing appointment's expiresAt is unchanged（不溯及既往）

#### Scenario: Cutoff is the final deadline
- **WHEN** a student books a slot starting in 3 hours（cutoff 2h、timeout 24h）
- **THEN** expiresAt is set to slot.startTime minus 2 hours（教練僅有 1 小時可回覆）

### Requirement: Approval timeout is configurable per organization
管理員 SHALL 能在 /admin/settings 調整 `Organization.approvalTimeoutHours`（正整數，預設 24），後續建立的預約以新值計算 expiresAt。

#### Scenario: Admin updates approval timeout
- **WHEN** admin submits a new positive integer for approvalTimeoutHours
- **THEN** system updates the org setting and subsequent bookings use the new value

#### Scenario: Invalid approval timeout value
- **WHEN** admin submits a non-positive value for approvalTimeoutHours
- **THEN** system returns 422 with validation error
