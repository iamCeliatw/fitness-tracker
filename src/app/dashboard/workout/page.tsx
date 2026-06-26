import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import WorkoutLogList from "@/components/workout/workout-log-list";
import type { WorkoutLogSummary } from "@/components/workout/workout-log-card";

export default async function WorkoutPage() {
  const session = await requireAuth();

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

  const summaries: WorkoutLogSummary[] = logs.map((log) => ({
    id: log.id,
    date: log.date.toISOString().split("T")[0],
    notes: log.notes,
    duration: log.duration,
    exercises: log.exercises.map((ex) => ({
      id: ex.id,
      exerciseName: ex.exercise.name,
      muscleGroup: ex.exercise.muscleGroup,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight,
      })),
    })),
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
