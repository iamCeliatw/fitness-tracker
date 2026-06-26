import Link from "next/link";
import { Plus, Scale, Utensils } from "lucide-react";

export default function DashboardQuickActions() {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-300 mb-3">快速入口</h2>
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/dashboard/workout/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增訓練
        </Link>
        <Link
          href="/dashboard/body"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors"
        >
          <Scale className="h-4 w-4" />
          記錄體重
        </Link>
        <Link
          href="/dashboard/food"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors"
        >
          <Utensils className="h-4 w-4" />
          飲食記錄
        </Link>
      </div>
    </div>
  );
}
