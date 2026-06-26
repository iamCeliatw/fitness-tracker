"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface FoodEntryItem {
  id: string;
  mealType: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

const MEAL_ORDER = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "早餐",
  LUNCH: "午餐",
  DINNER: "晚餐",
  SNACK: "點心",
};

export default function FoodEntryList({ entries }: { entries: FoodEntryItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/food-entries/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-10">
        今日尚無飲食記錄，開始記錄第一餐吧
      </p>
    );
  }

  const grouped = MEAL_ORDER.reduce<Record<string, FoodEntryItem[]>>((acc, meal) => {
    const items = entries.filter((e) => e.mealType === meal);
    if (items.length) acc[meal] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([meal, items]) => (
        <div key={meal}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {MEAL_LABELS[meal]}
          </h3>
          <div className="space-y-1.5">
            {items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 transition-colors duration-150 hover:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{entry.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.calories} kcal
                    {entry.protein != null && ` · 蛋白質 ${entry.protein}g`}
                    {entry.carbs != null && ` · 碳水 ${entry.carbs}g`}
                    {entry.fat != null && ` · 脂肪 ${entry.fat}g`}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger className="ml-2 h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>刪除記錄</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        確定要刪除「{entry.name}」的記錄嗎？此操作無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                        取消
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletingId === entry.id ? "刪除中..." : "確認刪除"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
