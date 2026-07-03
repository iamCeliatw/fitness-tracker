"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  iconOnly?: boolean;
  className?: string;
};

export default function LogoutButton({ iconOnly = false, className }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="登出"
      className={
        className ??
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150 w-full"
      }
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {!iconOnly && "登出"}
    </button>
  );
}
