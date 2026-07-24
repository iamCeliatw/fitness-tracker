"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "早餐",
  LUNCH: "午餐",
  DINNER: "晚餐",
  SNACK: "點心",
};

const formSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  name: z.string().min(1, "請輸入食物名稱"),
  calories: z.string().min(1, "請輸入熱量").refine((v) => Number(v) > 0, "熱量須大於 0"),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fat: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FoodEntryForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState("LUNCH");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        date: format(new Date(), "yyyy-MM-dd"),
        mealType: "LUNCH",
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      },
    });

  async function onSubmit(values: FormValues) {
    setError(null);
    const res = await fetch("/api/food-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: values.date,
        mealType,
        name: values.name,
        calories: Number(values.calories),
        protein: values.protein ? Number(values.protein) : null,
        carbs: values.carbs ? Number(values.carbs) : null,
        fat: values.fat ? Number(values.fat) : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "儲存失敗，請稍後再試");
      return;
    }

    reset({
      date: values.date,
      mealType: "LUNCH",
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    router.refresh();
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white">新增飲食記錄</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">日期</Label>
              <Input
                type="date"
                className="bg-gray-800 border-gray-700 text-white h-8 text-sm w-full"
                {...register("date")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">餐別</Label>
              <Select value={mealType} onValueChange={(v) => setMealType(v ?? "LUNCH")} items={MEAL_LABELS}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-8 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {Object.entries(MEAL_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label className="text-gray-400 text-xs">食物名稱</Label>
              <Input
                placeholder="雞胸肉"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">熱量 kcal</Label>
              <Input
                type="number" min="0" step="1" placeholder="165"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
                {...register("calories")}
              />
              {errors.calories && <p className="text-xs text-red-400">{errors.calories.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">蛋白質 g</Label>
              <Input
                type="number" min="0" step="0.1" placeholder="30"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
                {...register("protein")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">碳水 g</Label>
              <Input
                type="number" min="0" step="0.1" placeholder="0"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
                {...register("carbs")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">脂肪 g</Label>
              <Input
                type="number" min="0" step="0.1" placeholder="5"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-8 text-sm"
                {...register("fat")}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-9 text-sm transition-colors"
          >
            {isSubmitting ? "儲存中..." : "新增記錄"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
