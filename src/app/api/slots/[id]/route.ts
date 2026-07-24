import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: slot } = await admin
    .from("AppointmentSlot")
    .select("id, coachId, status")
    .eq("id", id)
    .single();

  if (!slot) return NextResponse.json({ error: "時段不存在" }, { status: 404 });
  if (slot.coachId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Re-verify current org role (guards against demoted coaches using stale tokens)
  const ctx = await getOrgContext("COACH");
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (slot.status === "BOOKED") {
    return NextResponse.json({ error: "請先取消該時段的預約" }, { status: 409 });
  }

  const { error } = await admin.from("AppointmentSlot").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
