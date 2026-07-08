-- Booking 時間欄位 TIMESTAMP → TIMESTAMPTZ
-- 修正時區 bug：現存值為 UTC 但無時區標記，讀回被當本地時間解析（顯示偏移 -8h）
-- 現存值即為 UTC，USING ... AT TIME ZONE 'UTC' 標記語意，不搬資料
-- Run this in the Supabase SQL Editor

ALTER TABLE "AppointmentSlot"
  ALTER COLUMN "startTime" TYPE TIMESTAMPTZ(3) USING "startTime" AT TIME ZONE 'UTC',
  ALTER COLUMN "endTime"   TYPE TIMESTAMPTZ(3) USING "endTime"   AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

ALTER TABLE "Appointment"
  ALTER COLUMN "expiresAt"   TYPE TIMESTAMPTZ(3) USING "expiresAt"   AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt"   TYPE TIMESTAMPTZ(3) USING "createdAt"   AT TIME ZONE 'UTC',
  ALTER COLUMN "cancelledAt" TYPE TIMESTAMPTZ(3) USING "cancelledAt" AT TIME ZONE 'UTC';

-- Rollback（如需）：
-- ALTER TABLE "AppointmentSlot"
--   ALTER COLUMN "startTime" TYPE TIMESTAMP(3) USING "startTime" AT TIME ZONE 'UTC',
--   ALTER COLUMN "endTime"   TYPE TIMESTAMP(3) USING "endTime"   AT TIME ZONE 'UTC',
--   ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) USING "createdAt" AT TIME ZONE 'UTC';
-- ALTER TABLE "Appointment"
--   ALTER COLUMN "expiresAt"   TYPE TIMESTAMP(3) USING "expiresAt"   AT TIME ZONE 'UTC',
--   ALTER COLUMN "createdAt"   TYPE TIMESTAMP(3) USING "createdAt"   AT TIME ZONE 'UTC',
--   ALTER COLUMN "cancelledAt" TYPE TIMESTAMP(3) USING "cancelledAt" AT TIME ZONE 'UTC';
