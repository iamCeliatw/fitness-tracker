import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-api";
import { setAuditActor } from "@/lib/auth-helpers";

const createSchema = z.object({
  coachId: z.string().min(1),
  studentId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }
  const { coachId, studentId } = parsed.data;

  if (coachId === studentId) {
    return NextResponse.json(
      { error: "教練與學員不可為同一人" },
      { status: 422 }
    );
  }

  // 配對隸屬教練 membership 的組織
  const { data: coachMembership } = await ctx.admin
    .from("OrganizationMember")
    .select("orgId")
    .eq("userId", coachId)
    .eq("role", "COACH")
    .single();

  if (!coachMembership) {
    return NextResponse.json(
      { error: "該用戶不是任何組織的教練" },
      { status: 422 }
    );
  }

  // unique constraint 蓋在 (coachId, studentId, orgId) 不分 status：
  // 已結束的舊配對要重新啟用（UPDATE），不能 INSERT
  const { data: existing } = await ctx.admin
    .from("CoachStudent")
    .select("id, status")
    .eq("coachId", coachId)
    .eq("studentId", studentId)
    .eq("orgId", coachMembership.orgId)
    .maybeSingle();

  if (existing?.status === "ACTIVE") {
    return NextResponse.json(
      { error: "此學員已配對給該教練" },
      { status: 409 }
    );
  }

  await setAuditActor(ctx.userId);

  if (existing) {
    const { data, error } = await ctx.admin
      .from("CoachStudent")
      .update({ status: "ACTIVE", assignedAt: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, coachId, studentId, status")
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  const { data, error } = await ctx.admin
    .from("CoachStudent")
    .insert({
      id: crypto.randomUUID(),
      coachId,
      studentId,
      orgId: coachMembership.orgId,
      status: "ACTIVE",
      assignedAt: new Date().toISOString(),
    })
    .select("id, coachId, studentId, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
