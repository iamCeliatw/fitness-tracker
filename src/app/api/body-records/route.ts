import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subDays, startOfDay } from "date-fns";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const bodyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  weight: z.number().positive("請輸入有效體重"),
  bodyFat: z.number().min(0).max(100).nullable().optional(),
  muscleMass: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = Number(req.nextUrl.searchParams.get("range") ?? "90");
  const since = startOfDay(subDays(new Date(), range));

  const records = await prisma.bodyRecord.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = bodyRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, weight, bodyFat, muscleMass, notes } = parsed.data;

  const record = await prisma.bodyRecord.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      weight,
      bodyFat: bodyFat ?? null,
      muscleMass: muscleMass ?? null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
