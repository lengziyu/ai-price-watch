"use client";

import { useEffect, useMemo, useState } from "react";

export function AdminAnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  const formatter = useMemo(() => new Intl.NumberFormat("zh-CN"), []);

  useEffect(() => {
    const targetValue = Number.isFinite(value) ? value : 0;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    if (mediaQuery.matches || targetValue === 0) {
      animationFrame = requestAnimationFrame(() => setDisplayValue(targetValue));
      return;
    }

    const startedAt = performance.now();
    const duration = 760;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplayValue(Math.round(targetValue * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{formatter.format(displayValue)}</>;
}
