import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { createOrgWithOwner, findOrgByInviteCode, joinOrgAsMember } from "@/lib/org";

const baseFields = {
  name: z.string().min(1, "姓名為必填"),
  email: z.string().email("請輸入有效的 Email"),
  password: z.string().min(6, "密碼至少 6 個字元"),
};

const registerSchema = z.discriminatedUnion("mode", [
  z.object({
    ...baseFields,
    mode: z.literal("create"),
    orgName: z.string().min(1, "健身房名稱為必填"),
  }),
  z.object({
    ...baseFields,
    mode: z.literal("join"),
    inviteCode: z.string().min(1, "邀請碼為必填"),
  }),
]);

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

  const admin = await createAdminClient();

  // join 模式：signUp 前先驗邀請碼——無效碼不得產生孤兒 auth 帳號
  let joinOrgId: string | null = null;
  if (parsed.data.mode === "join") {
    joinOrgId = await findOrgByInviteCode(admin, parsed.data.inviteCode);
    if (!joinOrgId) {
      return NextResponse.json({ error: "邀請碼無效" }, { status: 422 });
    }
  }

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

  // 建立 org / membership：失敗不擋註冊（帳號可用，membership 屬可修復狀態）
  if (parsed.data.mode === "join") {
    const memberError = await joinOrgAsMember(admin, joinOrgId!, userId);
    if (memberError) {
      console.error("[register] membership insert failed:", memberError);
    }
  } else {
    await createOrgWithOwner(admin, parsed.data.orgName, userId);
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
