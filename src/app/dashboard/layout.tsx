import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/dashboard-nav";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  const admin = await createAdminClient();
  const [{ data: dbUser }, { data: membership }] = await Promise.all([
    admin.from("User").select("name").eq("id", user.id).single(),
    admin
      .from("OrganizationMember")
      .select("role")
      .eq("userId", user.id)
      .maybeSingle(),
  ]);

  // 無 membership（OAuth 首登、org insert 失敗者）→ 補完 onboarding
  if (!membership) redirect("/onboarding");

  const displayName = dbUser?.name || user.email.split("@")[0];
  const orgRole = membership.role;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <DashboardNav name={displayName} orgRole={orgRole} avatarUrl={user.avatarUrl} />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
