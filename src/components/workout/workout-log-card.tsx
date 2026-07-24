"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Trash2, Clock, Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocale } from "next-intl";
import { localizedExerciseName } from "@/lib/exercise-labels";

const MUSCLE_LABELS: Record<string, string> = {
  CHEST: "胸", BACK: "背", SHOULDERS: "肩", ARMS: "手臂",
  LEGS: "腿", CORE: "核心", CARDIO: "有氧", FULL_BODY: "全身",
};

export type WorkoutLogSummary = {
  id: string;
  date: string;
  notes: string | null;
  duration: number | null;
  exercises: {
    id: string;
    exerciseName: string;
    nameEn?: string | null;
    nameJa?: string | null;
    muscleGroup: string;
    sets: { setNumber: number; reps: number | null; weight: number | null }[];
  }[];
};

interface WorkoutLogCardProps {
  log: WorkoutLogSummary;
}

export default function WorkoutLogCard({ log }: WorkoutLogCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  async function handleDelete() {
    setIsDeleting(true);
    await fetch(`/api/workout-logs/${log.id}`, { method: "DELETE" });
    setIsDeleting(false);
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-800 transition-colors duration-150 hover:border-gray-700">
        <CardContent className="p-4">
          {/* Summary row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex-1 text-left"
              onClick={() => setExpanded((v) => !v)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-white font-medium text-sm">
                    {format(parseISO(log.date), "yyyy/MM/dd")}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {log.exercises.length} 個動作・{totalSets} 組
                    </span>
                    {log.duration && (
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.duration} 分鐘
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-600 hover:text-red-400 hover:bg-red-950/30"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-gray-300"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Expanded detail — grid-rows trick for smooth height transition */}
          <div className={`grid transition-all duration-200 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="mt-4 space-y-3 border-t border-gray-800 pt-3">
                {log.notes && (
                  <p className="text-gray-400 text-xs italic">備註：{log.notes}</p>
                )}
                {log.exercises.map((ex) => (
                  <div key={ex.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-300 text-sm font-medium">{localizedExerciseName({ name: ex.exerciseName, nameEn: ex.nameEn, nameJa: ex.nameJa }, locale)}</span>
                      <Badge variant="outline" className="text-xs border-gray-700 text-gray-500">
                        {MUSCLE_LABELS[ex.muscleGroup] ?? ex.muscleGroup}
                      </Badge>
                    </div>
                    <div className="space-y-1 pl-2">
                      {ex.sets.map((s) => (
                        <div key={s.setNumber} className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="w-4 text-gray-600">#{s.setNumber}</span>
                          {s.reps != null && <span>{s.reps} 次</span>}
                          {s.weight != null && <span>{s.weight} kg</span>}
                          {s.reps == null && s.weight == null && <span className="text-gray-600">—</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              此操作無法復原，確定要刪除這筆訓練記錄嗎？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
