import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import WorkoutLogList from "@/components/workout/workout-log-list";
import type { WorkoutLogSummary } from "@/components/workout/workout-log-card";

export default async function WorkoutPage() {
  const user = await requireAuth();

  const admin = await createAdminClient();
  const { data: logs } = await admin
    .from("WorkoutLog")
    .select(`
      id, date, notes, duration,
      exercises:WorkoutLogExercise(
        id, order,
        exercise:Exercise(name, nameEn, nameJa, muscleGroup),
        sets:WorkoutSet(setNumber, reps, weight)
      )
    `)
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .limit(20);

  const summaries: WorkoutLogSummary[] = (logs ?? []).map((log) => ({
    id: log.id,
    date: new Date(log.date).toISOString().split("T")[0],
    notes: log.notes,
    duration: log.duration,
    exercises: (log.exercises as unknown as {
      id: string;
      exercise: { name: string; nameEn: string | null; nameJa: string | null; muscleGroup: string };
      sets: { setNumber: number; reps: number | null; weight: number | null }[];
    }[]).map((ex) => ({
      id: ex.id,
      exerciseName: ex.exercise.name,
      nameEn: ex.exercise.nameEn,
      nameJa: ex.exercise.nameJa,
      muscleGroup: ex.exercise.muscleGroup,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight,
      })),
    })),
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        總覽
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">訓練日誌</h1>
          <p className="text-gray-400 text-sm mt-1">記錄每次重訓的動作與組數</p>
        </div>
        <Link
          href="/dashboard/workout/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增訓練
        </Link>
      </div>

      <WorkoutLogList logs={summaries} />
    </div>
  );
}
