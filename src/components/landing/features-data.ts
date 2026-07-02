import {
  CalendarCheck,
  Dumbbell,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** 功能介紹卡片資料：新功能上線時在此新增一筆即可，版面自動排版 */
export const features: Feature[] = [
  {
    icon: Dumbbell,
    title: "訓練日誌",
    description:
      "從 23+ 動作庫挑選動作，逐組記錄重量與次數，卡片式回顧每一次訓練。",
  },
  {
    icon: TrendingUp,
    title: "體重趨勢",
    description:
      "體重與體脂率雙軸折線圖，30／90 天視角切換，進步一眼看得見。",
  },
  {
    icon: CalendarCheck,
    title: "教練預約",
    description:
      "瀏覽教練開放時段、一鍵預約課程，預約截止時間自動把關。",
  },
  {
    icon: ShieldCheck,
    title: "管理後台",
    description:
      "組織設定與稽核紀錄，每一筆關鍵操作都自動留痕、可追溯。",
  },
];
