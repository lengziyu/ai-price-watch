"use client";

import { animate, stagger as animeStagger } from "animejs";
import type { ElementType, ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type AnimeRevealProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: number;
  scaleFrom?: number;
  once?: boolean;
  trigger?: "view" | "mount";
  threshold?: number;
  rootMargin?: string;
  preloadViewportRatio?: number;
};

export function AnimeReveal<T extends ElementType = "div">({
  as,
  children,
  className,
  selector,
  stagger,
  delay = 0,
  duration = 800,
  distance = 22,
  blur = 12,
  scaleFrom = 0.985,
  once = true,
  trigger = "view",
  threshold = 0.04,
  rootMargin = "0px 0px 10% 0px",
  preloadViewportRatio = 0.04,
}: AnimeRevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;

    if (!root) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    const targets = selector
      ? Array.from(root.querySelectorAll<HTMLElement>(selector))
      : [root];

    if (!targets.length) {
      return;
    }

    let hasPlayed = false;
    const primeTargets = () => {
      targets.forEach((target) => {
        if (target.dataset.animeReady === "true") {
          return;
        }

        target.dataset.animeReady = "true";
        target.style.opacity = "0";
        target.style.transform = `translate3d(0, ${distance}px, 0) scale(${scaleFrom})`;
        target.style.filter = `blur(${blur}px)`;
        target.style.willChange = "transform, opacity, filter";
      });
    };

    const playAnimation = () => {
      if (hasPlayed && once) {
        return;
      }

      hasPlayed = true;

      animate(targets, {
        opacity: [0, 1],
        translateY: [distance, 0],
        scale: [scaleFrom, 1],
        filter: [`blur(${blur}px)`, "blur(0px)"],
        delay:
          typeof stagger === "number"
            ? animeStagger(stagger, { start: delay })
            : delay,
        duration,
        ease: "out(3)",
        onComplete: () => {
          targets.forEach((target) => {
            target.style.willChange = "";
            target.style.opacity = "1";
            target.style.transform = "";
            target.style.filter = "";
          });
        },
      });
    };

    primeTargets();

    if (trigger === "mount") {
      playAnimation();
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const preloadOffset = Math.max(32, window.innerHeight * preloadViewportRatio);

    if (
      rootRect.top <= window.innerHeight + preloadOffset &&
      rootRect.bottom >= -preloadOffset &&
      rootRect.top < window.innerHeight
    ) {
      playAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        playAnimation();

        if (once) {
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, [
    blur,
    delay,
    distance,
    duration,
    once,
    preloadViewportRatio,
    rootMargin,
    scaleFrom,
    selector,
    stagger,
    threshold,
    trigger,
  ]);

  return (
    <Component ref={ref} className={cn(className)}>
      {children}
    </Component>
  );
}
