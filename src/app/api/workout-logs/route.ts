import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().positive().optional(),
  weight: z.number().min(0).optional(),
});

const exerciseSchema = z.object({
  exerciseId: z.string().min(1),
  order: z.number().int().min(0),
  sets: z.array(setSchema).min(1),
});

const workoutLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  notes: z.string().optional(),
  duration: z.number().int().positive().optional(),
  exercises: z.array(exerciseSchema).min(1, "請至少加入一個動作"),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 20,
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: { select: { name: true, muscleGroup: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = workoutLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, notes, duration, exercises } = parsed.data;

  const newLog = await prisma.workoutLog.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      notes: notes ?? null,
      duration: duration ?? null,
    },
  });

  try {
    for (const ex of exercises) {
      const logExercise = await prisma.workoutLogExercise.create({
        data: { logId: newLog.id, exerciseId: ex.exerciseId, order: ex.order },
      });

      for (const s of ex.sets) {
        await prisma.workoutSet.create({
          data: {
            exerciseId: logExercise.id,
            setNumber: s.setNumber,
            reps: s.reps ?? null,
            weight: s.weight ?? null,
            completed: true,
          },
        });
      }
    }
  } catch {
    await prisma.workoutLog.delete({ where: { id: newLog.id } }).catch(() => {});
    return NextResponse.json({ error: "訓練記錄儲存失敗，請稍後再試" }, { status: 500 });
  }

  return NextResponse.json(newLog, { status: 201 });
}
