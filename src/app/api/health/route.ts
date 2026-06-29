import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = await createAdminClient();
  const { count } = await admin
    .from("User")
    .select("*", { count: "exact", head: true });
  return NextResponse.json({ status: "ok", userCount: count ?? 0 });
}
