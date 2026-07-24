export type LocalizedExercise = { name: string; nameEn?: string | null; nameJa?: string | null };

export function localizedExerciseName(ex: LocalizedExercise, locale: string): string {
  if (locale === "en" && ex.nameEn) return ex.nameEn;
  if (locale === "ja" && ex.nameJa) return ex.nameJa;
  return ex.name;
}

// 肌群/類別 enum 與中文 label 對照（值與 prisma/schema.prisma 的 enum 一致）
export const MUSCLE_GROUPS = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "ARMS",
  "LEGS",
  "GLUTES",
  "CORE",
  "FULL_BODY",
  "CARDIO",
] as const;

export const MUSCLE_LABELS: Record<string, string> = {
  CHEST: "胸",
  BACK: "背",
  SHOULDERS: "肩",
  ARMS: "手臂",
  LEGS: "腿",
  GLUTES: "臀",
  CORE: "核心",
  FULL_BODY: "全身",
  CARDIO: "有氧",
};

export const EXERCISE_CATEGORIES = [
  "STRENGTH",
  "CARDIO",
  "FLEXIBILITY",
  "BALANCE",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  STRENGTH: "力量",
  CARDIO: "有氧",
  FLEXIBILITY: "柔軟度",
  BALANCE: "平衡",
};
