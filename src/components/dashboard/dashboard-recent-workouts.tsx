import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Dumbbell, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type RecentWorkoutItem = {
  id: string;
  date: string;
  exerciseCount: number;
  totalSets: number;
  duration: number | null;
};

interface DashboardRecentWorkoutsProps {
  logs: RecentWorkoutItem[];
  hasMore: boolean;
}

export default function DashboardRecentWorkouts({ logs, hasMore }: DashboardRecentWorkoutsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-300">最近訓練</h2>
        {hasMore && (
          <Link href="/dashboard/workout" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            查看全部
          </Link>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">尚無訓練記錄</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="bg-gray-900 border-gray-800 transition-colors duration-150 hover:border-gray-700">
              <CardContent className="p-4">
                <p className="text-white font-medium text-sm mb-1">
                  {format(parseISO(log.date), "yyyy/MM/dd")}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {log.exerciseCount} 個動作・{log.totalSets} 組
                  </span>
                  {log.duration != null && (
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.duration} 分鐘
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
