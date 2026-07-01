import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;
const ALLOWED_TABLES = ["Appointment", "AppointmentSlot", "WorkoutLog"];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: dbUser } = await admin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const tableFilter = params.get("table");

  let query = admin
    .from("AuditLog")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (tableFilter && ALLOWED_TABLES.includes(tableFilter)) {
    query = query.eq("tableName", tableFilter);
  }

  const { data: logs, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    logs: logs ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
