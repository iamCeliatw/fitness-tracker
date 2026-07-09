import { redirect } from "next/navigation";
import { getExerciseAdminContext } from "@/lib/admin-api";
import ExercisesManager, {
  type ExerciseRow,
} from "@/components/admin/exercises-manager";

export default async function AdminExercisesPage() {
  const ctx = await getExerciseAdminContext();
  if (!ctx) redirect("/dashboard");

  let query = ctx.admin
    .from("Exercise")
    .select("id, name, description, muscleGroup, category, isCustom, createdById, orgId")
    .order("muscleGroup", { ascending: true })
    .order("name", { ascending: true });

  // org 管理者：全域內建 + 本館自訂；平台 ADMIN：全域（含會員個人自訂）
  if (ctx.orgId) {
    query = query.or(`and(orgId.is.null,isCustom.eq.false),orgId.eq.${ctx.orgId}`);
  } else {
    query = query.is("orgId", null);
  }

  const { data: exercises } = await query;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">動作庫</h1>
      <p className="text-gray-400 mb-6">
        {ctx.orgId ? "管理本館自訂動作" : "管理官方動作與會員自訂動作"}
      </p>
      <ExercisesManager
        initialExercises={(exercises ?? []) as ExerciseRow[]}
        viewerOrgId={ctx.orgId}
      />
    </div>
  );
}
