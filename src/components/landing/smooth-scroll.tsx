"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis 阻尼平滑滾動（只掛在 marketing layout，不影響 dashboard）。
 * anchors offset -80 對齊 fixed nav 高度（同 section 的 scroll-mt-20）；
 * prefers-reduced-motion 時不啟用。
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 } });
    return () => lenis.destroy();
  }, []);
  return null;
}
