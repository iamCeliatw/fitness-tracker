import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

const exercises = [
  { name: "槓鈴臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "上斜臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "下斜臥推", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "啞鈴飛鳥", muscleGroup: "CHEST", category: "STRENGTH" },
  { name: "引體向上", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "槓鈴划船", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "滑輪下拉", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "坐姿划船", muscleGroup: "BACK", category: "STRENGTH" },
  { name: "肩推", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "側平舉", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "前平舉", muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "槓鈴彎舉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "錘式彎舉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "三頭下拉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "法式推舉", muscleGroup: "ARMS", category: "STRENGTH" },
  { name: "深蹲", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "硬舉", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿推", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿彎舉", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "腿伸展", muscleGroup: "LEGS", category: "STRENGTH" },
  { name: "棒式支撐", muscleGroup: "CORE", category: "STRENGTH" },
  { name: "仰臥起坐", muscleGroup: "CORE", category: "STRENGTH" },
  { name: "跑步機", muscleGroup: "CARDIO", category: "CARDIO" },
];

async function main() {
  // Check existing count
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/Exercise?select=id`,
    { headers: { ...headers, Prefer: "count=exact" } }
  );
  const countHeader = countRes.headers.get("content-range");
  const total = countHeader ? parseInt(countHeader.split("/")[1] ?? "0") : 0;

  if (total > 0) {
    console.log(`Already ${total} exercises — skipping seed.`);
    return;
  }

  const rows = exercises.map((ex) => ({
    id: crypto.randomUUID(),
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    category: ex.category,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/Exercise`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Seed failed:", res.status, err);
    process.exit(1);
  }

  console.log(`Done. ${rows.length} exercises seeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
