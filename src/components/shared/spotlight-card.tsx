"use client";

import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  spotlightSize?: number;
};

export function SpotlightCard({
  children,
  className,
  contentClassName,
  spotlightSize = 220,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const style = useMemo(
    () =>
      ({
        "--spotlight-size": `${spotlightSize}px`,
      }) as CSSProperties,
    [spotlightSize],
  );

  const resetSpotlight = () => {
    const node = ref.current;

    if (!node) {
      return;
    }

    node.style.setProperty("--spotlight-x", "-160px");
    node.style.setProperty("--spotlight-y", "-160px");
  };

  const updateSpotlight = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      style={style}
      onPointerEnter={updateSpotlight}
      onPointerLeave={resetSpotlight}
      onPointerMove={updateSpotlight}
      className={cn("spotlight-card", className)}
    >
      <div aria-hidden="true" className="spotlight-card__border" />
      <div aria-hidden="true" className="spotlight-card__glow" />
      <div className={cn("spotlight-card__content", contentClassName)}>{children}</div>
    </div>
  );
}
