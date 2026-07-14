"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./reveal";
import { features } from "./features-data";

/**
 * Sticky scrollytelling（md 以上）：左欄視覺面板釘住，右欄功能說明
 * 逐一滾過視窗中線時切換左欄視覺與進度指示。
 * 手機維持原本的卡片式排版（視覺內嵌於卡片）。
 */
export default function StickyFeatures() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = itemRefs.current.indexOf(entry.target as HTMLDivElement);
          if (i !== -1) setActive(i);
        }
      },
      // 只留視窗中線附近 10% 的偵測帶：項目跨過中線才切換
      { rootMargin: "-45% 0px -45% 0px" }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 手機：原卡片式排版 */}
      <div className="mt-14 grid gap-4 md:hidden">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 75}>
            <div className="flex h-full flex-col rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors duration-150 hover:border-orange-500/40">
              <feature.visual />
              <h3 className="mt-4 text-lg font-bold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 桌機：sticky scrollytelling */}
      <div className="mt-14 hidden md:grid md:grid-cols-2 md:gap-16">
        {/* 左欄：釘住的視覺面板 + 進度指示 */}
        <div className="sticky top-24 self-start">
          <div className="relative h-80 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
            <div
              aria-hidden
              className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"
            />
            {features.map((feature, i) => (
              <div
                key={feature.title}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 flex items-center justify-center p-10 motion-safe:transition-opacity motion-safe:duration-300",
                  i === active ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <div className="w-full max-w-sm">
                  <feature.visual />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="font-mono text-xs text-gray-500">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(features.length).padStart(2, "0")}
            </span>
            <div className="flex flex-1 gap-1.5">
              {features.map((feature, i) => (
                <span
                  key={feature.title}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i <= active ? "bg-orange-500" : "bg-gray-800"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 右欄：滾動的功能說明，跨過中線時高亮 */}
        <div>
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={cn(
                "flex min-h-[55vh] flex-col justify-center border-l-2 pl-8 transition-colors duration-300",
                i === active ? "border-orange-500" : "border-gray-800"
              )}
            >
              <span
                className={cn(
                  "font-mono text-sm transition-colors duration-300",
                  i === active ? "text-orange-500" : "text-gray-600"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className={cn(
                  "mt-2 text-2xl font-bold transition-colors duration-300",
                  i === active ? "text-white" : "text-gray-500"
                )}
              >
                {feature.title}
              </h3>
              <p
                className={cn(
                  "mt-3 leading-relaxed transition-colors duration-300",
                  i === active ? "text-gray-300" : "text-gray-600"
                )}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
