import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-api";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: members, error } = await ctx.admin
    .from("OrganizationMember")
    .select("id, role, joinedAt, userId, user:User(id, name, email)")
    .order("joinedAt", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ACTIVE 配對摘要（教練 → 學員）
  const { data: pairings } = await ctx.admin
    .from("CoachStudent")
    .select(
      "id, status, coachId, studentId, student:User!CoachStudent_studentId_fkey(id, name, email)"
    )
    .eq("status", "ACTIVE");

  return NextResponse.json({ members: members ?? [], pairings: pairings ?? [] });
}
