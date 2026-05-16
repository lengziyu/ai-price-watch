import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { AnimeReveal } from "@/components/shared/anime-reveal";
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
        "hero-stage hero-grid hero-aura w-full bg-background",
        compact
          ? "-mt-[72px] pt-[78px] sm:-mt-[94px] sm:pt-[102px]"
          : "-mt-[80px] pt-[86px] sm:-mt-[104px] sm:pt-[116px]",
      ].join(" ")}
    >
      <div className={["app-shell", compact ? "py-1 sm:py-2.5 lg:py-3.5" : "py-2.5 sm:py-4 lg:py-6"].join(" ")}>
        <div
          className={[
            "grid items-center lg:grid-cols-[1fr_0.92fr]",
            compact ? "gap-2.5 sm:gap-3.5 lg:gap-4" : "gap-3.5 sm:gap-4 lg:gap-5",
          ].join(" ")}
        >
          <AnimeReveal
            selector=":scope > *"
            stagger={90}
            className="flex flex-col gap-3 sm:gap-4"
          >
            {note ? (
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/75 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span>{note}</span>
              </div>
            ) : null}

            <div className="max-w-[700px] text-[1.24rem] font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-[2rem] lg:text-[2.56rem]">
              {title}
            </div>

            <div className="max-w-[600px] text-[12px] leading-5 text-muted-foreground sm:text-[13.5px] sm:leading-[1.58]">
              {description}
            </div>

            {primaryAction || secondaryAction ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className={buttonVariants({
                      size: "lg",
                      className: "px-6",
                    })}
                  >
                    {primaryAction.label}
                    {primaryAction.icon ?? <ArrowRightIcon data-icon="inline-end" />}
                  </Link>
                ) : null}

                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className={buttonVariants({
                      variant: secondaryAction.variant ?? "outline",
                      size: "lg",
                      className: "px-6",
                    })}
                  >
                    {secondaryAction.label}
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
