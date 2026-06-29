import type { ReactNode } from "react";
import DashboardNav from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
