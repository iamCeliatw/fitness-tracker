"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ExerciseFormDialog from "./exercise-form-dialog";
import ExerciseThumb from "@/components/exercise-thumb";
import {
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  CATEGORY_LABELS,
  localizedExerciseName,
} from "@/lib/exercise-labels";
import { useLocale } from "next-intl";

export type ExerciseRow = {
  id: string;
  name: string;
  nameEn?: string | null;
  nameJa?: string | null;
  description: string | null;
  muscleGroup: string;
  category: string;
  isCustom: boolean;
  createdById: string | null;
  orgId: string | null;
  imageUrl: string | null;
};

const FILTER_TABS = ["ALL", ...MUSCLE_GROUPS] as const;

export default function ExercisesManager({
  initialExercises,
  viewerOrgId,
}: {
  initialExercises: ExerciseRow[];
  viewerOrgId: string | null;
}) {
  const locale = useLocale();
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises);
  const [muscleFilter, setMuscleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExerciseRow | null>(null);
  const [deleting, setDeleting] = useState<ExerciseRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/exercises");
    if (res.ok) setExercises(await res.json());
  }

  async function handleDelete() {
    if (!deleting) return;
    setError(null);
    const res = await fetch(`/api/admin/exercises/${deleting.id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "刪除失敗");
      return;
    }
    await refresh();
  }

  const filtered = exercises.filter((ex) => {
    if (muscleFilter !== "ALL" && ex.muscleGroup !== muscleFilter) return false;
    if (search) {
      const displayName = localizedExerciseName(ex, locale);
      if (!displayName.toLowerCase().includes(search.toLowerCase()) &&
          !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar：搜尋 + 新增 */}
      <div className="flex gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋動作名稱…"
          className="bg-gray-900 border-gray-800 text-white"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          新增動作
        </Button>
      </div>

      {/* 肌群 Tab 篩選 */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((mg) => (
          <button
            key={mg}
            onClick={() => setMuscleFilter(mg)}
            className={`px-3 py-1 rounded-full text-sm transition-colors duration-150 ${
              muscleFilter === mg
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            {mg === "ALL" ? "全部" : MUSCLE_LABELS[mg]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* 列表 */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">沒有符合條件的動作</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((ex) => {
            // org 管理者視角：全域動作唯讀（只有本館動作可編輯/刪除）
            const readonly = viewerOrgId !== null && ex.orgId === null;
            return (
              <li
                key={ex.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 transition-colors duration-150 hover:border-gray-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ExerciseThumb imageUrl={ex.imageUrl} muscleGroup={ex.muscleGroup} name={ex.name} />
                  <span className="font-medium truncate">{localizedExerciseName(ex, locale)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 shrink-0">
                    {MUSCLE_LABELS[ex.muscleGroup] ?? ex.muscleGroup}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 shrink-0">
                    {CATEGORY_LABELS[ex.category] ?? ex.category}
                  </span>
                  {readonly && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-500 shrink-0">
                      內建
                    </span>
                  )}
                  {ex.isCustom && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-orange-500/40 text-orange-400 shrink-0">
                      自訂
                    </span>
                  )}
                </div>
                {!readonly && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!ex.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`編輯 ${ex.name}`}
                        onClick={() => {
                          setEditing(ex);
                          setFormOpen(true);
                        }}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`刪除 ${ex.name}`}
                      onClick={() => setDeleting(ex)}
                      className="text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ExerciseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editing}
        onSaved={refresh}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              確定要刪除「{deleting?.name}」嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
