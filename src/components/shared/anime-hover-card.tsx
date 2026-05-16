"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { animate } from "animejs";

import { cn } from "@/lib/utils";

type AnimeHoverCardProps = {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
  duration?: number;
};

export function AnimeHoverCard({
  children,
  className,
  lift = 4,
  scale = 1.01,
  duration = 320,
}: AnimeHoverCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const prefersReducedMotionRef = useRef(false);

  const animateCard = useCallback((active: boolean) => {
    const node = ref.current;

    if (!node || prefersReducedMotionRef.current) {
      return;
    }

    animationRef.current?.pause?.();
    node.style.willChange = "transform";

    animationRef.current = animate(node, {
      translateY: active ? -lift : 0,
      scale: active ? scale : 1,
      duration: active ? duration : Math.max(220, duration - 60),
      ease: active ? "out(3)" : "out(2)",
      onComplete: () => {
        if (!active && ref.current) {
          ref.current.style.willChange = "";
        }
      },
    });
  }, [duration, lift, scale]);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = event.matches;
    };
    const handleEnter = () => animateCard(true);
    const handleLeave = () => animateCard(false);

    mediaQuery.addEventListener("change", handleChange);
    node.addEventListener("pointerenter", handleEnter);
    node.addEventListener("pointerleave", handleLeave);
    node.addEventListener("focusin", handleEnter);
    node.addEventListener("focusout", handleLeave);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      node.removeEventListener("pointerenter", handleEnter);
      node.removeEventListener("pointerleave", handleLeave);
      node.removeEventListener("focusin", handleEnter);
      node.removeEventListener("focusout", handleLeave);
      animationRef.current?.pause?.();
    };
  }, [animateCard]);

  return (
    <div
      ref={ref}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
