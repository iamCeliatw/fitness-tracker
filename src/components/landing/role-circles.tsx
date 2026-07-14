"use client";

import { useState } from "react";
import { ClipboardList, LineChart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Reveal from "./reveal";

const roles = [
  {
    icon: ClipboardList,
    name: "學員",
    scenario:
      "記錄每次訓練與體重變化，瀏覽教練時段一鍵預約，所有進步都有數據佐證。",
    tags: ["訓練日誌", "體重趨勢", "一鍵預約"],
  },
  {
    icon: Users,
    name: "教練",
    scenario: "一眼掌握學員本週訓練進度，管理自己的開放時段與本週行程。",
    tags: ["學員進度", "時段管理", "本週行程"],
  },
  {
    icon: LineChart,
    name: "管理員",
    scenario: "設定組織預約規則，透過稽核紀錄追蹤平台上的每一筆關鍵操作。",
    tags: ["組織設定", "預約規則", "稽核紀錄"],
  },
];

/**
 * 三種角色的重疊圓圈呈現（generosity.co.jp 的 business 區手法）：
 * hover/focus 的圓放大、變橘、帶光暈，下方情境文字與標籤跟著切換。
 * 手機沒有 hover，退回卡片式排版。
 */
export default function RoleCircles() {
  const [active, setActive] = useState(0);

  return (
    <>
      {/* 手機：卡片式 */}
      <div className="mt-14 grid gap-4 md:hidden">
        {roles.map((role, i) => (
          <Reveal key={role.name} delay={i * 75}>
            <div className="h-full rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <role.icon className="h-5 w-5 text-orange-500" />
                </div>
                <span className="font-mono text-sm text-gray-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{role.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {role.scenario}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 桌機：交疊圓圈 + 切換的情境說明 */}
      <Reveal className="hidden md:block">
        <div className="mt-14 flex items-center justify-center">
          {roles.map((role, i) => (
            <button
              key={role.name}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={cn(
                "flex h-56 w-56 flex-col items-center justify-center rounded-full border transition-all duration-300 ease-out lg:h-64 lg:w-64",
                i > 0 && "-ml-10",
                i === active
                  ? "z-10 scale-110 border-orange-500/60 bg-orange-500/10 shadow-[0_0_60px_rgba(249,115,22,0.15)]"
                  : "border-gray-700 bg-gray-900/40"
              )}
            >
              <role.icon
                className={cn(
                  "h-6 w-6 transition-colors duration-300",
                  i === active ? "text-orange-400" : "text-gray-500"
                )}
              />
              <span
                className={cn(
                  "mt-3 text-2xl font-bold transition-colors duration-300",
                  i === active ? "text-orange-400" : "text-gray-300"
                )}
              >
                {role.name}
              </span>
            </button>
          ))}
        </div>
        <div
          key={active}
          className="mx-auto mt-10 max-w-xl text-center motion-safe:animate-[rise_0.4s_ease-out_both]"
        >
          <p className="text-gray-300">{roles[active].scenario}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {roles[active].tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}
