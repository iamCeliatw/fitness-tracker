"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  EXERCISE_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/exercise-labels";
import type { ExerciseRow } from "./exercises-manager";

type ExerciseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = 新增模式 */
  exercise: ExerciseRow | null;
  onSaved: () => void;
};

const muscleItems = MUSCLE_GROUPS.map((mg) => ({ value: mg, label: MUSCLE_LABELS[mg] }));
const categoryItems = EXERCISE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));

export default function ExerciseFormDialog({
  open,
  onOpenChange,
  exercise,
  onSaved,
}: ExerciseFormDialogProps) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string>("CHEST");
  const [category, setCategory] = useState<string>("STRENGTH");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(exercise?.name ?? "");
      setMuscleGroup(exercise?.muscleGroup ?? "CHEST");
      setCategory(exercise?.category ?? "STRENGTH");
      setDescription(exercise?.description ?? "");
      setError(null);
    }
  }, [open, exercise]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("名稱不可為空");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      muscleGroup,
      category,
      description: description.trim() || undefined,
    };
    const res = exercise
      ? await fetch(`/api/admin/exercises/${exercise.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "儲存失敗");
      return;
    }
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>{exercise ? "編輯動作" : "新增動作"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">名稱</Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：槓鈴臥推"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>肌群</Label>
              <Select
                value={muscleGroup}
                onValueChange={(value) => value && setMuscleGroup(value)}
                items={muscleItems}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full">
                  <SelectValue placeholder="選擇肌群" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {muscleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>類別</Label>
              <Select
                value={category}
                onValueChange={(value) => value && setCategory(value)}
                items={categoryItems}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full">
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-description">描述（選填）</Label>
            <Textarea
              id="exercise-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="動作要領或備註"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 hover:bg-gray-800 transition-colors"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
            >
              {submitting ? "儲存中…" : exercise ? "儲存" : "新增"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
