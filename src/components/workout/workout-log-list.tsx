"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import WorkoutLogCard, { type WorkoutLogSummary } from "./workout-log-card";

interface WorkoutLogListProps {
  logs: WorkoutLogSummary[];
}

export default function WorkoutLogList({ logs }: WorkoutLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 text-sm mb-4">還沒有訓練記錄，立即開始今日訓練！</p>
        <Link
          href="/dashboard/workout/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增訓練
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <WorkoutLogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
