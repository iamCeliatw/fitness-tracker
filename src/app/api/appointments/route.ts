import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";
import { expireStalePending } from "@/lib/appointments";

const bookSchema = z.object({
  slotId: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();

  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId")
    .eq("userId", user.id)
    .single();
  if (membership) await expireStalePending(membership.orgId);

  const { data: appointments } = await admin
    .from("Appointment")
    .select(
      "*, slot:AppointmentSlot(*), coach:User!Appointment_coachId_fkey(id, name, email)",
    )
    .eq("studentId", user.id)
    .order("createdAt", { ascending: false });

  return NextResponse.json(appointments ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { slotId, notes } = parsed.data;
  const admin = await createAdminClient();

  // Fetch slot and org settings
  const { data: slot } = await admin
    .from("AppointmentSlot")
    .select("*, org:Organization(bookingCutoffHours, approvalTimeoutHours)")
    .eq("id", slotId)
    .single();

  if (!slot) return NextResponse.json({ error: "時段不存在" }, { status: 404 });
  if (slot.status !== "OPEN")
    return NextResponse.json({ error: "此時段已被預約" }, { status: 409 });

  // Verify user is a member of the slot's org
  const { data: member } = await admin
    .from("OrganizationMember")
    .select("id")
    .eq("userId", user.id)
    .eq("orgId", slot.orgId)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Cutoff check
  const org = slot.org as {
    bookingCutoffHours: number;
    approvalTimeoutHours: number;
  } | null;
  const cutoffHours = org?.bookingCutoffHours ?? 2;
  const cutoffMs = cutoffHours * 60 * 60 * 1000;
  if (new Date(slot.startTime).getTime() - Date.now() < cutoffMs) {
    return NextResponse.json(
      { error: `距開課不足 ${cutoffHours} 小時，無法預約` },
      { status: 422 },
    );
  }

  // Overlap check for student's existing appointments
  const { data: conflicts } = await admin
    .from("Appointment")
    .select("id, slot:AppointmentSlot(startTime, endTime)")
    .eq("studentId", user.id)
    .in("status", ["PENDING", "CONFIRMED"]);

  const hasOverlap = (conflicts ?? []).some((apt) => {
    const s = apt.slot as unknown as {
      startTime: string;
      endTime: string;
    } | null;
    if (!s) return false;
    return (
      new Date(s.startTime) < new Date(slot.endTime) &&
      new Date(s.endTime) > new Date(slot.startTime)
    );
  });

  if (hasOverlap) {
    return NextResponse.json(
      { error: "您在此時段已有其他預約" },
      { status: 409 },
    );
  }

  await setAuditActor(user.id);

  // expiresAt 建立時凍結 = min(now + 回覆期限, 開課前 cutoff)
  const timeoutHours = org?.approvalTimeoutHours ?? 24;
  const expiresAt = new Date(
    Math.min(
      Date.now() + timeoutHours * 60 * 60 * 1000,
      new Date(slot.startTime).getTime() - cutoffMs,
    ),
  ).toISOString();

  // Atomic slot claim: conditional UPDATE ensures only one concurrent booking succeeds
  const { data: claimedSlot } = await admin
    .from("AppointmentSlot")
    .update({ status: "BOOKED" })
    .eq("id", slotId)
    .eq("status", "OPEN")
    .select("id")
    .single();
  if (!claimedSlot) {
    return NextResponse.json({ error: "此時段已被預約" }, { status: 409 });
  }

  // Check if a stale appointment already exists for this slot (CANCELLED / REJECTED / EXPIRED)
  // slotId is @unique so we must UPDATE rather than INSERT in that case
  const { data: existingApt } = await admin
    .from("Appointment")
    .select("id")
    .eq("slotId", slotId)
    .single();

  let appointment: Record<string, unknown> | null = null;
  let aptError: { message: string } | null = null;

  if (existingApt) {
    const { data, error } = await admin
      .from("Appointment")
      .update({
        studentId: user.id,
        coachId: slot.coachId,
        orgId: slot.orgId,
        notes: notes ?? null,
        status: "PENDING",
        expiresAt,
        cancelledAt: null,
        rejectedReason: null,
      })
      .eq("id", existingApt.id)
      .select()
      .single();
    appointment = data;
    aptError = error;
  } else {
    const { data, error } = await admin
      .from("Appointment")
      .insert({
        id: crypto.randomUUID(),
        slotId,
        studentId: user.id,
        coachId: slot.coachId,
        orgId: slot.orgId,
        notes: notes ?? null,
        status: "PENDING",
        expiresAt,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();
    appointment = data;
    aptError = error;
  }

  if (aptError) {
    // Compensate: release the slot we just claimed
    await admin.from("AppointmentSlot").update({ status: "OPEN" }).eq("id", slotId);
    return NextResponse.json({ error: aptError.message }, { status: 500 });
  }

  return NextResponse.json(appointment, { status: 201 });
}
