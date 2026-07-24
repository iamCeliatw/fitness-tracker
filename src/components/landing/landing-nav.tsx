"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import RollText from "./roll-text";
import LocaleSwitcher from "@/components/locale-switcher";

const anchors = [
  { label: "功能", href: "#features" },
  { label: "角色", href: "#roles" },
  { label: "開始使用", href: "#cta" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200",
        scrolled
          ? "border-gray-800 bg-gray-950/80 backdrop-blur"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-white transition-colors hover:text-gray-200"
        >
          LIFT<span className="text-orange-500">LOG</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {anchors.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group text-sm text-gray-400 transition-colors hover:text-white"
            >
              <RollText>{item.label}</RollText>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="group px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            <RollText>登入</RollText>
          </Link>
          <Link
            href="/register"
            className="group rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
          >
            <RollText>免費註冊</RollText>
          </Link>
        </div>
      </nav>
    </header>
  );
}
