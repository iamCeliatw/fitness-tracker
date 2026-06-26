import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { MealType } from "@/generated/prisma/enums";

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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  const target = dateParam ? new Date(dateParam) : new Date();
  const from = startOfDay(target);
  const to = endOfDay(target);

  const entries = await prisma.foodEntry.findMany({
    where: { userId: session.user.id, date: { gte: from, lte: to } },
    orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = foodEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, mealType, name, calories, protein, carbs, fat, amount, unit } = parsed.data;

  const entry = await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      mealType: mealType as MealType,
      name,
      calories,
      protein: protein ?? null,
      carbs: carbs ?? null,
      fat: fat ?? null,
      amount: amount ?? null,
      unit: unit ?? null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
