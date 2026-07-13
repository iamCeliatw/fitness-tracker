import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { OrgRole } from "@/generated/prisma/enums";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  return {
    id: user.id,
    email: user.email!,
    name: (user.user_metadata?.name as string | undefined) ?? null,
  };
}

export async function requireRole(role: "USER" | "ADMIN") {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const admin = await createAdminClient();
  const { data: dbUser } = await admin
    .from("User")
    .select("role, id, email, name")
    .eq("id", user.id)
    .single();

  if (!dbUser || dbUser.role !== role) redirect("/dashboard");

  return { dbUser };
}

// OrgRole 階層：高位角色自動通過低位檢查（OWNER 兼教練等）
const ORG_ROLE_RANK: Record<OrgRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  COACH: 2,
  MEMBER: 1,
};

export async function requireOrgRole(minRole: OrgRole) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const admin = await createAdminClient();
  // 一人一館：user 至多一筆 membership，先取 membership 再驗角色
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("role, orgId, org:Organization(bookingCutoffHours)")
    .eq("userId", user.id)
    .single();

  if (!membership || ORG_ROLE_RANK[membership.role as OrgRole] < ORG_ROLE_RANK[minRole]) {
    redirect("/dashboard");
  }

  return {
    userId: user.id,
    orgId: membership.orgId,
    role: membership.role as OrgRole,
    membership,
  };
}

// API route 版 org 守門（回 null 而非 redirect）；org 由呼叫者 membership 決定
export async function getOrgContext(minRole: OrgRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("orgId, role")
    .eq("userId", user.id)
    .single();

  if (!membership || ORG_ROLE_RANK[membership.role as OrgRole] < ORG_ROLE_RANK[minRole]) {
    return null;
  }
  return {
    userId: user.id,
    orgId: membership.orgId,
    role: membership.role as OrgRole,
    admin,
  };
}

export async function setAuditActor(userId: string) {
  const admin = await createAdminClient();
  // Best-effort: sets app.current_user_id for the current PostgreSQL transaction.
  // actorId in AuditLog will be null if this and the subsequent insert run in separate connections.
  await admin.rpc("set_current_user_id", { p_user_id: userId });
}
