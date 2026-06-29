import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
