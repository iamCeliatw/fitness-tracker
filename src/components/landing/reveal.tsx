"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** 同區塊多張卡片的 stagger 延遲（ms） */
  delay?: number;
  /** 進場方向（預設由下往上） */
  from?: "up" | "left" | "right";
  className?: string;
};

const hiddenByDirection = {
  up: "opacity-0 translate-y-4",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
};

/**
 * Scroll-reveal：進入視窗時 opacity + translate-y 進場。
 * 內容預設可見（SSR / 無 JS 時完整可讀），JS 掛載後才對
 * 視窗外的元素套用隱藏並觀察；prefers-reduced-motion 時不動作。
 */
export default function Reveal({
  children,
  delay = 0,
  from = "up",
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 已在首屏內的元素不做進場動態，避免載入後閃爍
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setHidden(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={hidden ? undefined : { transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-500 ease-out",
        hidden
          ? hiddenByDirection[from]
          : "opacity-100 translate-x-0 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
