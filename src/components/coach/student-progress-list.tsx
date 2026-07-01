import { User } from "lucide-react";

type Student = {
  id: string;
  name: string;
  weeklyWorkouts: number;
  foodDays: number;
};

export default function StudentProgressList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-500">
        目前沒有學員
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student.id}
          className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors duration-150 hover:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="font-medium">{student.name}</span>
          </div>
          <div className="pl-11 flex gap-4 text-sm text-gray-400">
            <span>本週訓練 <span className="text-white font-medium">{student.weeklyWorkouts}</span> 次</span>
            <span>飲食達標 <span className="text-white font-medium">{student.foodDays}</span>/7 天</span>
          </div>
        </div>
      ))}
    </div>
  );
}
