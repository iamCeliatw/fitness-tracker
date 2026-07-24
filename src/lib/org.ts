import { createAdminClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>;

// 邀請碼查館：trim 後直接比對（base64url 區分大小寫），無效回 null
export async function findOrgByInviteCode(admin: AdminClient, inviteCode: string) {
  const code = inviteCode.trim();
  const { data: org } = await admin
    .from("Organization")
    .select("id")
    .eq("inviteCode", code)
    .single();
  return org?.id ?? null;
}

// 以 MEMBER 加入 org；失敗回傳 error（含 code），呼叫端可區分 23505 vs 其他
export async function joinOrgAsMember(admin: AdminClient, orgId: string, userId: string) {
  const { error } = await admin.from("OrganizationMember").insert({
    id: crypto.randomUUID(),
    role: "MEMBER",
    orgId,
    userId,
    joinedAt: new Date().toISOString(),
  });
  return error ?? null;
}

// 建館並使 userId 成為 OWNER
// Supabase 無交易：序列 insert + 失敗補償刪除；inviteCode/slug 撞碼（23505）重生一次
// 回傳 string（orgId）、"DUPLICATE"（userId 已有 membership）、或 null（其他失敗）
export async function createOrgWithOwner(
  admin: AdminClient,
  orgName: string,
  userId: string
): Promise<string | "DUPLICATE" | null> {
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
      await admin.from("Organization").delete().eq("id", orgId);
      if (memberError.code === "23505") return "DUPLICATE";
      console.error("[org] owner membership insert failed:", memberError.message);
      return null;
    }
    return orgId;
  }
  return null;
}
