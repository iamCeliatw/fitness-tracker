import { startOfWeek, startOfDay, endOfDay } from "date-fns";
import { Dumbbell, Flame, Weight } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import DashboardRecentWorkouts, { type RecentWorkoutItem } from "@/components/dashboard/dashboard-recent-workouts";
import DashboardQuickActions from "@/components/dashboard/dashboard-quick-actions";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const weeklyCount = await prisma.workoutLog.count({
    where: { userId, date: { gte: weekStart } },
  });
  const latestBody = await prisma.bodyRecord.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { weight: true },
  });
  const recentLogs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 4,
    select: {
      id: true,
      date: true,
      duration: true,
      exercises: {
        select: {
          sets: { select: { id: true } },
        },
      },
    },
  });
  const todayFoodEntries = await prisma.foodEntry.findMany({
    where: { userId, date: { gte: todayStart, lte: todayEnd } },
    select: { calories: true },
  });

  const hasMore = recentLogs.length > 3;
  const displayLogs = recentLogs.slice(0, 3);

  const logs: RecentWorkoutItem[] = displayLogs.map((log) => ({
    id: log.id,
    date: log.date.toISOString().split("T")[0],
    exerciseCount: log.exercises.length,
    totalSets: log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
    duration: log.duration,
  }));

  const weightValue =
    latestBody?.weight != null ? `${latestBody.weight} kg` : "—";
  const todayCalories = Math.round(todayFoodEntries.reduce((s, e) => s + e.calories, 0));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">總覽</h1>
        <p className="text-gray-400 text-sm mt-1">
          歡迎回來，{session.user.name ?? session.user.email}
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
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

      {/* 快速入口 */}
      <div className="mb-6">
        <DashboardQuickActions />
      </div>

      {/* 最近訓練 */}
      <DashboardRecentWorkouts logs={logs} hasMore={hasMore} />
    </div>
  );
}
