import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ScatterCard = {
  label: string;
  sub: string;
  done?: boolean;
  /** stat 卡的變化量（橘色小字） */
  delta?: string;
  /** 卡型：預設文字列；stat 大數字；line/bars 迷你圖表 */
  variant?: "stat" | "line" | "bars";
  /** 絕對定位 + 旋轉 + 響應式顯示 */
  pos: string;
};

const cards: ScatterCard[] = [
  {
    label: "槓鈴臥推",
    sub: "60 kg × 8",
    done: true,
    pos: "-top-3 left-[4%] -rotate-[8deg]",
  },
  {
    label: "本週訓練",
    sub: "4 次",
    delta: "▴ 1",
    variant: "stat",
    pos: "top-[3%] left-[24%] rotate-[5deg] hidden lg:flex",
  },
  {
    label: "硬舉",
    sub: "100 kg × 3",
    done: true,
    pos: "-top-2 right-[18%] -rotate-[4deg]",
  },
  {
    label: "教練課",
    sub: "週三 19:00",
    pos: "top-[16%] -right-6 rotate-[10deg]",
  },
  {
    label: "體重趨勢",
    sub: "30 天",
    variant: "line",
    pos: "top-[30%] right-[13%] -rotate-[3deg] hidden md:flex",
  },
  {
    label: "肩上推舉",
    sub: "32 kg × 10",
    pos: "top-[46%] right-[3%] -rotate-[6deg] hidden md:flex",
  },
  {
    label: "目前體重",
    sub: "72.4 kg",
    delta: "▾ 0.6",
    variant: "stat",
    pos: "bottom-[20%] right-[6%] rotate-[7deg]",
  },
  {
    label: "背肌日",
    sub: "6 動作・20 組",
    pos: "-bottom-3 right-[22%] -rotate-[5deg]",
  },
  {
    label: "有氧",
    sub: "30 min",
    done: true,
    pos: "bottom-[5%] left-[40%] rotate-[3deg] hidden lg:flex",
  },
  {
    label: "引體向上",
    sub: "自重 × 10",
    pos: "-bottom-2 left-[8%] rotate-[8deg]",
  },
  {
    label: "深蹲",
    sub: "80 kg × 5",
    pos: "bottom-[28%] -left-5 -rotate-[10deg]",
  },
  {
    label: "週訓練量",
    sub: "kg",
    variant: "bars",
    pos: "top-[57%] left-[6%] rotate-[4deg] hidden lg:flex",
  },
  {
    label: "體脂率",
    sub: "18.2 %",
    pos: "top-[42%] left-[2%] rotate-[6deg] hidden md:flex",
  },
  {
    label: "教練回饋",
    sub: "練得不錯",
    done: true,
    pos: "top-[14%] left-[6%] -rotate-[7deg]",
  },
];

function LineChart() {
  return (
    <svg viewBox="0 0 96 24" className="h-6 w-24" aria-hidden>
      <path
        d="M0,16 C12,14 18,19 30,17 C42,15 48,8 60,11 C72,14 80,18 96,15"
        fill="none"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BarsChart() {
  const bars = [10, 16, 8, 20, 14];
  return (
    <svg viewBox="0 0 96 24" className="h-6 w-24" aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 20}
          y={24 - h}
          width="12"
          height={h}
          rx="2"
          fill={h === 20 ? "#f97316" : "#374151"}
        />
      ))}
    </svg>
  );
}

/**
 * 登入/註冊頁四周散落的健身小卡（Amie 風裝飾層）：
 * 隨機旋轉、部分掉出畫面外、進場依序浮起；不擋互動、小螢幕整層隱藏。
 * 卡型比例約 8 成文字列 + 2 成 stat/圖表卡（視覺重音，別加太多）。
 */
export default function AuthScatter() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden select-none sm:block"
    >
      {cards.map((card, i) => (
        <div
          key={card.label + card.sub}
          style={{ animationDelay: `${i * 60}ms` }}
          className={cn(
            "absolute rounded-lg border border-gray-800 bg-gray-900/90 shadow-xl motion-safe:animate-[rise_0.6s_ease-out_both]",
            card.variant
              ? "flex flex-col gap-1 px-4 py-3"
              : "flex items-center gap-2.5 px-4 py-2.5",
            card.pos,
          )}
        >
          {card.variant === "stat" ? (
            <>
              <span className="text-[11px] whitespace-nowrap text-gray-500">
                {card.label}
              </span>
              <span className="text-lg leading-none font-bold whitespace-nowrap text-white">
                {card.sub}{" "}
                {card.delta && (
                  <span className="text-xs font-medium text-orange-400">
                    {card.delta}
                  </span>
                )}
              </span>
            </>
          ) : card.variant === "line" || card.variant === "bars" ? (
            <>
              <span className="text-[11px] whitespace-nowrap text-gray-500">
                {card.label}（{card.sub}）
              </span>
              {card.variant === "line" ? <LineChart /> : <BarsChart />}
            </>
          ) : (
            <>
              {card.done ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              ) : (
                <span className="h-3 w-3 shrink-0 rounded-full border border-gray-600" />
              )}
              <span className="text-sm font-medium whitespace-nowrap text-gray-300">
                {card.label}
              </span>
              <span className="text-xs whitespace-nowrap text-gray-500">
                {card.sub}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
