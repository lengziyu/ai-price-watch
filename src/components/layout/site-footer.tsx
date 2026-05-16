import Link from "next/link";
import { ArrowRightIcon, DatabaseZapIcon } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { buttonVariants } from "@/components/ui/button";
import { primaryNav, siteConfig, trustBullets } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-background/96 sm:mt-12">
      <div className="app-shell py-5 sm:py-10">
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-border bg-background/82 px-4 py-3 sm:hidden">
          <div className="min-w-0">
            <BrandLogo />
            <div className="mt-1 text-[11px] text-muted-foreground">
              {siteConfig.englishName} · {siteConfig.domain}
            </div>
          </div>
          <Link
            href="/about"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-8 shrink-0 px-3 text-[12px]",
            })}
          >
            数据原则
          </Link>
        </div>

        <AnimeReveal className="motion-surface motion-surface--green mb-6 hidden overflow-hidden rounded-[12px] border border-border px-4 py-4 sm:block sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                <DatabaseZapIcon className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">公开价格持续维护</div>
                <p className="mt-1 max-w-2xl text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                  当前以公开来源、价格整理和复核时间为基础，帮助你快速判断不同方案的成本差异。
                </p>
              </div>
            </div>
            <Link
              href="/about"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-fit shrink-0",
              })}
            >
              查看数据原则
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </AnimeReveal>

        <AnimeReveal
          selector=":scope > *"
          stagger={90}
          className="hidden gap-7 sm:grid lg:grid-cols-[1.12fr_0.9fr_1fr]"
        >
          <div className="flex flex-col gap-3">
            <BrandLogo />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {siteConfig.description} 当前以公开来源和复核记录为基础，持续维护关键价格与活动信息。
            </p>
            <div className="text-[11px] text-muted-foreground">
              {siteConfig.englishName} · {siteConfig.domain}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold">导航</div>
            <div className="flex flex-wrap gap-2">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/7 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/about"
                className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/7 hover:text-foreground"
              >
                关于
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold">数据原则</div>
            <div className="flex flex-col gap-2 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              {trustBullets.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </AnimeReveal>
      </div>
    </footer>
  );
}
