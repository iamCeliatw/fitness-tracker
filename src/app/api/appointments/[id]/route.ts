import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";

const respondSchema = z.object({
  action: z.enum(["confirm", "reject"]),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data: appointment } = await admin
    .from("Appointment")
    .select("id, coachId, slotId, status, expiresAt")
    .eq("id", id)
    .single();

  if (!appointment) return NextResponse.json({ error: "預約不存在" }, { status: 404 });
  if (appointment.coachId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (appointment.status !== "PENDING") {
    return NextResponse.json({ error: "此預約已非待確認狀態" }, { status: 409 });
  }

  await setAuditActor(user.id);

  // 已過 expiresAt 的 PENDING：先結算成過期，不允許再確認/拒絕
  if (appointment.expiresAt && new Date(appointment.expiresAt) < new Date()) {
    await admin.from("Appointment").update({ status: "EXPIRED" }).eq("id", id);
    await admin.from("AppointmentSlot").update({ status: "OPEN" }).eq("id", appointment.slotId);
    return NextResponse.json({ error: "此預約已逾期，時段已重新開放" }, { status: 409 });
  }

  if (parsed.data.action === "confirm") {
    const { error } = await admin
      .from("Appointment")
      .update({ status: "CONFIRMED" })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // reject：寫入原因 + 釋放時段
  const { error: rejectError } = await admin
    .from("Appointment")
    .update({ status: "REJECTED", rejectedReason: parsed.data.reason?.trim() || null })
    .eq("id", id);
  if (rejectError) return NextResponse.json({ error: rejectError.message }, { status: 500 });

  await admin
    .from("AppointmentSlot")
    .update({ status: "OPEN" })
    .eq("id", appointment.slotId);

  return NextResponse.json({ success: true });
}

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

  // 僅 PENDING / CONFIRMED 可取消，終態回 409
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    return NextResponse.json({ error: "此預約已結束，無法取消" }, { status: 409 });
  }

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
