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

  const { data: entry } = await admin
    .from("FoodEntry")
    .select("userId")
    .eq("id", id)
    .single();

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await admin.from("FoodEntry").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
