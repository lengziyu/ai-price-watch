"use client";

import { useEffect, useState } from "react";
import { MoonStarIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const themeStorageKey = "ai-price-watch-theme";
const themeEvent = "ai-price-watch-theme-change";

type ThemeMode = "light" | "dark";

function resolveTheme() {
  if (typeof window === "undefined") {
    return "light" as ThemeMode;
  }

  const stored = window.localStorage.getItem(themeStorageKey);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(nextTheme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
  root.dataset.theme = nextTheme;
  window.localStorage.setItem(themeStorageKey, nextTheme);
  window.dispatchEvent(new CustomEvent(themeEvent, { detail: nextTheme }));
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const syncTheme = () => {
      setTheme(resolveTheme());
    };

    syncTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === themeStorageKey) {
        syncTheme();
      }
    };

    const handleThemeEvent = () => {
      syncTheme();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(themeEvent, handleThemeEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(themeEvent, handleThemeEvent);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };
  const isDark = theme === "dark";

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
