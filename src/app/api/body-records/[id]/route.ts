import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = await createAdminClient();

  const { data: record } = await admin
    .from("BodyRecord")
    .select("userId")
    .eq("id", id)
    .single();

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (record.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await admin.from("BodyRecord").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
