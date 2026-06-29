import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const foodEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  name: z.string().min(1, "請輸入食物名稱"),
  calories: z.number().positive("請輸入有效熱量"),
  protein: z.number().min(0).nullable().optional(),
  carbs: z.number().min(0).nullable().optional(),
  fat: z.number().min(0).nullable().optional(),
  amount: z.number().positive().nullable().optional(),
  unit: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  const target = dateParam ? new Date(dateParam) : new Date();
  const from = startOfDay(target);
  const to = endOfDay(target);

  const admin = await createAdminClient();
  const { data: entries } = await admin
    .from("FoodEntry")
    .select("*")
    .eq("userId", user.id)
    .gte("date", from.toISOString())
    .lte("date", to.toISOString())
    .order("mealType", { ascending: true })
    .order("createdAt", { ascending: true });

  return NextResponse.json(entries ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = foodEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, mealType, name, calories, protein, carbs, fat, amount, unit } = parsed.data;
  const now = new Date().toISOString();

  const admin = await createAdminClient();
  const { data: entry, error } = await admin
    .from("FoodEntry")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date(date).toISOString(),
      mealType,
      name,
      calories,
      protein: protein ?? null,
      carbs: carbs ?? null,
      fat: fat ?? null,
      amount: amount ?? null,
      unit: unit ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(entry, { status: 201 });
}
