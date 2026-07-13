import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await createAdminClient();
  const [{ data: dbUser }, { data: membership }] = await Promise.all([
    admin.from("User").select("role").eq("id", user.id).single(),
    admin.from("OrganizationMember").select("role").eq("userId", user.id).single(),
  ]);

  // 全域 ADMIN（平台 superadmin）或 org 管理者（org-ADMIN 以上）可進；各 page 另有自己的守門
  const isAdmin = dbUser?.role === "ADMIN";
  const isOwner = membership?.role === "OWNER";
  const isOrgManager = membership?.role === "OWNER" || membership?.role === "ADMIN";
  if (!isAdmin && !isOrgManager) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <AdminSidebar isAdmin={isAdmin} isOwner={isOwner} isOrgManager={isOrgManager} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
