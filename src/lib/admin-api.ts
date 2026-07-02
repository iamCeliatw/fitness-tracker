import { createClient, createAdminClient } from "@/lib/supabase/server";

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
