"use client";

import type { ElementType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ScrambleTextProps = {
  as?: ElementType;
  text: string;
  className?: string;
  autoPlay?: boolean;
};

const LATIN_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CJK_POOL = "价速雷订率优模智通算比惠据全局";

function shouldKeepCharacter(char: string) {
  return /\s|[.,!?/+\-·:()（）]/.test(char);
}

function pickRandomCharacter(source: string) {
  const isLatin = /[A-Za-z]/.test(source);
  const isDigit = /\d/.test(source);
  const pool = isDigit ? "0123456789" : isLatin ? LATIN_POOL : CJK_POOL;
  const next = pool[Math.floor(Math.random() * pool.length)] ?? source;
  return /[a-z]/.test(source) ? next.toLowerCase() : next;
}

function buildFrame(target: string, revealCount: number) {
  return Array.from(target)
    .map((char, index) => {
      if (shouldKeepCharacter(char) || index < revealCount) {
        return char;
      }
      return pickRandomCharacter(char);
    })
    .join("");
}

export function ScrambleText({
  as,
  text,
  className,
  autoPlay = true,
}: ScrambleTextProps) {
  const Component = as ?? "span";
  const [displayText, setDisplayText] = useState(text);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const run = useCallback(() => {
    stop();

    if (typeof window === "undefined") {
      setDisplayText(text);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayText(text);
      return;
    }

    const start = performance.now();
    const duration = Math.min(980, 380 + text.length * 18);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const revealCount = Math.floor(progress * text.length);
      setDisplayText(buildFrame(text, revealCount));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [stop, text]);

  useEffect(() => {
    if (!autoPlay || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setTimeout(() => {
      run();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [autoPlay, run]);

  useEffect(() => stop, [stop]);

  return (
    <Component
      className={cn("inline-block align-baseline", className)}
      data-scramble-text={text}
      onMouseEnter={run}
      aria-label={text}
    >
      {displayText}
    </Component>
  );
}
