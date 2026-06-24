import { requireAuth } from "@/lib/auth-helpers";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-6">歡迎回來，{session.user.name ?? session.user.email}</p>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
        <button type="submit" className="text-sm text-orange-400 hover:text-orange-300">
          登出
        </button>
      </form>
    </div>
  );
}
