import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  bookingCutoffHours: z.number().int().positive("必須為正整數"),
});

async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = await createAdminClient();
  const { data: dbUser } = await admin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return { userId: user.id, admin };
}

export async function GET() {
  const ctx = await getAdminUser();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: org } = await ctx.admin
    .from("Organization")
    .select("id, name, bookingCutoffHours")
    .single();

  return NextResponse.json(org ?? { bookingCutoffHours: 2 });
}

export async function PATCH(req: NextRequest) {
  const ctx = await getAdminUser();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const { data: org } = await ctx.admin.from("Organization").select("id").single();
  if (!org) return NextResponse.json({ error: "找不到組織設定" }, { status: 404 });

  const { data, error } = await ctx.admin
    .from("Organization")
    .update({ bookingCutoffHours: parsed.data.bookingCutoffHours })
    .eq("id", org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
