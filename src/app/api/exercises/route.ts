import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const muscleGroup = req.nextUrl.searchParams.get("muscleGroup");
  const admin = await createAdminClient();

  let query = admin
    .from("Exercise")
    .select("id, name, muscleGroup, category")
    .or(`isCustom.eq.false,createdById.eq.${user.id}`)
    .order("muscleGroup", { ascending: true })
    .order("name", { ascending: true });

  if (muscleGroup) {
    query = query.eq("muscleGroup", muscleGroup);
  }

  const { data: exercises } = await query;
  return NextResponse.json(exercises ?? []);
}

const createExerciseSchema = z.object({
  name: z.string().min(1, "名稱不可為空"),
  muscleGroup: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createExerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const now = new Date().toISOString();
  const admin = await createAdminClient();
  const { data: exercise, error } = await admin
    .from("Exercise")
    .insert({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      muscleGroup: parsed.data.muscleGroup,
      category: "STRENGTH",
      isCustom: true,
      createdById: user.id,
      createdAt: now,
      updatedAt: now,
    })
    .select("id, name, muscleGroup, category")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(exercise, { status: 201 });
}
