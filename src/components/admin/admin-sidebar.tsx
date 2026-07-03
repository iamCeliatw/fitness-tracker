"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Users } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";

const navItems = [
  { label: "儀表板", href: "/admin", icon: LayoutDashboard },
  { label: "成員", href: "/admin/members", icon: Users },
  { label: "動作庫", href: "/admin/exercises", icon: Dumbbell },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-black text-white tracking-tight">
          LIFT<span className="text-orange-500">LOG</span>
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
        <LogoutButton />
      </div>
    </aside>
  );
}
