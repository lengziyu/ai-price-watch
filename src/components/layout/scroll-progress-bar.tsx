"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { animate } from "animejs";

export function ScrollProgressBar() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextValue = scrollHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollHeight)) : 0;

      if (mediaQuery.matches) {
        bar.style.transform = `scaleX(${nextValue})`;
        return;
      }

      animationRef.current?.pause?.();
      animationRef.current = animate(bar, {
        scaleX: nextValue,
        duration: 280,
        ease: "out(3)",
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      animationRef.current?.pause?.();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-[linear-gradient(90deg,rgba(0,188,125,0.96),rgba(92,214,179,0.92)_46%,rgba(250,204,21,0.9))] shadow-[0_0_18px_rgba(0,188,125,0.28)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
