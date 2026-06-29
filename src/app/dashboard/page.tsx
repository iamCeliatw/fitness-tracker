import { startOfWeek, startOfDay, endOfDay } from "date-fns";
import { Dumbbell, Flame, Weight } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import DashboardRecentWorkouts, { type RecentWorkoutItem } from "@/components/dashboard/dashboard-recent-workouts";
import DashboardQuickActions from "@/components/dashboard/dashboard-quick-actions";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = user.id;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const admin = await createAdminClient();

  const [weeklyResult, latestBodyResult, recentLogsResult, todayFoodResult] = await Promise.all([
    admin
      .from("WorkoutLog")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .gte("date", weekStart.toISOString()),
    admin
      .from("BodyRecord")
      .select("weight")
      .eq("userId", userId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("WorkoutLog")
      .select(`
        id, date, duration,
        exercises:WorkoutLogExercise(
          sets:WorkoutSet(id)
        )
      `)
      .eq("userId", userId)
      .order("date", { ascending: false })
      .limit(4),
    admin
      .from("FoodEntry")
      .select("calories")
      .eq("userId", userId)
      .gte("date", todayStart.toISOString())
      .lte("date", todayEnd.toISOString()),
  ]);

  const weeklyCount = weeklyResult.count ?? 0;
  const latestBody = latestBodyResult.data;
  const recentLogs = recentLogsResult.data ?? [];
  const todayFoodEntries = todayFoodResult.data ?? [];

  const hasMore = recentLogs.length > 3;
  const displayLogs = recentLogs.slice(0, 3);

  const logs: RecentWorkoutItem[] = displayLogs.map((log) => ({
    id: log.id,
    date: new Date(log.date).toISOString().split("T")[0],
    exerciseCount: (log.exercises as { sets: { id: string }[] }[]).length,
    totalSets: (log.exercises as { sets: { id: string }[] }[]).reduce(
      (acc, ex) => acc + ex.sets.length,
      0
    ),
    duration: log.duration,
  }));

  const weightValue =
    latestBody?.weight != null ? `${latestBody.weight} kg` : "—";
  const todayCalories = Math.round(
    todayFoodEntries.reduce((s, e) => s + (e.calories ?? 0), 0)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">總覽</h1>
        <p className="text-gray-400 text-sm mt-1">
          歡迎回來，{user.name ?? user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <DashboardStatCard
          label="本週訓練"
          value={`${weeklyCount} 次`}
          icon={<Dumbbell className="h-4 w-4" />}
        />
        <DashboardStatCard
          label="最近體重"
          value={weightValue}
          icon={<Weight className="h-4 w-4" />}
        />
        <DashboardStatCard
          label="今日熱量"
          value={`${todayCalories} kcal`}
          icon={<Flame className="h-4 w-4" />}
        />
      </div>

      <div className="mb-6">
        <DashboardQuickActions />
      </div>

      <DashboardRecentWorkouts logs={logs} hasMore={hasMore} />
    </div>
  );
}
