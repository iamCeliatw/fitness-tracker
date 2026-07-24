import type { Metadata } from "next";
import AuthScatter from "@/components/auth/auth-scatter";
import LocaleSwitcher from "@/components/locale-switcher";

export const metadata: Metadata = {
  title: "Authentication - Fitness Tracker",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      <AuthScatter />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">
            LIFT<span className="text-orange-500">LOG</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Track. Train. Transform.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
