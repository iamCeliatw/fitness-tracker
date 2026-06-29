"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Control, UseFormRegister, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Trash2, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkoutExercisePicker, { type ExerciseItem } from "./workout-exercise-picker";
import WorkoutSetRow from "./workout-set-row";

// ─── Schema ──────────────────────────────────────────────────────────────────

const setSchema = z.object({
  reps: z.string().optional(),
  weight: z.string().optional(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string(),
  exerciseMuscleGroup: z.string(),
  sets: z.array(setSchema),
});

export const workoutFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  notes: z.string().optional(),
  duration: z.string().optional(),
  exercises: z.array(exerciseEntrySchema).min(1, "請至少加入一個動作"),
});

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

// ─── Nested sets block ────────────────────────────────────────────────────────

const MUSCLE_LABELS: Record<string, string> = {
  CHEST: "胸", BACK: "背", SHOULDERS: "肩", ARMS: "手臂",
  LEGS: "腿", GLUTES: "臀", CORE: "核心", CARDIO: "有氧", FULL_BODY: "全身",
};

interface ExerciseSetsBlockProps {
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  getValues: UseFormGetValues<WorkoutFormValues>;
  setValue: UseFormSetValue<WorkoutFormValues>;
  exerciseIndex: number;
  exerciseName: string;
  muscleGroup: string;
  onRemoveExercise: () => void;
}

function ExerciseSetsBlock({
  control,
  register,
  getValues,
  setValue,
  exerciseIndex,
  exerciseName,
  muscleGroup,
  onRemoveExercise,
}: ExerciseSetsBlockProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4 space-y-3">
        {/* Exercise header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">{exerciseName}</span>
            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
              {MUSCLE_LABELS[muscleGroup] ?? muscleGroup}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveExercise}
            className="h-7 w-7 text-gray-600 hover:text-red-400 hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Sets header */}
        <div className="flex items-center gap-2 px-0">
          <span className="text-gray-500 text-xs w-6 text-center">#</span>
          <span className="flex-1 text-xs text-gray-500 text-center">次數</span>
          <span className="flex-1 text-xs text-gray-500 text-center">重量 (kg)</span>
          <span className="w-8" />
        </div>

        {/* Set rows */}
        <div className="space-y-2">
          {fields.map((field, setIndex) => (
            <WorkoutSetRow
              key={field.id}
              setNumber={setIndex + 1}
              repsProps={register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`)}
              weightProps={register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`)}
              onRemove={() => remove(setIndex)}
              canRemove={fields.length > 1}
              onCopy={setIndex > 0 ? () => {
                const prev = getValues(`exercises.${exerciseIndex}.sets.${setIndex - 1}`);
                setValue(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, prev.reps ?? "");
                setValue(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, prev.weight ?? "");
              } : undefined}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ reps: "", weight: "" })}
          className="text-orange-400 hover:text-orange-300 hover:bg-orange-950/20 h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          新增一組
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function WorkoutLogForm() {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, getValues, setValue, formState: { errors, isSubmitting } } =
    useForm<WorkoutFormValues>({
      resolver: zodResolver(workoutFormSchema),
      defaultValues: {
        date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        duration: "",
        exercises: [],
      },
    });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } =
    useFieldArray({ control, name: "exercises" });

  const selectedExerciseIds = watch("exercises").map((e) => e.exerciseId);

  function handleExerciseSelect(exercise: ExerciseItem) {
    appendExercise({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseMuscleGroup: exercise.muscleGroup,
      sets: [{ reps: "", weight: "" }],
    });
  }

  async function onSubmit(values: WorkoutFormValues) {
    setError(null);

    const payload = {
      date: values.date,
      notes: values.notes || undefined,
      duration: values.duration ? Number(values.duration) : undefined,
      exercises: values.exercises.map((ex, i) => ({
        exerciseId: ex.exerciseId,
        order: i,
        sets: ex.sets
          .filter((s) => s.reps || s.weight)
          .map((s, j) => ({
            setNumber: j + 1,
            reps: s.reps ? parseInt(s.reps, 10) : undefined,
            weight: s.weight ? parseFloat(s.weight) : undefined,
          })),
      })),
    };

    // Client-side: ensure every exercise has at least one set with data
    const hasEmptySets = payload.exercises.some((ex) => ex.sets.length === 0);
    if (hasEmptySets) {
      setError("每個動作至少需要一組有效的記錄（填入次數或重量）");
      return;
    }

    const res = await fetch("/api/workout-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "儲存失敗，請稍後再試");
      return;
    }

    router.push("/dashboard/workout");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-gray-300 text-xs">訓練日期</Label>
          <Input
            type="date"
            className="bg-gray-900 border-gray-700 text-white"
            {...register("date")}
          />
          {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-gray-300 text-xs">訓練時長（分鐘）</Label>
          <Input
            type="number"
            min="1"
            placeholder="60"
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            {...register("duration")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-gray-300 text-xs">備註</Label>
        <Textarea
          placeholder="今天訓練狀況..."
          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 resize-none h-16"
          {...register("notes")}
        />
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">動作清單</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="border-orange-500 text-orange-400 hover:bg-orange-950/20 hover:text-orange-300 hover:border-orange-400 h-8 px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            新增動作
          </Button>
        </div>

        {errors.exercises?.root && (
          <p className="text-xs text-red-400">{errors.exercises.root.message}</p>
        )}
        {errors.exercises?.message && (
          <p className="text-xs text-red-400">{errors.exercises.message}</p>
        )}

        {exerciseFields.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors"
            onClick={() => setPickerOpen(true)}
          >
            <Dumbbell className="h-8 w-8 text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">點擊新增動作開始記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exerciseFields.map((field, i) => (
              <ExerciseSetsBlock
                key={field.id}
                control={control}
                register={register}
                getValues={getValues}
                setValue={setValue}
                exerciseIndex={i}
                exerciseName={field.exerciseName}
                muscleGroup={field.exerciseMuscleGroup}
                onRemoveExercise={() => removeExercise(i)}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
      >
        {isSubmitting ? "儲存中..." : "儲存訓練"}
      </Button>

      <WorkoutExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleExerciseSelect}
        selectedIds={selectedExerciseIds}
      />
    </form>
  );
}
