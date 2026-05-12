"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { primaryNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { GlowingSearch } from "@/components/layout/glowing-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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

  return (
    <header className="sticky top-0 z-[80] border-b border-transparent bg-transparent">
      <div className="app-shell py-4">
        <div className="nav-glass flex items-center justify-between rounded-full px-4 py-2.5">
          <Link href="/" className="min-w-0">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {primaryNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  {item.badge ? (
                    <span className={cn("absolute -right-4 -top-3", navBadgeClassName(item.badge))}>
                      {item.badge}
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

            <div className="flex items-center rounded-full border border-border bg-background/58 p-1 backdrop-blur-xl">
              <ThemeToggle compact />
            </div>
          </div>

          <Sheet>
            <SheetTrigger
              aria-label="打开导航"
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/58 backdrop-blur-xl lg:hidden"
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-border/70">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
                <SheetDescription>统一按绿色浅色视觉系统浏览站内页面。</SheetDescription>
              </SheetHeader>
              <div className="mt-4 px-4">
                <ThemeToggle />
              </div>
              <nav className="mt-5 flex flex-col gap-2 px-4 pb-6">
                {primaryNav.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-xl border border-transparent px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/7 hover:text-foreground",
                      active && "border-primary/25 bg-primary/10 text-primary",
                    )}
                  >
                      <span className="inline-flex items-center gap-2">
                        {item.label}
                        {item.badge ? (
                          <span className={navBadgeClassName(item.badge)}>
                            {item.badge}
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
