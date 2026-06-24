import { requireRole } from "@/lib/auth-helpers";
import { signOut } from "@/auth";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">後台管理</h1>
      <p className="text-gray-400 mb-6">管理員：{session.user.name ?? session.user.email}</p>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
        <button type="submit" className="text-sm text-orange-400 hover:text-orange-300">
          登出
        </button>
      </form>
    </div>
  );
}
