"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { siteConfig } from "@/lib/site";
import {
  addLocalePrefix,
  defaultLocale,
  getLocaleFromPathname,
  removeLocalePrefix,
} from "@/lib/i18n";
import { getPrimaryNav, getUICopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { GlowingSearch } from "@/components/layout/glowing-search";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { stickyTabsEvent } from "@/components/shared/use-sticky-tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function navBadgeClassName(badge: string) {
  return cn(
    "rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase leading-none text-white shadow-sm ring-1",
    badge === "hot"
      ? "bg-red-500 ring-red-300/70"
      : "bg-primary ring-primary/25",
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname) ?? defaultLocale;
  const contentPathname = removeLocalePrefix(pathname);
  const uiCopy = getUICopy(currentLocale);
  const primaryNav = getPrimaryNav(currentLocale);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(88);
  const [headerHideProgress, setHeaderHideProgress] = useState(0);
  const stickyOwnerStateRef = useRef<Record<string, { active: boolean; progress: number }>>({});

  useEffect(() => {
    const updateHeight = () => {
      const nextHeight = headerRef.current?.getBoundingClientRect().height ?? 88;
      setHeaderHeight(nextHeight);
      document.documentElement.style.setProperty("--site-header-height", `${nextHeight}px`);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    const handleStickyChange = (event: Event) => {
      const detail = (
        event as CustomEvent<{ active?: boolean; headerProgress?: number; owner?: string }>
      ).detail;

      if (!detail?.owner) {
        return;
      }

      stickyOwnerStateRef.current[detail.owner] = {
        active: Boolean(detail.active),
        progress: Math.max(0, Math.min(1, detail.headerProgress ?? 0)),
      };

      const maxProgress = Object.values(stickyOwnerStateRef.current).reduce(
        (maxValue, item) => (item.progress > maxValue ? item.progress : maxValue),
        0,
      );

      setHeaderHideProgress(maxProgress);
    };

    window.addEventListener(stickyTabsEvent, handleStickyChange as EventListener);

    return () => {
      window.removeEventListener(stickyTabsEvent, handleStickyChange as EventListener);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-site-header
      style={{
        opacity: 1 - headerHideProgress,
        transform: `translateY(-${headerHideProgress * (headerHeight + 16)}px)`,
      }}
      className={cn(
        "sticky top-0 z-[80] border-b border-transparent bg-transparent transition-[transform,opacity] duration-220 ease-out",
        headerHideProgress >= 0.999 && "pointer-events-none",
      )}
    >
      <div className="app-shell py-4">
        <div className="nav-glass flex items-center justify-between rounded-full px-4 py-2.5">
          <Link href={addLocalePrefix("/", currentLocale)} className="min-w-0">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {primaryNav.map((item) => {
              const active =
                item.href === "/"
                  ? contentPathname === item.href
                  : contentPathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={addLocalePrefix(item.href, currentLocale)}
                  className={cn(
                    "relative text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  {item.badge ? (
                    <span className={cn("absolute -right-4 -top-3", navBadgeClassName(item.badge))}>
                      {uiCopy.header.badgeText[item.badge as "hot" | "new"] ?? item.badge}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "absolute -bottom-[1rem] left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300",
                      active && "w-[2.3rem]",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <GlowingSearch />

            <LanguageSwitcher compact />

            <div className="flex items-center rounded-full border border-border bg-background/58 p-1 backdrop-blur-xl">
              <ThemeToggle compact />
            </div>
          </div>

          <Sheet>
            <SheetTrigger
              aria-label={uiCopy.header.openNavAriaLabel}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.56)] backdrop-blur-xl lg:hidden"
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm border-l border-border/70 bg-background/94 backdrop-blur-2xl"
            >
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
                <SheetDescription>{uiCopy.header.sheetDescription}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 px-4">
                <div className="rounded-[18px] border border-border/80 bg-background/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.64),0_16px_38px_rgba(2,44,34,0.06)] backdrop-blur-xl">
                  <GlowingSearch className="search-glow--sheet w-full" />
                </div>
              </div>
              <div className="mt-3 px-4">
                <LanguageSwitcher />
              </div>
              <div className="mt-3 px-4">
                <div className="inline-flex rounded-full border border-border/80 bg-background/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.64)] backdrop-blur-xl">
                  <ThemeToggle />
                </div>
              </div>
              <nav className="mt-5 flex flex-col gap-2 px-4 pb-6">
                {primaryNav.map((item) => {
                  const active =
                    item.href === "/"
                      ? contentPathname === item.href
                      : contentPathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={addLocalePrefix(item.href, currentLocale)}
                      className={cn(
                        "motion-surface rounded-xl border border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/7 hover:text-foreground",
                      active && "border-primary/25 bg-primary/10 text-primary",
                    )}
                  >
                      <span className="inline-flex items-center gap-2">
                        {item.label}
                        {item.badge ? (
                          <span className={navBadgeClassName(item.badge)}>
                            {uiCopy.header.badgeText[item.badge as "hot" | "new"] ?? item.badge}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
