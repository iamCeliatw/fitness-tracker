import { requireRole } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import ExercisesManager, {
  type ExerciseRow,
} from "@/components/admin/exercises-manager";

export default async function AdminExercisesPage() {
  await requireRole("ADMIN");
  const admin = await createAdminClient();

  const { data: exercises } = await admin
    .from("Exercise")
    .select("id, name, description, muscleGroup, category, isCustom, createdById")
    .order("muscleGroup", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">動作庫</h1>
      <p className="text-gray-400 mb-6">管理官方動作與會員自訂動作</p>
      <ExercisesManager initialExercises={(exercises ?? []) as ExerciseRow[]} />
    </div>
  );
}
