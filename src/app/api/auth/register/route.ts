import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  name: z.string().min(1, "姓名為必填"),
  email: z.string().email("請輸入有效的 Email"),
  password: z.string().min(6, "密碼至少 6 個字元"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }
  const { name, email, password } = parsed.data;

  // 無 cookie 的 anon client：註冊不建立本次請求的 session
  const anon = createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: signUpData, error: signUpError } = await anon.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return NextResponse.json({ error: "此 Email 已被註冊" }, { status: 409 });
    }
    return NextResponse.json({ error: signUpError.message }, { status: 422 });
  }

  const userId = signUpData.user?.id;
  // 開啟「防帳號列舉」設定時，重複 email 會回假成功且 identities 為空
  if (!userId || signUpData.user?.identities?.length === 0) {
    return NextResponse.json({ error: "此 Email 已被註冊" }, { status: 409 });
  }

  const admin = await createAdminClient();

  // 加入預設 org（最早建立者）為 MEMBER；失敗不擋註冊（可由回填 SQL 修復）
  const { data: org } = await admin
    .from("Organization")
    .select("id")
    .order("createdAt", { ascending: true })
    .limit(1)
    .single();

  if (org) {
    const { error: memberError } = await admin.from("OrganizationMember").insert({
      id: crypto.randomUUID(),
      role: "MEMBER",
      orgId: org.id,
      userId,
      joinedAt: new Date().toISOString(),
    });
    if (memberError) {
      console.error("[register] membership insert failed:", memberError.message);
    }
  } else {
    console.error("[register] no organization found — membership skipped");
  }

  // Bootstrap admin：email 相符（不分大小寫）自動升為全域 ADMIN
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (bootstrapEmail && email.toLowerCase() === bootstrapEmail.toLowerCase()) {
    const { error: roleError } = await admin
      .from("User")
      .update({ role: "ADMIN" })
      .eq("id", userId);
    if (roleError) {
      console.error("[register] bootstrap admin update failed:", roleError.message);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
