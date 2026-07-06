import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin-api";
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from "@/lib/exercise-labels";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: exercises, error } = await ctx.admin
    .from("Exercise")
    .select("id, name, description, muscleGroup, category, isCustom, createdById")
    .order("muscleGroup", { ascending: true })
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(exercises ?? []);
}

const createSchema = z.object({
  name: z.string().min(1, "名稱不可為空"),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  category: z.enum(EXERCISE_CATEGORIES),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: exercise, error } = await ctx.admin
    .from("Exercise")
    .insert({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      muscleGroup: parsed.data.muscleGroup,
      category: parsed.data.category,
      isCustom: false,
      createdById: null,
      createdAt: now,
      updatedAt: now,
    })
    .select("id, name, description, muscleGroup, category, isCustom, createdById")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(exercise, { status: 201 });
}
