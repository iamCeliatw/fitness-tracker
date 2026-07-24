"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Weight,
  Utensils,
  CalendarDays,
  Users,
} from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import LocaleSwitcher from "@/components/locale-switcher";
import { useTranslations } from "next-intl";

const BASE_ITEM_KEYS = [
  { key: "overview" as const, href: "/dashboard", icon: LayoutDashboard },
  { key: "workout" as const, href: "/dashboard/workout", icon: Dumbbell },
  { key: "body" as const, href: "/dashboard/body", icon: Weight },
  { key: "food" as const, href: "/dashboard/food", icon: Utensils },
];

const BOOKING_ITEM = { key: "booking" as const, href: "/dashboard/booking", icon: CalendarDays };
const COACH_ITEM = { key: "coach" as const, href: "/dashboard/coach", icon: Users };

type DashboardNavProps = {
  name: string;
  orgRole: string | null;
  avatarUrl?: string | null;
};

// Google 頭像；載入失敗即整顆隱藏，fallback 回純文字呈現
function Avatar({ url, name }: { url: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外部 Google 頭像，不進 next/image remotePatterns
    <img
      src={url}
      alt={name}
      referrerPolicy="no-referrer"
      className="h-7 w-7 rounded-full shrink-0"
      onError={() => setBroken(true)}
    />
  );
}

function RoleBadge({ isCoach, label }: { isCoach: boolean; label: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
        isCoach
          ? "border-orange-500/40 text-orange-400"
          : "border-gray-700 text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}

function Brand({ className }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight text-white ${className ?? "text-lg"}`}>
      LIFT<span className="text-orange-500">LOG</span>
    </span>
  );
}

export default function DashboardNav({ name, orgRole, avatarUrl }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isCoach = orgRole === "COACH";

  const desktopItems = isCoach
    ? [...BASE_ITEM_KEYS, BOOKING_ITEM, COACH_ITEM]
    : [...BASE_ITEM_KEYS, BOOKING_ITEM];
  const mobileItems = [...BASE_ITEM_KEYS, isCoach ? COACH_ITEM : BOOKING_ITEM];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop left nav */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800 min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <Brand />
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {desktopItems.map(({ key, href, icon: Icon }) => (
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
              {t(key)}
            </Link>
          ))}
        </div>
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 pb-2">
            {avatarUrl && <Avatar url={avatarUrl} name={name} />}
            <span className="text-sm font-medium text-white truncate">{name}</span>
            <RoleBadge isCoach={isCoach} label={isCoach ? t("coach") : t("memberRole")} />
          </div>
          <div className="flex items-center justify-between">
            <LogoutButton />
            <LocaleSwitcher />
          </div>
        </div>
      </nav>

      {/* Mobile top header */}
      <header className="fixed top-0 left-0 right-0 md:hidden flex items-center justify-between h-12 px-4 bg-gray-900 border-b border-gray-800 z-50">
        <Brand className="text-base" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200 truncate max-w-32">{name}</span>
          <RoleBadge isCoach={isCoach} label={isCoach ? t("coach") : t("memberRole")} />
          <LocaleSwitcher />
          <LogoutButton
            iconOnly
            className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors duration-150"
          />
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden flex bg-gray-900 border-t border-gray-800 z-50">
        {mobileItems.map(({ key, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-150 ${
              isActive(href) ? "text-orange-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-0.5">{t(key)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
