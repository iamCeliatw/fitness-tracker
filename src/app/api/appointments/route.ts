import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";

const bookSchema = z.object({
  slotId: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: appointments } = await admin
    .from("Appointment")
    .select("*, slot:AppointmentSlot(*), coach:User!Appointment_coachId_fkey(id, name, email)")
    .eq("studentId", user.id)
    .order("createdAt", { ascending: false });

  return NextResponse.json(appointments ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { slotId, notes } = parsed.data;
  const admin = await createAdminClient();

  // Fetch slot and org settings
  const { data: slot } = await admin
    .from("AppointmentSlot")
    .select("*, org:Organization(bookingCutoffHours)")
    .eq("id", slotId)
    .single();

  if (!slot) return NextResponse.json({ error: "時段不存在" }, { status: 404 });
  if (slot.status !== "OPEN") return NextResponse.json({ error: "此時段已被預約" }, { status: 409 });

  // Cutoff check
  const cutoffHours = (slot.org as { bookingCutoffHours: number })?.bookingCutoffHours ?? 2;
  const cutoffMs = cutoffHours * 60 * 60 * 1000;
  if (new Date(slot.startTime).getTime() - Date.now() < cutoffMs) {
    return NextResponse.json(
      { error: `距開課不足 ${cutoffHours} 小時，無法預約` },
      { status: 422 }
    );
  }

  // Overlap check for student's existing appointments
  const { data: conflicts } = await admin
    .from("Appointment")
    .select("id, slot:AppointmentSlot(startTime, endTime)")
    .eq("studentId", user.id)
    .eq("status", "CONFIRMED");

  const hasOverlap = (conflicts ?? []).some((apt) => {
    const s = apt.slot as unknown as { startTime: string; endTime: string } | null;
    if (!s) return false;
    return new Date(s.startTime) < new Date(slot.endTime) &&
           new Date(s.endTime) > new Date(slot.startTime);
  });

  if (hasOverlap) {
    return NextResponse.json({ error: "您在此時段已有其他預約" }, { status: 409 });
  }

  await setAuditActor(user.id);

  // Create appointment + update slot status (sequential, no transaction)
  const { data: appointment, error: aptError } = await admin
    .from("Appointment")
    .insert({
      id: crypto.randomUUID(),
      slotId,
      studentId: user.id,
      coachId: slot.coachId,
      orgId: slot.orgId,
      notes: notes ?? null,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (aptError) return NextResponse.json({ error: aptError.message }, { status: 500 });

  const { error: slotError } = await admin
    .from("AppointmentSlot")
    .update({ status: "BOOKED" })
    .eq("id", slotId);

  if (slotError) {
    // Compensate: delete the appointment
    await admin.from("Appointment").delete().eq("id", appointment.id);
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  return NextResponse.json(appointment, { status: 201 });
}
