import { requireRole } from "@/lib/auth-helpers";

export default async function AdminPage() {
  const { dbUser } = await requireRole("ADMIN");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-2">後台管理</h1>
      <p className="text-gray-400 mb-6">
        管理員：{dbUser.name ?? dbUser.email}
      </p>
    </div>
  );
}
