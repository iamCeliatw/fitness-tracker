## ADDED Requirements

### Requirement: Student can book an available slot
學員（OrgRole = MEMBER）SHALL 能預約狀態為 OPEN 的 AppointmentSlot，系統需在建立 Appointment 前驗證衝突與截止時間規則。

#### Scenario: Student books a valid slot
- **WHEN** student sends POST /api/appointments with a valid slotId for an OPEN slot, no time conflicts, and slot is beyond cutoff time
- **THEN** system creates Appointment with status CONFIRMED, updates Slot.status to BOOKED, returns 201

#### Scenario: Student attempts to book an already-booked slot
- **WHEN** student sends POST /api/appointments for a slot with status BOOKED
- **THEN** system returns 409 with error "此時段已被預約"

#### Scenario: Student attempts to book a slot overlapping with their existing appointment
- **WHEN** student has an existing CONFIRMED appointment and attempts to book a slot whose time overlaps
- **THEN** system returns 409 with error "您在此時段已有其他預約"

#### Scenario: Student attempts to book within cutoff window
- **WHEN** slot.startTime is less than org.bookingCutoffHours from now
- **THEN** system returns 422 with error "距開課不足 N 小時，無法預約" (N = bookingCutoffHours)

### Requirement: User can cancel an appointment
預約的學員或該教練 SHALL 能取消 CONFIRMED 狀態的 Appointment，取消後 Slot.status 需回到 OPEN。

#### Scenario: Student cancels their own appointment
- **WHEN** student sends DELETE /api/appointments/[id] for their own appointment
- **THEN** system sets Appointment.status to CANCELLED, sets Appointment.cancelledAt, updates Slot.status to OPEN, returns 200

#### Scenario: Coach cancels a student's appointment
- **WHEN** coach sends DELETE /api/appointments/[id] for an appointment on their slot
- **THEN** system cancels the appointment and resets Slot.status to OPEN

#### Scenario: User attempts to cancel another user's appointment
- **WHEN** a user sends DELETE /api/appointments/[id] for an appointment that belongs to neither them nor their slot
- **THEN** system returns 403

### Requirement: Booking cutoff hours is configurable per organization
管理員（Role = ADMIN）SHALL 能在 /admin/settings 調整 Organization.bookingCutoffHours，預設值為 2。

#### Scenario: Admin updates booking cutoff hours
- **WHEN** admin submits a new value for bookingCutoffHours (positive integer)
- **THEN** system updates Organization.bookingCutoffHours and all subsequent booking validations use the new value

#### Scenario: Invalid cutoff hours value
- **WHEN** admin submits a non-positive value for bookingCutoffHours
- **THEN** system returns 422 with validation error
