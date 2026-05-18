"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CrownIcon, FileTextIcon, LibraryBigIcon, SparklesIcon } from "lucide-react";

type SummaryIconKey = "vendors" | "useCases" | "articles" | "tools";

type InteractiveSummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  iconKey: SummaryIconKey;
};

export function InteractiveSummaryCard({
  label,
  value,
  detail,
  iconKey,
}: InteractiveSummaryCardProps) {
  const parsedValue = useMemo(() => parseAnimatedValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(() =>
    parsedValue ? formatAnimatedValue(0, parsedValue) : value,
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const countRafRef = useRef<number | null>(null);
  const hasPlayedCountRef = useRef(false);

  const stopCountAnimation = useCallback(() => {
    if (countRafRef.current) {
      cancelAnimationFrame(countRafRef.current);
      countRafRef.current = null;
    }
  }, []);

  const startCountAnimation = useCallback(() => {
    if (!parsedValue || hasPlayedCountRef.current) {
      return;
    }

    hasPlayedCountRef.current = true;
    stopCountAnimation();

    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (prefersReducedMotion.matches) {
        setDisplayValue(value);
        return;
      }
    }

    const durationMs = 1100;
    const startAt = performance.now();
    const target = parsedValue.numeric;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const current = target * eased;
      setDisplayValue(formatAnimatedValue(current, parsedValue));

      if (progress < 1) {
        countRafRef.current = requestAnimationFrame(tick);
      } else {
        countRafRef.current = null;
        setDisplayValue(value);
      }
    };

    countRafRef.current = requestAnimationFrame(tick);
  }, [parsedValue, stopCountAnimation, value]);

  useEffect(
    () => () => {
      if (tiltRafRef.current) {
        cancelAnimationFrame(tiltRafRef.current);
      }
      stopCountAnimation();
    },
    [stopCountAnimation],
  );

  const resetCard = useCallback(() => {
    if (tiltRafRef.current) {
      cancelAnimationFrame(tiltRafRef.current);
      tiltRafRef.current = null;
    }

    const card = cardRef.current;
    const frame = frameRef.current;

    if (!card || !frame) {
      return;
    }

    card.dataset.active = "false";
    card.style.setProperty("--summary-perspective", "920px");
    frame.style.setProperty("--summary-rotate-x", "0deg");
    frame.style.setProperty("--summary-rotate-y", "0deg");
    frame.style.setProperty("--summary-shine-x", "0px");
    frame.style.setProperty("--summary-shine-y", "0px");
    frame.style.setProperty("--summary-shine-angle", "118deg");
    frame.style.setProperty("--summary-shine-alpha", "0");
    frame.style.setProperty("--summary-glow-x", "50%");
    frame.style.setProperty("--summary-glow-y", "34%");
    frame.style.setProperty("--summary-glow-alpha", "0");
  }, []);

  const updateCard = useCallback((clientX: number, clientY: number) => {
    if (tiltRafRef.current) {
      cancelAnimationFrame(tiltRafRef.current);
    }

    tiltRafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      const frame = frameRef.current;

      if (!card || !frame) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const ratioX = Math.max(0, Math.min(1, x / width));
      const ratioY = Math.max(0, Math.min(1, y / height));
      const offsetX = x - width / 2;
      const offsetY = y - height / 2;

      const rotateX = -(offsetY / height) * 10.8;
      const rotateY = (offsetX / width) * 13.4;
      const shineX = (ratioX - 0.5) * 18;
      const shineY = (ratioY - 0.5) * 18;
      const angle = (Math.atan2(offsetY, offsetX) * 180) / Math.PI - 90;
      const normalizedAngle = angle < 0 ? angle + 360 : angle;
      const alpha = Math.max(0.16, Math.min(0.34, ratioY * 0.42));
      const glowAlpha = Math.max(0.28, Math.min(0.55, 0.28 + ratioY * 0.34));
      const glowX = `${(ratioX * 100).toFixed(2)}%`;
      const glowY = `${(ratioY * 100).toFixed(2)}%`;

      card.dataset.active = "true";
      card.style.setProperty("--summary-perspective", `${Math.max(700, width * 2)}px`);
      frame.style.setProperty("--summary-rotate-x", `${rotateX.toFixed(3)}deg`);
      frame.style.setProperty("--summary-rotate-y", `${rotateY.toFixed(3)}deg`);
      frame.style.setProperty("--summary-shine-x", `${shineX.toFixed(3)}px`);
      frame.style.setProperty("--summary-shine-y", `${shineY.toFixed(3)}px`);
      frame.style.setProperty("--summary-shine-angle", `${normalizedAngle.toFixed(2)}deg`);
      frame.style.setProperty("--summary-shine-alpha", alpha.toFixed(3));
      frame.style.setProperty("--summary-glow-x", glowX);
      frame.style.setProperty("--summary-glow-y", glowY);
      frame.style.setProperty("--summary-glow-alpha", glowAlpha.toFixed(3));
    });
  }, []);

  useEffect(() => {
    const node = cardRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          startCountAnimation();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [startCountAnimation]);

  const icon = renderSummaryIcon(iconKey);

  return (
    <div
      ref={cardRef}
      className="home-summary-card-tilt"
      data-active="false"
      onMouseEnter={(event) => updateCard(event.clientX, event.clientY)}
      onMouseMove={(event) => updateCard(event.clientX, event.clientY)}
      onMouseLeave={resetCard}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch) {
          updateCard(touch.clientX, touch.clientY);
        }
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        if (touch) {
          updateCard(touch.clientX, touch.clientY);
        }
      }}
      onTouchEnd={resetCard}
      onTouchCancel={resetCard}
    >
      <div ref={frameRef} className="home-summary-card-tilt__inner">
        <div className="home-summary-card-tilt__theme-glow" aria-hidden />
        <div className="home-summary-card-tilt__shine" aria-hidden />
        <div className="rounded-[6px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,252,250,0.96))] px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] dark:bg-[linear-gradient(180deg,rgba(8,14,18,0.96),rgba(10,20,24,0.92))]">
          <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="text-[1.72rem] font-semibold tracking-[-0.05em] text-foreground">
              {displayValue}
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border/75 bg-background/88 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              {icon}
            </span>
          </div>
          <div className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSummaryIcon(iconKey: SummaryIconKey) {
  switch (iconKey) {
    case "vendors":
      return <CrownIcon className="size-4" />;
    case "useCases":
      return <SparklesIcon className="size-4" />;
    case "articles":
      return <FileTextIcon className="size-4" />;
    case "tools":
      return <LibraryBigIcon className="size-4" />;
    default:
      return <CrownIcon className="size-4" />;
  }
}

type ParsedAnimatedValue = {
  prefix: string;
  suffix: string;
  numeric: number;
  decimals: number;
};

function parseAnimatedValue(rawValue: string): ParsedAnimatedValue | null {
  const matched = rawValue.trim().match(/^([^0-9+\-]*)([+\-]?\d[\d,]*(?:\.\d+)?)(.*)$/);

  if (!matched) {
    return null;
  }

  const [, prefix, numberPart, suffix] = matched;
  const normalized = numberPart.replaceAll(",", "");
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  const decimalPart = normalized.split(".")[1];
  return {
    prefix,
    suffix,
    numeric,
    decimals: decimalPart ? decimalPart.length : 0,
  };
}

function formatAnimatedValue(value: number, parsed: ParsedAnimatedValue): string {
  if (parsed.decimals > 0) {
    const fixedValue = Number(value.toFixed(parsed.decimals));
    return `${parsed.prefix}${fixedValue.toLocaleString(undefined, {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    })}${parsed.suffix}`;
  }

  return `${parsed.prefix}${Math.round(value).toLocaleString()}${parsed.suffix}`;
}
