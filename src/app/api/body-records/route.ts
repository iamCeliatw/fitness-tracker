import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subDays, startOfDay } from "date-fns";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const bodyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  weight: z.number().positive("請輸入有效體重"),
  bodyFat: z.number().min(0).max(100).nullable().optional(),
  muscleMass: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = Number(req.nextUrl.searchParams.get("range") ?? "90");
  const since = startOfDay(subDays(new Date(), range));

  const admin = await createAdminClient();
  const { data: records } = await admin
    .from("BodyRecord")
    .select("*")
    .eq("userId", user.id)
    .gte("date", since.toISOString())
    .order("date", { ascending: false });

  return NextResponse.json(records ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = bodyRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, weight, bodyFat, muscleMass, notes } = parsed.data;
  const now = new Date().toISOString();

  const admin = await createAdminClient();
  const { data: record, error } = await admin
    .from("BodyRecord")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date(date).toISOString(),
      weight,
      bodyFat: bodyFat ?? null,
      muscleMass: muscleMass ?? null,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(record, { status: 201 });
}
