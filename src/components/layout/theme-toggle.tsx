"use client";

import { useEffect, useReducer } from "react";
import { MoonStarIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [, forceUpdate] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem("ai-price-watch-theme");
    root.classList.toggle("dark", stored === "dark");
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("ai-price-watch-theme", nextTheme);
    forceUpdate();
  };

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换主题"
      className={cn(
        "inline-flex h-10 items-center rounded-full border border-border bg-background/92 text-sm font-medium text-foreground transition-colors hover:border-primary/25 hover:bg-primary/7",
        compact ? "size-10 justify-center px-0" : "gap-2 px-3",
      )}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonStarIcon className="size-4" />}
      {!compact ? <span>{isDark ? "浅色" : "深色"}</span> : null}
    </button>
  );
}
