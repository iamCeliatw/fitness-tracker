import type { ReactNode } from "react";
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

  const displayName = dbUser?.name || user.email.split("@")[0];
  const orgRole = membership?.role ?? null;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <DashboardNav name={displayName} orgRole={orgRole} />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
