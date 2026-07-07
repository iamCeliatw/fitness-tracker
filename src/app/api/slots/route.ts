import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setAuditActor } from "@/lib/auth-helpers";
import { expireStalePending, SLOT_DURATION_MS } from "@/lib/appointments";

const slotSchema = z.object({
  startTime: z.string().datetime("無效的時間格式"),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId")
    .eq("userId", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "Not a member of any organization" }, { status: 403 });

  await expireStalePending(membership.orgId);

  const { data: slots } = await admin
    .from("AppointmentSlot")
    .select("*, coach:User(id, name, email)")
    .eq("orgId", membership.orgId)
    .eq("status", "OPEN")
    .order("startTime", { ascending: true });

  return NextResponse.json(slots ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId, role")
    .eq("userId", user.id)
    .single();

  if (!membership || membership.role !== "COACH") {
    return NextResponse.json({ error: "Forbidden: coach role required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = slotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { startTime } = parsed.data;
  const endTime = new Date(new Date(startTime).getTime() + SLOT_DURATION_MS).toISOString();

  // Conflict check: coach's existing OPEN/BOOKED slots
  const { data: conflicts } = await admin
    .from("AppointmentSlot")
    .select("id")
    .eq("coachId", user.id)
    .in("status", ["OPEN", "BOOKED"])
    .lt("startTime", endTime)
    .gt("endTime", startTime);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "此時段與您現有的時段重疊" }, { status: 409 });
  }

  await setAuditActor(user.id);

  const { data: slot, error } = await admin
    .from("AppointmentSlot")
    .insert({
      id: crypto.randomUUID(),
      coachId: user.id,
      orgId: membership.orgId,
      startTime,
      endTime,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(slot, { status: 201 });
}
