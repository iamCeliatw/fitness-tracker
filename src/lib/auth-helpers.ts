import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
