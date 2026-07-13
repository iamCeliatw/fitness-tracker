import { createAdminClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>;

// 邀請碼查館：正規化（trim + 大寫）後查詢，無效回 null
export async function findOrgByInviteCode(admin: AdminClient, inviteCode: string) {
  const code = inviteCode.trim().toUpperCase();
  const { data: org } = await admin
    .from("Organization")
    .select("id")
    .eq("inviteCode", code)
    .single();
  return org?.id ?? null;
}

// 以 MEMBER 加入 org；失敗回傳 error message（呼叫端決定要不要擋）
export async function joinOrgAsMember(admin: AdminClient, orgId: string, userId: string) {
  const { error } = await admin.from("OrganizationMember").insert({
    id: crypto.randomUUID(),
    role: "MEMBER",
    orgId,
    userId,
    joinedAt: new Date().toISOString(),
  });
  return error?.message ?? null;
}

// 建館並使 userId 成為 OWNER
// Supabase 無交易：序列 insert + 失敗補償刪除；inviteCode/slug 撞碼（23505）重生一次
export async function createOrgWithOwner(
  admin: AdminClient,
  orgName: string,
  userId: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const orgId = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const { error: orgError } = await admin.from("Organization").insert({
      id: orgId,
      name: orgName,
      slug: `gym-${inviteCode.toLowerCase()}`,
      inviteCode,
      updatedAt: new Date().toISOString(),
    });

    if (orgError) {
      if (orgError.code === "23505" && attempt === 0) continue;
      console.error("[org] organization insert failed:", orgError.message);
      return null;
    }

    const { error: memberError } = await admin.from("OrganizationMember").insert({
      id: crypto.randomUUID(),
      role: "OWNER",
      orgId,
      userId,
      joinedAt: new Date().toISOString(),
    });

    if (memberError) {
      console.error("[org] owner membership insert failed:", memberError.message);
      await admin.from("Organization").delete().eq("id", orgId);
      return null;
    }
    return orgId;
  }
  return null;
}
