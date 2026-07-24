import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrgContext, setAuditActor, ORG_ROLE_RANK } from "@/lib/auth-helpers";
import type { OrgRole } from "@/generated/prisma/enums";

const patchSchema = z.object({
  role: z.enum(["COACH", "MEMBER"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getOrgContext("ADMIN");
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }

  const { data: membership } = await ctx.admin
    .from("OrganizationMember")
    .select("id, role, userId, orgId")
    .eq("id", id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "找不到該成員" }, { status: 404 });
  }
  if (membership.orgId !== ctx.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Rank guard: cannot modify members at or above your own rank
  if (ORG_ROLE_RANK[membership.role as OrgRole] >= ORG_ROLE_RANK[ctx.role]) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 降級防呆：教練仍有 ACTIVE 配對或未來 OPEN/BOOKED 時段 → 409
  if (membership.role === "COACH" && parsed.data.role === "MEMBER") {
    const { count: activePairings } = await ctx.admin
      .from("CoachStudent")
      .select("id", { count: "exact", head: true })
      .eq("coachId", membership.userId)
      .eq("status", "ACTIVE");

    const { count: futureSlots } = await ctx.admin
      .from("AppointmentSlot")
      .select("id", { count: "exact", head: true })
      .eq("coachId", membership.userId)
      .in("status", ["OPEN", "BOOKED"])
      .gte("startTime", new Date().toISOString());

    if ((activePairings ?? 0) > 0 || (futureSlots ?? 0) > 0) {
      return NextResponse.json(
        { error: "該教練仍有進行中的配對或未來時段，請先結束後再降級" },
        { status: 409 }
      );
    }
  }

  await setAuditActor(ctx.userId);
  const { data, error } = await ctx.admin
    .from("OrganizationMember")
    .update({ role: parsed.data.role })
    .eq("id", id)
    .select("id, role")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
