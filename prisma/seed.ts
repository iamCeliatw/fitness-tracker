import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const exercises = [
  // CHEST
  { name: "槓鈴臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "上斜臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "下斜臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "啞鈴飛鳥", muscleGroup: "CHEST", category: "STRENGTH" },
  // BACK
  { name: "引體向上", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "槓鈴划船", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "滑輪下拉", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "坐姿划船", muscleGroup: "BACK", category: "STRENGTH" },
  // SHOULDERS
  { name: "肩推", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "側平舉", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "前平舉", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  // ARMS
  { name: "槓鈴彎舉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "錘式彎舉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "三頭下拉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "法式推舉", muscleGroup: "ARMS", category: "STRENGTH" },
  // LEGS
  { name: "深蹲", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "硬舉", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿推", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿彎舉", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿伸展", muscleGroup: "LEGS", category: "STRENGTH" },
  // CORE
  { name: "棒式支撐", muscleGroup: "CORE", category: "STRENGTH" },
  { name: "仰臥起坐", muscleGroup: "CORE", category: "STRENGTH" },
  // CARDIO
  { name: "跑步機", muscleGroup: "CARDIO", category: "CARDIO" },
] as const;

async function main() {
  const { count, error: countErr } = await supabase
    .from("Exercise")
    .select("*", { count: "exact", head: true });

  if (countErr) throw countErr;

  if (count && count > 0) {
    console.log(`Already ${count} exercises — skipping seed.`);
    return;
  }

  console.log("Seeding exercises...");

  const { error } = await supabase.from("Exercise").insert(
    exercises.map((ex) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      category: ex.category,
      isCustom: false,
      createdAt: new Date().toISOString(),
    }))
  );

  if (error) throw error;

  console.log(`Done. ${exercises.length} exercises seeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
