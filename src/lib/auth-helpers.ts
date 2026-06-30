import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { OrgRole } from "@/generated/prisma";

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

export async function requireOrgRole(role: OrgRole) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const admin = await createAdminClient();
  const { data: membership } = await admin
    .from("OrganizationMember")
    .select("role, orgId, org:Organization(bookingCutoffHours)")
    .eq("userId", user.id)
    .eq("role", role)
    .single();

  if (!membership) redirect("/dashboard");

  return { userId: user.id, orgId: membership.orgId, membership };
}

export async function setAuditActor(userId: string) {
  const admin = await createAdminClient();
  // Best-effort: sets app.current_user_id for the current PostgreSQL transaction.
  // actorId in AuditLog will be null if this and the subsequent insert run in separate connections.
  await admin.rpc("set_current_user_id", { p_user_id: userId });
}
