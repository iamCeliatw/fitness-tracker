import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth-helpers";
import { generateInviteCode } from "@/lib/invite-code";

// 重置邀請碼：舊碼立即失效
export async function POST() {
  const ctx = await getOrgContext("OWNER");
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  for (let attempt = 0; attempt < 2; attempt++) {
    const inviteCode = generateInviteCode();
    const { data, error } = await ctx.admin
      .from("Organization")
      .update({ inviteCode })
      .eq("id", ctx.orgId)
      .select("inviteCode")
      .single();

    if (!error) return NextResponse.json(data);
    // 23505 = unique violation，撞碼重生一次
    if (error.code !== "23505" || attempt === 1) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "重置失敗" }, { status: 500 });
}
