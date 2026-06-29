import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import FoodDailySummary from "@/components/food/food-daily-summary";
import FoodEntryForm from "@/components/food/food-entry-form";
import FoodEntryList, { type FoodEntryItem } from "@/components/food/food-entry-list";

export default async function FoodPage() {
  const user = await requireAuth();
  const userId = user.id;

  const today = new Date();
  const from = startOfDay(today);
  const to = endOfDay(today);

  const admin = await createAdminClient();
  const { data: entries } = await admin
    .from("FoodEntry")
    .select("*")
    .eq("userId", userId)
    .gte("date", from.toISOString())
    .lte("date", to.toISOString())
    .order("mealType", { ascending: true })
    .order("createdAt", { ascending: true });

  const listEntries: FoodEntryItem[] = (entries ?? []).map((e) => ({
    id: e.id,
    mealType: e.mealType,
    name: e.name,
    calories: e.calories,
    protein: e.protein,
    carbs: e.carbs,
    fat: e.fat,
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold">飲食記錄</h1>
        <p className="text-gray-400 text-sm mt-1">記錄每日熱量與三大營養素攝取</p>
      </div>

      <FoodDailySummary entries={listEntries} />
      <div className="mb-6">
        <FoodEntryForm />
      </div>
      <FoodEntryList entries={listEntries} />
    </div>
  );
}
