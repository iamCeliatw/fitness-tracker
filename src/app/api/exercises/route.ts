import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import type { MuscleGroup } from "@/generated/prisma/enums";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const muscleGroup = req.nextUrl.searchParams.get("muscleGroup") as MuscleGroup | null;

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ isCustom: false }, { createdById: userId }],
      ...(muscleGroup ? { muscleGroup } : {}),
    },
    select: { id: true, name: true, muscleGroup: true, category: true },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(exercises);
}

const createExerciseSchema = z.object({
  name: z.string().min(1, "名稱不可為空"),
  muscleGroup: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: parsed.data.name,
      muscleGroup: parsed.data.muscleGroup as MuscleGroup,
      category: "STRENGTH",
      isCustom: true,
      createdById: session.user.id,
    },
    select: { id: true, name: true, muscleGroup: true, category: true },
  });

  return NextResponse.json(exercise, { status: 201 });
}
