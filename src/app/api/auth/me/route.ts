import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const [{ data: dbUser }, { data: membership }] = await Promise.all([
    admin.from("User").select("role, name, email").eq("id", user.id).single(),
    admin
      .from("OrganizationMember")
      .select("role")
      .eq("userId", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    ...(dbUser ?? { role: "USER" }),
    orgRole: membership?.role ?? null,
  });
}
