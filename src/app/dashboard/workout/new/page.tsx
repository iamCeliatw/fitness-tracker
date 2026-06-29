import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import WorkoutLogForm from "@/components/workout/workout-log-form";

export default async function NewWorkoutPage() {
  await requireAuth();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/workout"
          className="flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          返回日誌
        </Link>
        <h1 className="text-2xl font-bold">新增訓練</h1>
        <p className="text-gray-400 text-sm mt-1">選擇動作並記錄每組的重量與次數</p>
      </div>

      <WorkoutLogForm />
    </div>
  );
}
