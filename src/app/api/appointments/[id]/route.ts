import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: appointment } = await admin
    .from("Appointment")
    .select("id, studentId, coachId, slotId, status")
    .eq("id", id)
    .single();

  if (!appointment) return NextResponse.json({ error: "預約不存在" }, { status: 404 });

  const isStudent = appointment.studentId === user.id;
  const isCoach = appointment.coachId === user.id;
  if (!isStudent && !isCoach) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await setAuditActor(user.id);

  const { error: aptError } = await admin
    .from("Appointment")
    .update({ status: "CANCELLED", cancelledAt: new Date().toISOString() })
    .eq("id", id);

  if (aptError) return NextResponse.json({ error: aptError.message }, { status: 500 });

  await admin
    .from("AppointmentSlot")
    .update({ status: "OPEN" })
    .eq("id", appointment.slotId);

  return NextResponse.json({ success: true });
}
