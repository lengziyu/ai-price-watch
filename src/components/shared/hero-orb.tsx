import type { ReactNode } from "react";
import { CrownIcon, Globe2Icon, BadgePercentIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroOrb({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full items-center justify-center",
        compact
          ? "h-[196px] max-w-[360px] sm:h-[232px]"
          : "h-[260px] max-w-[460px] sm:h-[320px]",
      )}
    >
      <div className="absolute inset-6 rounded-[1.4rem] border border-border/80 bg-[radial-gradient(circle_at_top,rgba(180,230,214,0.35),transparent_60%)]" />
      <div className={cn("absolute rounded-[1.4rem] border border-border/70", compact ? "inset-14" : "inset-14")} />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b4e6d6]/70",
          compact ? "h-[136px] w-[280px]" : "h-[180px] w-[380px]",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[18deg] rounded-full border border-[#b4e6d6]/55",
          compact ? "h-[136px] w-[280px]" : "h-[180px] w-[380px]",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-full border border-[#b4e6d6]/55",
          compact ? "h-[136px] w-[280px]" : "h-[180px] w-[380px]",
        )}
      />

      <FloatingBadge compact={compact} className="left-[12%] top-[16%]">
        <Globe2Icon className="size-4 text-primary" />
      </FloatingBadge>
      <FloatingBadge compact={compact} className="right-[11%] top-[28%]">
        <BadgePercentIcon className="size-4 text-primary" />
      </FloatingBadge>
      <FloatingBadge compact={compact} className="left-[18%] bottom-[22%]">
        <TrendingUpIcon className="size-4 text-primary" />
      </FloatingBadge>
      <FloatingBadge compact={compact} className="right-[14%] bottom-[14%]">
        <span className="text-base font-semibold text-primary">$</span>
      </FloatingBadge>

      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(0,188,125,0.18)_0%,_rgba(0,188,125,0.04)_42%,_transparent_68%)] blur-2xl" />

      <div className="relative">
        <div className="absolute inset-0 translate-x-5 translate-y-3 rounded-[1.4rem] bg-[#b4e6d6]/30 blur-md" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.4rem] border border-white/70 bg-white/60" />
        <div
          className={cn(
            "relative flex items-center justify-center rounded-[1.4rem] border border-[#b4e6d6]/90 bg-[linear-gradient(180deg,#9ff3d1_0%,#00bc7d_100%)]",
            compact ? "size-[132px] sm:size-[156px]" : "size-[170px] sm:size-[210px]",
          )}
        >
          <div className="absolute inset-[14px] rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.08)_100%)]" />
          <div
            className={cn(
              "relative flex items-center justify-center rounded-[1rem] bg-white/14 backdrop-blur-sm",
              compact ? "size-[64px] sm:size-[76px]" : "size-20 sm:size-[96px]",
            )}
          >
            <CrownIcon className={cn("fill-white text-white", compact ? "size-9 sm:size-10" : "size-10 sm:size-12")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingBadge({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full border border-border bg-white/95 backdrop-blur-sm",
        compact ? "size-10 sm:size-[46px]" : "size-12 sm:size-[52px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
