"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "儀表板", href: "/admin", icon: LayoutDashboard },
  { label: "動作庫", href: "/admin/exercises", icon: Dumbbell },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white tracking-tight">
          Fit<span className="text-orange-400">Tracker</span>
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Admin</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-gray-800 text-orange-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          登出
        </button>
      </div>
    </aside>
  );
}
