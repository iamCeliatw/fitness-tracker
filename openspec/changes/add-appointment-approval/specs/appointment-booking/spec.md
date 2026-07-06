## MODIFIED Requirements

### Requirement: Student can book an available slot
學員（OrgRole = MEMBER）SHALL 能預約狀態為 OPEN 的 AppointmentSlot，系統需在建立 Appointment 前驗證衝突與截止時間規則。預約建立後為 **PENDING**（等待教練確認），時段立即鎖定（先到先得），並凍結 `expiresAt`。

#### Scenario: Student books a valid slot
- **WHEN** student sends POST /api/appointments with a valid slotId for an OPEN slot, no time conflicts, and slot is beyond cutoff time
- **THEN** system creates Appointment with status PENDING and computed expiresAt, updates Slot.status to BOOKED, returns 201

#### Scenario: Student attempts to book an already-booked slot
- **WHEN** student sends POST /api/appointments for a slot with status BOOKED（含他人 PENDING 中鎖定的時段）
- **THEN** system returns 409 with error "此時段已被預約"

#### Scenario: Student attempts to book a slot overlapping with their existing appointment
- **WHEN** student has an existing PENDING or CONFIRMED appointment and attempts to book a slot whose time overlaps
- **THEN** system returns 409 with error "您在此時段已有其他預約"

#### Scenario: Student attempts to book within cutoff window
- **WHEN** slot.startTime is less than org.bookingCutoffHours from now
- **THEN** system returns 422 with error "距開課不足 N 小時，無法預約" (N = bookingCutoffHours)

### Requirement: User can cancel an appointment
預約的學員或該教練 SHALL 能取消 **PENDING 或 CONFIRMED** 狀態的 Appointment，取消後 Slot.status 需回到 OPEN；已是終態（REJECTED / EXPIRED / CANCELLED）的預約回 409。

#### Scenario: Student cancels their own appointment
- **WHEN** student sends DELETE /api/appointments/[id] for their own PENDING or CONFIRMED appointment
- **THEN** system sets Appointment.status to CANCELLED, sets Appointment.cancelledAt, updates Slot.status to OPEN, returns 200

#### Scenario: Coach cancels a student's appointment
- **WHEN** coach sends DELETE /api/appointments/[id] for an appointment on their slot
- **THEN** system cancels the appointment and resets Slot.status to OPEN

#### Scenario: User attempts to cancel another user's appointment
- **WHEN** a user sends DELETE /api/appointments/[id] for an appointment that belongs to neither them nor their slot
- **THEN** system returns 403

#### Scenario: Cancelling a terminal appointment
- **WHEN** user sends DELETE /api/appointments/[id] for an appointment whose status is REJECTED, EXPIRED, or CANCELLED
- **THEN** system returns 409

## ADDED Requirements

### Requirement: Student sees appointment status
學員預約列表 SHALL 以 badge 呈現五種狀態：待確認（橘）/ 已確認（綠）/ 已拒絕（紅）/ 已過期（灰）/ 已取消（灰）。REJECTED 且有 `rejectedReason` 時 SHALL 顯示原因；PENDING 與 CONFIRMED 可取消。

#### Scenario: Student views a pending appointment
- **WHEN** student opens /dashboard/booking with a PENDING appointment
- **THEN** the appointment card shows 「待確認」badge and a cancel action

#### Scenario: Student views a rejected appointment with reason
- **WHEN** student's appointment was rejected with reason "當天有私人行程"
- **THEN** the card shows 「已拒絕」badge and the reason text

#### Scenario: Student views an expired appointment
- **WHEN** student's PENDING appointment passed its expiresAt and a read has settled it
- **THEN** the card shows 「已過期」badge with no cancel action
