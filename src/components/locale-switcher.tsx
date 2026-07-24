"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Check } from "lucide-react";
import { setLocale } from "@/app/actions/set-locale";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const LOCALES = [
  { value: "zh-TW", label: "中文", short: "中" },
  { value: "en",    label: "English", short: "EN" },
  { value: "ja",    label: "日本語", short: "日" },
] as const;

export default function LocaleSwitcher() {
  const router = useRouter();
  const current = useLocale();
  const shortLabel = LOCALES.find(l => l.value === current)?.short ?? "中";

  async function handleSelect(value: string) {
    await setLocale(value as "zh-TW" | "en" | "ja");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">
        <Globe className="h-3.5 w-3.5" />
        <span>{shortLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleSelect(value)}
            className="flex items-center justify-between gap-2 text-sm"
          >
            {label}
            {current === value && <Check className="h-3.5 w-3.5 text-orange-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
