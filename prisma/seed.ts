import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const exercises = [
  // CHEST
  { name: "槓鈴臥推", muscleGroup: "CHEST", category: "STRENGTH", imageUrl: "/exercises/barbell-bench-press.jpg" },
  { name: "上斜臥推", muscleGroup: "CHEST", category: "STRENGTH", imageUrl: "/exercises/incline-bench-press.jpg" },
  { name: "下斜臥推", muscleGroup: "CHEST", category: "STRENGTH", imageUrl: "/exercises/decline-bench-press.jpg" },
  { name: "啞鈴飛鳥", muscleGroup: "CHEST", category: "STRENGTH", imageUrl: "/exercises/dumbbell-flyes.jpg" },
  // BACK
  { name: "引體向上", muscleGroup: "BACK", category: "STRENGTH", imageUrl: "/exercises/pullups.jpg" },
  { name: "槓鈴划船", muscleGroup: "BACK", category: "STRENGTH", imageUrl: "/exercises/bent-over-barbell-row.jpg" },
  { name: "滑輪下拉", muscleGroup: "BACK", category: "STRENGTH", imageUrl: "/exercises/lat-pulldown.jpg" },
  { name: "坐姿划船", muscleGroup: "BACK", category: "STRENGTH", imageUrl: "/exercises/seated-cable-rows.jpg" },
  // SHOULDERS
  { name: "肩推", muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/shoulder-press.jpg" },
  { name: "側平舉", muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/side-lateral-raise.jpg" },
  { name: "前平舉", muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/front-raise.jpg" },
  // ARMS
  { name: "槓鈴彎舉", muscleGroup: "ARMS", category: "STRENGTH", imageUrl: "/exercises/barbell-curl.jpg" },
  { name: "錘式彎舉", muscleGroup: "ARMS", category: "STRENGTH", imageUrl: "/exercises/hammer-curls.jpg" },
  { name: "三頭下拉", muscleGroup: "ARMS", category: "STRENGTH", imageUrl: "/exercises/triceps-pushdown.jpg" },
  { name: "法式推舉", muscleGroup: "ARMS", category: "STRENGTH", imageUrl: "/exercises/skullcrusher.jpg" },
  // LEGS
  { name: "深蹲", muscleGroup: "LEGS", category: "STRENGTH", imageUrl: "/exercises/squat.jpg" },
  { name: "硬舉", muscleGroup: "LEGS", category: "STRENGTH", imageUrl: "/exercises/deadlift.jpg" },
  { name: "腿推", muscleGroup: "LEGS", category: "STRENGTH", imageUrl: "/exercises/leg-press.jpg" },
  { name: "腿彎舉", muscleGroup: "LEGS", category: "STRENGTH", imageUrl: "/exercises/lying-leg-curls.jpg" },
  { name: "腿伸展", muscleGroup: "LEGS", category: "STRENGTH", imageUrl: "/exercises/leg-extensions.jpg" },
  // CORE
  { name: "棒式支撐", muscleGroup: "CORE", category: "STRENGTH", imageUrl: "/exercises/plank.jpg" },
  { name: "仰臥起坐", muscleGroup: "CORE", category: "STRENGTH", imageUrl: "/exercises/sit-up.jpg" },
  // CARDIO
  { name: "跑步機", muscleGroup: "CARDIO", category: "CARDIO", imageUrl: "/exercises/treadmill.jpg" },
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
      imageUrl: ex.imageUrl,
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
