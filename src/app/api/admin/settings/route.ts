import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOwnerContext } from "@/lib/auth-helpers";

const settingsSchema = z.object({
  bookingCutoffHours: z.number().int().positive("必須為正整數"),
  approvalTimeoutHours: z.number().int().positive("必須為正整數"),
});

export async function GET() {
  const ctx = await getOwnerContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: org } = await ctx.admin
    .from("Organization")
    .select("id, name, bookingCutoffHours, approvalTimeoutHours, inviteCode")
    .eq("id", ctx.orgId)
    .single();

  if (!org) return NextResponse.json({ error: "找不到組織設定" }, { status: 404 });

  return NextResponse.json(org);
}

export async function PATCH(req: NextRequest) {
  const ctx = await getOwnerContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const { data, error } = await ctx.admin
    .from("Organization")
    .update({
      bookingCutoffHours: parsed.data.bookingCutoffHours,
      approvalTimeoutHours: parsed.data.approvalTimeoutHours,
    })
    .eq("id", ctx.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
