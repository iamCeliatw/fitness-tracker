import * as dotenv from "dotenv";
dotenv.config();

import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

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
  const existing = await prisma.exercise.count();
  if (existing > 0) {
    console.log(`Already ${existing} exercises — skipping seed.`);
    return;
  }
  console.log("Seeding exercises...");
  for (const ex of exercises) {
    await prisma.exercise.create({
      data: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        category: ex.category,
        isCustom: false,
      },
    });
  }
  console.log(`Done. ${exercises.length} exercises seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
