-- Phase 2: Coach Booking System + Audit Log
-- Run this in the Neon SQL Editor

-- Add bookingCutoffHours to Organization
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "bookingCutoffHours" INTEGER NOT NULL DEFAULT 2;

-- CreateTable AppointmentSlot
CREATE TABLE IF NOT EXISTS "AppointmentSlot" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coachId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    CONSTRAINT "AppointmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable Appointment
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "slotId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_slotId_key" ON "Appointment"("slotId");

-- AddForeignKey
ALTER TABLE "AppointmentSlot"
  ADD CONSTRAINT "AppointmentSlot_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AppointmentSlot"
  ADD CONSTRAINT "AppointmentSlot_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_slotId_fkey"
  FOREIGN KEY ("slotId") REFERENCES "AppointmentSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Audit Log Trigger ────────────────────────────────────────────────────────

-- Helper: call via supabase.rpc('set_current_user_id', { p_user_id: userId })
-- Note: only persists within the same PostgreSQL transaction
CREATE OR REPLACE FUNCTION set_current_user_id(p_user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_user_id', p_user_id, true);
$$;

CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog" (id, "tableName", "recordId", operation, "oldData", "newData", "actorId", "createdAt")
  VALUES (
    gen_random_uuid()::text,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::jsonb END,
    current_setting('app.current_user_id', true),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Appointment
DROP TRIGGER IF EXISTS audit_appointments ON "Appointment";
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON "Appointment"
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Trigger on AppointmentSlot
DROP TRIGGER IF EXISTS audit_slots ON "AppointmentSlot";
CREATE TRIGGER audit_slots
  AFTER INSERT OR UPDATE OR DELETE ON "AppointmentSlot"
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- Trigger on WorkoutLog
DROP TRIGGER IF EXISTS audit_workout_logs ON "WorkoutLog";
CREATE TRIGGER audit_workout_logs
  AFTER INSERT OR UPDATE OR DELETE ON "WorkoutLog"
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
