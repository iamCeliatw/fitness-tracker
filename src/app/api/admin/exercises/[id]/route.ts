import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExerciseAdminContext } from "@/lib/admin-api";

type ExerciseAdminCtx = NonNullable<Awaited<ReturnType<typeof getExerciseAdminContext>>>;

/** 管理範圍檢查：org 管理者限本館列，平台 ADMIN 限全域列；範圍外回 403 */
function inScope(ctx: ExerciseAdminCtx, exercise: { orgId: string | null; isCustom: boolean }) {
  if (ctx.orgId) return exercise.orgId === ctx.orgId;
  return exercise.orgId === null && !exercise.isCustom;
}
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from "@/lib/exercise-labels";

const patchSchema = z.object({
  name: z.string().min(1, "名稱不可為空").optional(),
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
  category: z.enum(EXERCISE_CATEGORIES).optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getExerciseAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data: exercise } = await ctx.admin
    .from("Exercise")
    .select("id, isCustom, orgId")
    .eq("id", id)
    .single();

  if (!exercise) return NextResponse.json({ error: "動作不存在" }, { status: 404 });
  if (exercise.isCustom) {
    return NextResponse.json({ error: "會員自訂動作不可編輯" }, { status: 403 });
  }
  if (!inScope(ctx, exercise)) {
    return NextResponse.json({ error: "無權限管理此動作" }, { status: 403 });
  }

  const { data: updated, error } = await ctx.admin
    .from("Exercise")
    .update({ ...parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, muscleGroup, category, isCustom, createdById")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getExerciseAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { data: exercise } = await ctx.admin
    .from("Exercise")
    .select("id, isCustom, orgId")
    .eq("id", id)
    .single();

  if (!exercise) return NextResponse.json({ error: "動作不存在" }, { status: 404 });
  if (!inScope(ctx, exercise)) {
    return NextResponse.json({ error: "無權限管理此動作" }, { status: 403 });
  }

  const [{ data: logRefs }, { data: planRefs }] = await Promise.all([
    ctx.admin.from("WorkoutLogExercise").select("id").eq("exerciseId", id).limit(1),
    ctx.admin.from("WorkoutPlanExercise").select("id").eq("exerciseId", id).limit(1),
  ]);

  if ((logRefs?.length ?? 0) > 0 || (planRefs?.length ?? 0) > 0) {
    return NextResponse.json(
      { error: "此動作已被訓練記錄或計畫使用，無法刪除" },
      { status: 409 }
    );
  }

  const { error } = await ctx.admin.from("Exercise").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
