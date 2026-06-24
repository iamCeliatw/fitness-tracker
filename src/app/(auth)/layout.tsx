import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Fitness Tracker",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-white">
            LIFT<span className="text-orange-500">LOG</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track. Train. Transform.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
