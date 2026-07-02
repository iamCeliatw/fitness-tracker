import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "LIFTLOG — 健身追蹤平台",
  description:
    "記錄重訓、追蹤體重趨勢、預約教練。把每一組訓練，都變成看得見的進步。",
  openGraph: {
    title: "LIFTLOG — 健身追蹤平台",
    description:
      "記錄重訓、追蹤體重趨勢、預約教練。把每一組訓練，都變成看得見的進步。",
    type: "website",
    siteName: "LIFTLOG",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-950 text-white">{children}</div>;
}
