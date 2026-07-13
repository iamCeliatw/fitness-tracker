import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth-helpers";

/** API route 用的 ADMIN 驗證：非 ADMIN 回 null，由呼叫端回 403 */
export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = await createAdminClient();
  const { data: dbUser } = await admin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return { userId: user.id, admin };
}

/**
 * 動作庫管理的雙路徑守門：
 * - org 管理者（org-ADMIN 以上）→ orgId 為本館，管理館自訂動作
 * - 平台 ADMIN（全域 role）→ orgId 為 null，管理全域動作
 */
export async function getExerciseAdminContext() {
  const orgCtx = await getOrgContext("ADMIN");
  if (orgCtx) {
    return { userId: orgCtx.userId, admin: orgCtx.admin, orgId: orgCtx.orgId as string | null };
  }
  const platformCtx = await getAdminContext();
  if (platformCtx) {
    return { userId: platformCtx.userId, admin: platformCtx.admin, orgId: null as string | null };
  }
  return null;
}
