import type { ComponentType } from "react";
import {
  AuditLogVisual,
  BodyTrendVisual,
  BookingVisual,
  WorkoutLogVisual,
} from "./feature-visuals";

export type Feature = {
  title: string;
  description: string;
  /** 卡片內的迷你產品 UI 示意 */
  visual: ComponentType;
  /** bento 格寬（md 以上，5 欄制）；省略時預設半寬 */
  span?: "wide" | "narrow";
};

/**
 * 功能介紹卡片資料：新功能上線時在此新增一筆即可（visual 可先沿用
 * 既有元件或補一個新的迷你 UI），版面自動排版。
 */
export const features: Feature[] = [
  {
    title: "訓練日誌",
    description:
      "從 23+ 動作庫挑選動作，逐組記錄重量與次數，卡片式回顧每一次訓練。",
    visual: WorkoutLogVisual,
    span: "wide",
  },
  {
    title: "體重趨勢",
    description:
      "體重與體脂率雙軸折線圖，30／90 天視角切換，進步一眼看得見。",
    visual: BodyTrendVisual,
    span: "narrow",
  },
  {
    title: "教練預約",
    description: "瀏覽教練開放時段、一鍵預約課程，預約截止時間自動把關。",
    visual: BookingVisual,
    span: "narrow",
  },
  {
    title: "管理後台",
    description: "組織設定與稽核紀錄，每一筆關鍵操作都自動留痕、可追溯。",
    visual: AuditLogVisual,
    span: "wide",
  },
];
