import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const exercises = [
  // CHEST
  { name: "槓鈴臥推", nameEn: "Barbell Bench Press",    nameJa: "バーベルベンチプレス",     muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/barbell-bench-press.jpg" },
  { name: "上斜臥推", nameEn: "Incline Bench Press",    nameJa: "インクラインベンチプレス", muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/incline-bench-press.jpg" },
  { name: "下斜臥推", nameEn: "Decline Bench Press",    nameJa: "デクラインベンチプレス",   muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/decline-bench-press.jpg" },
  { name: "啞鈴飛鳥", nameEn: "Dumbbell Flyes",         nameJa: "ダンベルフライ",           muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/dumbbell-flyes.jpg" },
  // BACK
  { name: "引體向上", nameEn: "Pull-ups",               nameJa: "懸垂",                     muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/pullups.jpg" },
  { name: "槓鈴划船", nameEn: "Bent-over Barbell Row",  nameJa: "バーベルローイング",       muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/bent-over-barbell-row.jpg" },
  { name: "滑輪下拉", nameEn: "Lat Pulldown",           nameJa: "ラットプルダウン",         muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/lat-pulldown.jpg" },
  { name: "坐姿划船", nameEn: "Seated Cable Rows",      nameJa: "シーテッドローイング",     muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/seated-cable-rows.jpg" },
  // SHOULDERS
  { name: "肩推",     nameEn: "Shoulder Press",         nameJa: "ショルダープレス",         muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/shoulder-press.jpg" },
  { name: "側平舉",   nameEn: "Side Lateral Raise",     nameJa: "サイドレイズ",             muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/side-lateral-raise.jpg" },
  { name: "前平舉",   nameEn: "Front Raise",            nameJa: "フロントレイズ",           muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/front-raise.jpg" },
  // ARMS
  { name: "槓鈴彎舉", nameEn: "Barbell Curl",           nameJa: "バーベルカール",           muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/barbell-curl.jpg" },
  { name: "錘式彎舉", nameEn: "Hammer Curls",           nameJa: "ハンマーカール",           muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/hammer-curls.jpg" },
  { name: "三頭下拉", nameEn: "Triceps Pushdown",       nameJa: "トライセプスプッシュダウン", muscleGroup: "ARMS",    category: "STRENGTH", imageUrl: "/exercises/triceps-pushdown.jpg" },
  { name: "法式推舉", nameEn: "Skullcrusher",           nameJa: "スカルクラッシャー",       muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/skullcrusher.jpg" },
  // LEGS
  { name: "深蹲",     nameEn: "Squat",                  nameJa: "スクワット",               muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/squat.jpg" },
  { name: "硬舉",     nameEn: "Deadlift",               nameJa: "デッドリフト",             muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/deadlift.jpg" },
  { name: "腿推",     nameEn: "Leg Press",              nameJa: "レッグプレス",             muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/leg-press.jpg" },
  { name: "腿彎舉",   nameEn: "Lying Leg Curls",        nameJa: "レッグカール",             muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/lying-leg-curls.jpg" },
  { name: "腿伸展",   nameEn: "Leg Extension",          nameJa: "レッグエクステンション",   muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/leg-extensions.jpg" },
  // CORE
  { name: "棒式支撐",       nameEn: "Plank",                       nameJa: "プランク",                               muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/plank.jpg" },
  { name: "仰臥起坐",       nameEn: "Sit-up",                      nameJa: "シットアップ",                           muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/sit-up.jpg" },
  // CARDIO
  { name: "跑步機",         nameEn: "Treadmill",                   nameJa: "トレッドミル",                           muscleGroup: "CARDIO",    category: "CARDIO",   imageUrl: "/exercises/treadmill.jpg" },
  // ── 以下為第二批新增動作 ──────────────────────────────────────
  // CHEST
  { name: "啞鈴臥推",       nameEn: "Dumbbell Bench Press",        nameJa: "ダンベルベンチプレス",                   muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/dumbbell-bench-press.jpg" },
  { name: "伏地挺身",       nameEn: "Push-up",                     nameJa: "プッシュアップ",                         muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/push-up.jpg" },
  { name: "滑輪夾胸",       nameEn: "Cable Chest Fly",             nameJa: "ケーブルチェストフライ",                 muscleGroup: "CHEST",     category: "STRENGTH", imageUrl: "/exercises/cable-chest-fly.jpg" },
  // BACK
  { name: "單臂啞鈴划船",   nameEn: "Single Arm Dumbbell Row",     nameJa: "ワンアームダンベルロウ",                 muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/single-arm-dumbbell-row.jpg" },
  { name: "臉拉",           nameEn: "Face Pull",                   nameJa: "フェイスプル",                           muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/face-pull.jpg" },
  { name: "超人式",         nameEn: "Superman",                    nameJa: "スーパーマン",                           muscleGroup: "BACK",      category: "STRENGTH", imageUrl: "/exercises/superman.jpg" },
  // SHOULDERS
  { name: "啞鈴肩推",       nameEn: "Dumbbell Shoulder Press",     nameJa: "ダンベルショルダープレス",               muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/dumbbell-shoulder-press.jpg" },
  { name: "阿諾德推舉",     nameEn: "Arnold Press",                nameJa: "アーノルドプレス",                       muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/arnold-press.jpg" },
  { name: "俯身側平舉",     nameEn: "Rear Delt Fly",               nameJa: "リアデルトフライ",                       muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/rear-delt-fly.jpg" },
  { name: "上半身啞鈴繞環", nameEn: "Dumbbell Around the World",   nameJa: "ダンベルアラウンドザワールド",           muscleGroup: "SHOULDERS", category: "STRENGTH", imageUrl: "/exercises/dumbbell-around-the-world.jpg" },
  // ARMS
  { name: "啞鈴彎舉",       nameEn: "Dumbbell Curl",               nameJa: "ダンベルカール",                         muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/dumbbell-curl.jpg" },
  { name: "上斜彎舉",       nameEn: "Incline Dumbbell Curl",       nameJa: "インクラインダンベルカール",             muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/incline-dumbbell-curl.jpg" },
  { name: "集中彎舉",       nameEn: "Concentration Curl",          nameJa: "コンセントレーションカール",             muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/concentration-curl.jpg" },
  { name: "頸後三頭伸展",   nameEn: "Overhead Triceps Extension",  nameJa: "オーバーヘッドトライセプスエクステンション", muscleGroup: "ARMS",  category: "STRENGTH", imageUrl: "/exercises/overhead-triceps-extension.jpg" },
  { name: "雙槓撐體",       nameEn: "Dips",                        nameJa: "ディップス",                             muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/dips.jpg" },
  { name: "窄距伏地挺身",   nameEn: "Diamond Push-up",             nameJa: "ダイヤモンドプッシュアップ",             muscleGroup: "ARMS",      category: "STRENGTH", imageUrl: "/exercises/diamond-push-up.jpg" },
  // LEGS
  { name: "保加利亞分腿蹲", nameEn: "Bulgarian Split Squat",       nameJa: "ブルガリアンスプリットスクワット",       muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/bulgarian-split-squat.jpg" },
  { name: "弓步蹲",         nameEn: "Lunges",                      nameJa: "ランジ",                                 muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/lunges.jpg" },
  { name: "羅馬尼亞硬舉",   nameEn: "Romanian Deadlift",           nameJa: "ルーマニアンデッドリフト",               muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/romanian-deadlift.jpg" },
  { name: "相撲深蹲",       nameEn: "Sumo Squat",                  nameJa: "スモウスクワット",                       muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/sumo-squat.jpg" },
  { name: "臀推",           nameEn: "Hip Thrust",                  nameJa: "ヒップスラスト",                         muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/hip-thrust.jpg" },
  { name: "小腿提踵",       nameEn: "Calf Raise",                  nameJa: "カーフレイズ",                           muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/calf-raise.jpg" },
  { name: "壺鈴深蹲",       nameEn: "Goblet Squat",                nameJa: "ゴブレットスクワット",                   muscleGroup: "LEGS",      category: "STRENGTH", imageUrl: "/exercises/goblet-squat.jpg" },
  // CORE
  { name: "捲腹",           nameEn: "Crunches",                    nameJa: "クランチ",                               muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/crunches.jpg" },
  { name: "懸吊舉腿",       nameEn: "Hanging Leg Raise",           nameJa: "ハンギングレッグレイズ",                 muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/hanging-leg-raise.jpg" },
  { name: "側棒式",         nameEn: "Side Plank",                  nameJa: "サイドプランク",                         muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/side-plank.jpg" },
  { name: "俄羅斯轉體",     nameEn: "Russian Twist",               nameJa: "ロシアンツイスト",                       muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/russian-twist.jpg" },
  { name: "死蟲",           nameEn: "Dead Bug",                    nameJa: "デッドバグ",                             muscleGroup: "CORE",      category: "STRENGTH", imageUrl: "/exercises/dead-bug.jpg" },
  // FULL_BODY
  { name: "壺鈴擺盪",       nameEn: "Kettlebell Swing",            nameJa: "ケトルベルスイング",                     muscleGroup: "FULL_BODY", category: "STRENGTH", imageUrl: "/exercises/kettlebell-swing.jpg" },
  { name: "波比跳",         nameEn: "Burpee",                      nameJa: "バーピー",                               muscleGroup: "FULL_BODY", category: "CARDIO",   imageUrl: null },
  { name: "農夫走路",       nameEn: "Farmer's Walk",               nameJa: "ファーマーズウォーク",                   muscleGroup: "FULL_BODY", category: "STRENGTH", imageUrl: "/exercises/farmers-walk.jpg" },
  { name: "土耳其起立",     nameEn: "Turkish Get-up",              nameJa: "ターキッシュゲットアップ",               muscleGroup: "FULL_BODY", category: "STRENGTH", imageUrl: "/exercises/turkish-get-up.jpg" },
  // CARDIO
  { name: "跳繩",           nameEn: "Jump Rope",                   nameJa: "なわとび",                               muscleGroup: "CARDIO",    category: "CARDIO",   imageUrl: "/exercises/jump-rope.jpg" },
  { name: "飛輪",           nameEn: "Stationary Bike",             nameJa: "エアロバイク",                           muscleGroup: "CARDIO",    category: "CARDIO",   imageUrl: "/exercises/stationary-bike.jpg" },
  { name: "划船機",         nameEn: "Rowing Machine",              nameJa: "ローイングマシン",                       muscleGroup: "CARDIO",    category: "CARDIO",   imageUrl: "/exercises/rowing-machine.jpg" },
  { name: "橢圓機",         nameEn: "Elliptical Trainer",          nameJa: "エリプティカル",                         muscleGroup: "CARDIO",    category: "CARDIO",   imageUrl: "/exercises/elliptical-trainer.jpg" },
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
      nameEn: ex.nameEn,
      nameJa: ex.nameJa,
      muscleGroup: ex.muscleGroup,
      category: ex.category,
      imageUrl: ex.imageUrl,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );

  if (error) throw error;

  console.log(`Done. ${exercises.length} exercises seeded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
