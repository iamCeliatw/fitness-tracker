import { requireRole } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import AuditLogTable from "@/components/admin/audit-log-table";

const PAGE_SIZE = 20;
const ALLOWED_TABLES = ["Appointment", "AppointmentSlot", "WorkoutLog"];

interface PageProps {
  searchParams: Promise<{ page?: string; table?: string }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  await requireRole("ADMIN");

  const { page: pageParam, table: tableParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const tableFilter = tableParam && ALLOWED_TABLES.includes(tableParam) ? tableParam : null;

  const admin = await createAdminClient();
  let query = admin
    .from("AuditLog")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (tableFilter) {
    query = query.eq("tableName", tableFilter);
  }

  const { data: logs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">稽核紀錄</h1>
      <AuditLogTable
        logs={(logs ?? []) as Parameters<typeof AuditLogTable>[0]["logs"]}
        page={page}
        totalPages={totalPages}
        total={count ?? 0}
        tableFilter={tableFilter}
        allowedTables={ALLOWED_TABLES}
      />
    </div>
  );
}
