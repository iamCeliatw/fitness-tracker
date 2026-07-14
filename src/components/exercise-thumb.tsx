import Image from "next/image";

const MUSCLE_INITIALS: Record<string, string> = {
  CHEST: "胸",
  BACK: "背",
  SHOULDERS: "肩",
  ARMS: "手",
  LEGS: "腿",
  GLUTES: "臀",
  CORE: "核",
  FULL_BODY: "全",
  CARDIO: "氧",
};

interface ExerciseThumbProps {
  imageUrl?: string | null;
  muscleGroup: string;
  name: string;
}

/** 動作縮圖：有圖顯示示範照，無圖（自訂動作）顯示肌群字首方塊 */
export default function ExerciseThumb({ imageUrl, muscleGroup, name }: ExerciseThumbProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={52}
        height={52}
        className="size-[52px] rounded-md object-cover shrink-0"
      />
    );
  }
  return (
    <div
      data-testid="exercise-thumb-fallback"
      className="size-[52px] rounded-md bg-gray-800 text-gray-400 flex items-center justify-center text-sm shrink-0"
    >
      {MUSCLE_INITIALS[muscleGroup] ?? muscleGroup.charAt(0)}
    </div>
  );
}
