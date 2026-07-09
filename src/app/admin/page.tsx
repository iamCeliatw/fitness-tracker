import { requireAuth } from "@/lib/auth-helpers";

export default async function AdminPage() {
  // 存取控制在 admin layout（全域 ADMIN 或 org 管理者）
  const user = await requireAuth();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-2">後台管理</h1>
      <p className="text-gray-400 mb-6">
        管理員：{user.name ?? user.email}
      </p>
    </div>
  );
}
