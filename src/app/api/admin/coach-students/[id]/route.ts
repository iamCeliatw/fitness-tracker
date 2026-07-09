import { NextRequest, NextResponse } from "next/server";
import { getOrgContext, setAuditActor } from "@/lib/auth-helpers";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getOrgContext("ADMIN");
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { data: pairing } = await ctx.admin
    .from("CoachStudent")
    .select("id, status, orgId")
    .eq("id", id)
    .single();

  if (!pairing) {
    return NextResponse.json({ error: "找不到該配對" }, { status: 404 });
  }
  if (pairing.orgId !== ctx.orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pairing.status !== "ACTIVE") {
    return NextResponse.json({ error: "該配對已結束" }, { status: 409 });
  }

  await setAuditActor(ctx.userId);
  const { data, error } = await ctx.admin
    .from("CoachStudent")
    .update({ status: "ENDED" })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
