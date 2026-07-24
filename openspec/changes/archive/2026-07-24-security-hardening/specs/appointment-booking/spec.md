## MODIFIED Requirements

### Requirement: Student can book an available slot
學員（OrgRole = MEMBER）SHALL 能預約狀態為 OPEN 的 AppointmentSlot，系統需在建立 Appointment 前驗證：（1）發出請求的用戶在 `slot.orgId` 擁有有效 membership；（2）衝突與截止時間規則；（3）以 conditional UPDATE（`WHERE status='OPEN'`）原子性鎖定 slot，影響行數為 0 時回傳 409。預約建立後為 **PENDING**（等待教練確認），並凍結 `expiresAt`。

#### Scenario: Student books a valid slot
- **WHEN** student sends POST /api/appointments with a valid slotId for an OPEN slot in their own org, no time conflicts, and slot is beyond cutoff time
- **THEN** system atomically marks slot BOOKED, creates Appointment with status PENDING and computed expiresAt, returns 201

#### Scenario: 跨 org 預約被拒
- **WHEN** student 以其他 org 的 OPEN slot UUID 呼叫 POST /api/appointments
- **THEN** 系統回傳 403，不建立 Appointment，slot.status 維持 OPEN

#### Scenario: Student attempts to book an already-booked slot
- **WHEN** student sends POST /api/appointments for a slot with status BOOKED（含他人 PENDING 中鎖定的時段）
- **THEN** system returns 409 with error "此時段已被預約"

#### Scenario: 並發預約——後到者被 conditional UPDATE 拒絕
- **WHEN** 兩個同 org 用戶幾乎同時對同一 OPEN slot 送出預約
- **THEN** 其中一個成功（conditional UPDATE 影響 1 row），另一個收到 409

#### Scenario: Student attempts to book a slot overlapping with their existing appointment
- **WHEN** student has an existing PENDING or CONFIRMED appointment and attempts to book a slot whose time overlaps
- **THEN** system returns 409 with error "您在此時段已有其他預約"

#### Scenario: Student attempts to book within cutoff window
- **WHEN** slot.startTime is less than org.bookingCutoffHours from now
- **THEN** system returns 422 with error "距開課不足 N 小時，無法預約"
