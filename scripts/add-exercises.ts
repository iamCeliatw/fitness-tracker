import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const newExercises = [
  // CHEST
  { name: "啞鈴臥推",       nameEn: "Dumbbell Bench Press",        nameJa: "ダンベルベンチプレス",                   muscleGroup: "CHEST",     category: "STRENGTH" },
  { name: "伏地挺身",       nameEn: "Push-up",                     nameJa: "プッシュアップ",                         muscleGroup: "CHEST",     category: "STRENGTH" },
  { name: "滑輪夾胸",       nameEn: "Cable Chest Fly",             nameJa: "ケーブルチェストフライ",                 muscleGroup: "CHEST",     category: "STRENGTH" },
  // BACK
  { name: "單臂啞鈴划船",   nameEn: "Single Arm Dumbbell Row",     nameJa: "ワンアームダンベルロウ",                 muscleGroup: "BACK",      category: "STRENGTH" },
  { name: "臉拉",           nameEn: "Face Pull",                   nameJa: "フェイスプル",                           muscleGroup: "BACK",      category: "STRENGTH" },
  { name: "超人式",         nameEn: "Superman",                    nameJa: "スーパーマン",                           muscleGroup: "BACK",      category: "STRENGTH" },
  // SHOULDERS
  { name: "啞鈴肩推",       nameEn: "Dumbbell Shoulder Press",     nameJa: "ダンベルショルダープレス",               muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "阿諾德推舉",     nameEn: "Arnold Press",                nameJa: "アーノルドプレス",                       muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "俯身側平舉",     nameEn: "Rear Delt Fly",               nameJa: "リアデルトフライ",                       muscleGroup: "SHOULDERS", category: "STRENGTH" },
  { name: "上半身啞鈴繞環", nameEn: "Dumbbell Around the World",   nameJa: "ダンベルアラウンドザワールド",           muscleGroup: "SHOULDERS", category: "STRENGTH" },
  // ARMS
  { name: "啞鈴彎舉",       nameEn: "Dumbbell Curl",               nameJa: "ダンベルカール",                         muscleGroup: "ARMS",      category: "STRENGTH" },
  { name: "上斜彎舉",       nameEn: "Incline Dumbbell Curl",       nameJa: "インクラインダンベルカール",             muscleGroup: "ARMS",      category: "STRENGTH" },
  { name: "集中彎舉",       nameEn: "Concentration Curl",          nameJa: "コンセントレーションカール",             muscleGroup: "ARMS",      category: "STRENGTH" },
  { name: "頸後三頭伸展",   nameEn: "Overhead Triceps Extension",  nameJa: "オーバーヘッドトライセプスエクステンション", muscleGroup: "ARMS",  category: "STRENGTH" },
  { name: "雙槓撐體",       nameEn: "Dips",                        nameJa: "ディップス",                             muscleGroup: "ARMS",      category: "STRENGTH" },
  { name: "窄距伏地挺身",   nameEn: "Diamond Push-up",             nameJa: "ダイヤモンドプッシュアップ",             muscleGroup: "ARMS",      category: "STRENGTH" },
  // LEGS
  { name: "保加利亞分腿蹲", nameEn: "Bulgarian Split Squat",       nameJa: "ブルガリアンスプリットスクワット",       muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "弓步蹲",         nameEn: "Lunges",                      nameJa: "ランジ",                                 muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "羅馬尼亞硬舉",   nameEn: "Romanian Deadlift",           nameJa: "ルーマニアンデッドリフト",               muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "相撲深蹲",       nameEn: "Sumo Squat",                  nameJa: "スモウスクワット",                       muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "臀推",           nameEn: "Hip Thrust",                  nameJa: "ヒップスラスト",                         muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "小腿提踵",       nameEn: "Calf Raise",                  nameJa: "カーフレイズ",                           muscleGroup: "LEGS",      category: "STRENGTH" },
  { name: "壺鈴深蹲",       nameEn: "Goblet Squat",                nameJa: "ゴブレットスクワット",                   muscleGroup: "LEGS",      category: "STRENGTH" },
  // CORE
  { name: "捲腹",           nameEn: "Crunches",                    nameJa: "クランチ",                               muscleGroup: "CORE",      category: "STRENGTH" },
  { name: "懸吊舉腿",       nameEn: "Hanging Leg Raise",           nameJa: "ハンギングレッグレイズ",                 muscleGroup: "CORE",      category: "STRENGTH" },
  { name: "側棒式",         nameEn: "Side Plank",                  nameJa: "サイドプランク",                         muscleGroup: "CORE",      category: "STRENGTH" },
  { name: "俄羅斯轉體",     nameEn: "Russian Twist",               nameJa: "ロシアンツイスト",                       muscleGroup: "CORE",      category: "STRENGTH" },
  { name: "死蟲",           nameEn: "Dead Bug",                    nameJa: "デッドバグ",                             muscleGroup: "CORE",      category: "STRENGTH" },
  // FULL_BODY
  { name: "壺鈴擺盪",       nameEn: "Kettlebell Swing",            nameJa: "ケトルベルスイング",                     muscleGroup: "FULL_BODY", category: "STRENGTH" },
  { name: "波比跳",         nameEn: "Burpee",                      nameJa: "バーピー",                               muscleGroup: "FULL_BODY", category: "CARDIO"   },
  { name: "農夫走路",       nameEn: "Farmer's Walk",               nameJa: "ファーマーズウォーク",                   muscleGroup: "FULL_BODY", category: "STRENGTH" },
  { name: "土耳其起立",     nameEn: "Turkish Get-up",              nameJa: "ターキッシュゲットアップ",               muscleGroup: "FULL_BODY", category: "STRENGTH" },
  // CARDIO
  { name: "跳繩",           nameEn: "Jump Rope",                   nameJa: "なわとび",                               muscleGroup: "CARDIO",    category: "CARDIO"   },
  { name: "飛輪",           nameEn: "Stationary Bike",             nameJa: "エアロバイク",                           muscleGroup: "CARDIO",    category: "CARDIO"   },
  { name: "划船機",         nameEn: "Rowing Machine",              nameJa: "ローイングマシン",                       muscleGroup: "CARDIO",    category: "CARDIO"   },
  { name: "橢圓機",         nameEn: "Elliptical Trainer",          nameJa: "エリプティカル",                         muscleGroup: "CARDIO",    category: "CARDIO"   },
] as const;

async function main() {
  const { data: existing, error: fetchErr } = await supabase
    .from("Exercise")
    .select("name")
    .eq("isCustom", false);

  if (fetchErr) throw fetchErr;

  const existingNames = new Set((existing ?? []).map((e: { name: string }) => e.name));
  const toInsert = newExercises.filter((e) => !existingNames.has(e.name));

  if (toInsert.length === 0) {
    console.log("All exercises already exist — nothing to insert.");
    return;
  }

  const { error } = await supabase.from("Exercise").insert(
    toInsert.map((ex) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      nameEn: ex.nameEn,
      nameJa: ex.nameJa,
      muscleGroup: ex.muscleGroup,
      category: ex.category,
      imageUrl: null,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );

  if (error) throw error;

  console.log(`Done. ${toInsert.length} exercises added:`);
  toInsert.forEach((e) => console.log(`  + ${e.name} (${e.nameEn})`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
