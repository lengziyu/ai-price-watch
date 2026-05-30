"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  addLocalePrefix,
  defaultLocale,
  getLocaleFromPathname,
  supportedLocales,
  type SiteLocale,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  compact?: boolean;
};

const localeLabel: Record<SiteLocale, string> = {
  "zh-CN": "中",
  en: "EN",
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = useMemo(() => {
    const detected = pathname ? getLocaleFromPathname(pathname) : null;
    return detected ?? defaultLocale;
  }, [pathname]);

  const queryString = searchParams.toString();
  const basePathname = pathname || "/";

  const switchLocale = (nextLocale: SiteLocale) => {
    if (nextLocale === currentLocale) {
      return;
    }

    const nextPath = addLocalePrefix(basePathname, nextLocale);
    const nextHref = queryString ? `${nextPath}?${queryString}` : nextPath;
    const redirectHref = `/api/locale?locale=${encodeURIComponent(nextLocale)}&redirect=${encodeURIComponent(nextHref)}`;

    window.location.assign(redirectHref);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background/70 p-1 backdrop-blur-xl",
        compact ? "gap-0.5" : "gap-1",
      )}
    >
      {supportedLocales.map((locale) => {
        const active = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchLocale(locale)}
            className={cn(
              "rounded-full font-medium transition-colors",
              compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-[12px]",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
            )}
            aria-pressed={active}
            aria-label={`切换到${locale === "en" ? "英文" : "中文"}`}
          >
            {localeLabel[locale]}
          </button>
        );
      })}
    </div>
  );
}
