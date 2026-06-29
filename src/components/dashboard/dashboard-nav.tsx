"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Weight, Utensils } from "lucide-react";

const navItems = [
  { label: "總覽", href: "/dashboard", icon: LayoutDashboard },
  { label: "訓練", href: "/dashboard/workout", icon: Dumbbell },
  { label: "體重", href: "/dashboard/body", icon: Weight },
  { label: "飲食", href: "/dashboard/food", icon: Utensils },
];

export default function DashboardNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop left nav */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800 min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <span className="text-lg font-bold text-white tracking-tight">
            Fit<span className="text-orange-400">Tracker</span>
          </span>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive(href)
                  ? "bg-gray-800 text-orange-400"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden flex bg-gray-900 border-t border-gray-800 z-50">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-150 ${
              isActive(href) ? "text-orange-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-0.5">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
