import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// OAuth 回跳：交換 session 後依 role 導向（與 password 登入一致）
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const loginError = new URL("/login?error=oauth", req.url);

  if (!code) {
    return NextResponse.redirect(loginError);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(loginError);
  }

  const admin = await createAdminClient();
  const { data: dbUser } = await admin
    .from("User")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const target = dbUser?.role === "ADMIN" ? "/admin" : "/dashboard";
  return NextResponse.redirect(new URL(target, req.url));
}
