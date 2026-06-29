import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: logs } = await admin
    .from("WorkoutLog")
    .select(`
      *,
      exercises:WorkoutLogExercise(
        *,
        exercise:Exercise(name, muscleGroup),
        sets:WorkoutSet(*)
      )
    `)
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .limit(20);

  return NextResponse.json(logs ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = workoutLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { date, notes, duration, exercises } = parsed.data;
  const now = new Date().toISOString();
  const admin = await createAdminClient();

  const { data: newLog, error: logError } = await admin
    .from("WorkoutLog")
    .insert({
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date(date).toISOString(),
      notes: notes ?? null,
      duration: duration ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (logError || !newLog) {
    return NextResponse.json({ error: "訓練記錄儲存失敗，請稍後再試" }, { status: 500 });
  }

  try {
    for (const ex of exercises) {
      const { data: logExercise, error: exError } = await admin
        .from("WorkoutLogExercise")
        .insert({
          id: crypto.randomUUID(),
          logId: newLog.id,
          exerciseId: ex.exerciseId,
          order: ex.order,
        })
        .select()
        .single();

      if (exError || !logExercise) throw new Error(exError?.message ?? "Exercise insert failed");

      for (const s of ex.sets) {
        const { error: setError } = await admin
          .from("WorkoutSet")
          .insert({
            id: crypto.randomUUID(),
            exerciseId: logExercise.id,
            setNumber: s.setNumber,
            reps: s.reps ?? null,
            weight: s.weight ?? null,
            completed: true,
          });

        if (setError) throw new Error(setError.message);
      }
    }
  } catch {
    await admin.from("WorkoutLog").delete().eq("id", newLog.id);
    return NextResponse.json({ error: "訓練記錄儲存失敗，請稍後再試" }, { status: 500 });
  }

  return NextResponse.json(newLog, { status: 201 });
}
