import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { AnimeReveal } from "@/components/shared/anime-reveal";
import { HeroMesh } from "@/components/shared/hero-mesh";
import { buttonVariants } from "@/components/ui/button";

type Action = {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "outline";
};

type PageHeroProps = {
  note?: string;
  title: ReactNode;
  description: ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  rightSlot?: ReactNode;
  compact?: boolean;
};

export function PageHero({
  note,
  title,
  description,
  primaryAction,
  secondaryAction,
  rightSlot,
  compact = false,
}: PageHeroProps) {
  return (
    <section
      className={[
        "hero-stage hero-mesh-stage hero-aura w-full bg-background",
        compact
          ? "-mt-[72px] pt-[78px] sm:-mt-[94px] sm:pt-[102px]"
          : "-mt-[80px] pt-[86px] sm:-mt-[104px] sm:pt-[116px]",
      ].join(" ")}
    >
      <HeroMesh />
      <div className={["app-shell", compact ? "py-3.5 sm:py-5 lg:py-6" : "py-5 sm:py-7 lg:py-9"].join(" ")}>
        <div
          className={[
            "grid items-center lg:grid-cols-[1fr_0.92fr]",
            compact ? "gap-4.5 sm:gap-5.5 lg:gap-6" : "gap-5.5 sm:gap-6.5 lg:gap-7",
          ].join(" ")}
        >
          <AnimeReveal
            selector=":scope > *"
            stagger={90}
            className="flex flex-col gap-6 sm:gap-7"
          >
            {note ? (
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/75 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span>{note}</span>
              </div>
            ) : null}

            <div className="text-[2.2rem] font-semibold leading-[0.94] tracking-[-0.043em] text-foreground [&>div+div]:mt-2.5 sm:max-w-[720px] sm:text-[2.38rem] sm:[&>div+div]:mt-3.5 lg:text-[2.8rem]">
              {title}
            </div>

            <div className="text-[13.5px] leading-[1.82] text-muted-foreground sm:max-w-[640px] sm:text-[14px] sm:leading-[1.68]">
              {description}
            </div>

            {primaryAction || secondaryAction ? (
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className={buttonVariants({
                      size: "lg",
                      className:
                        "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                    })}
                  >
                    <span className="hero-gradient-text">{primaryAction.label}</span>
                    {primaryAction.icon ?? <ArrowRightIcon data-icon="inline-end" />}
                  </Link>
                ) : null}

                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className={buttonVariants({
                      variant: secondaryAction.variant ?? "outline",
                      size: "lg",
                      className:
                        "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                    })}
                  >
                    <span className="hero-gradient-text">{secondaryAction.label}</span>
                    {secondaryAction.icon ?? <ArrowRightIcon data-icon="inline-end" />}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </AnimeReveal>

          {rightSlot ? (
            <AnimeReveal className="hidden lg:block" distance={28} delay={140}>
              {rightSlot}
            </AnimeReveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
