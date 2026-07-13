import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createOrgWithOwner, findOrgByInviteCode, joinOrgAsMember } from "@/lib/org";

const onboardingSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    orgName: z.string().min(1, "健身房名稱為必填"),
  }),
  z.object({
    mode: z.literal("join"),
    inviteCode: z.string().min(1, "邀請碼為必填"),
  }),
]);

// 補完 onboarding：已登入但無 membership 的用戶（OAuth 首登、org insert 失敗者）
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }

  const admin = await createAdminClient();
  const { data: existing } = await admin
    .from("OrganizationMember")
    .select("id")
    .eq("userId", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "已加入健身房" }, { status: 409 });
  }

  if (parsed.data.mode === "join") {
    const orgId = await findOrgByInviteCode(admin, parsed.data.inviteCode);
    if (!orgId) {
      return NextResponse.json({ error: "邀請碼無效" }, { status: 422 });
    }
    const memberError = await joinOrgAsMember(admin, orgId, user.id);
    if (memberError) {
      console.error("[onboarding] membership insert failed:", memberError);
      return NextResponse.json({ error: "加入失敗，請稍後再試" }, { status: 500 });
    }
  } else {
    const orgId = await createOrgWithOwner(admin, parsed.data.orgName, user.id);
    if (!orgId) {
      return NextResponse.json({ error: "建立失敗，請稍後再試" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
