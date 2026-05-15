"use client";

import { useEffect, useState } from "react";
import { EyeIcon, HeartIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DealArticleEngagementProps = {
  articleId: string;
  initialViewCount: number;
  initialLikeCount: number;
  className?: string;
  recordView?: boolean;
  variant?: "default" | "compact";
};

export function DealArticleEngagement({
  articleId,
  initialViewCount,
  initialLikeCount,
  className,
  recordView = true,
  variant = "default",
}: DealArticleEngagementProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const recordView = async () => {
      const storageKey = `deal-article-view:${articleId}`;
      const lastRecordedAt = Number(window.sessionStorage.getItem(storageKey) ?? "0");
      const now = Date.now();

      if (now - lastRecordedAt < 3000) {
        return;
      }

      window.sessionStorage.setItem(storageKey, String(now));

      try {
        const response = await fetch(`/api/deal-articles/${articleId}/engagement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "view" }),
        });

        if (!response.ok || cancelled) {
          window.sessionStorage.removeItem(storageKey);
          return;
        }

        const payload = (await response.json()) as {
          viewCount?: number;
          likeCount?: number;
        };

        if (typeof payload.viewCount === "number") {
          setViewCount(payload.viewCount);
        }

        if (typeof payload.likeCount === "number") {
          setLikeCount(payload.likeCount);
        }
      } catch {
        window.sessionStorage.removeItem(storageKey);
      }
    };

    if (recordView) {
      void recordView();
    }

    return () => {
      cancelled = true;
    };
  }, [articleId, recordView]);

  const buttonClassName =
    variant === "compact"
      ? "inline-flex items-center gap-2 rounded-full border border-violet-300/85 bg-violet-50/90 px-3 py-1.5 text-[12px] font-medium text-violet-700 transition hover:border-violet-400 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-violet-500/35 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/16"
      : "inline-flex items-center gap-2 rounded-full border border-violet-300/85 bg-violet-50/90 px-3 py-1.5 text-[12px] font-medium text-violet-700 transition hover:border-violet-400 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-violet-500/35 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/16";

  async function handleLike() {
    if (isLiking) {
      return;
    }

    setIsLiking(true);
    setLikeCount((current) => current + 1);

    try {
      const response = await fetch(`/api/deal-articles/${articleId}/engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "like" }),
      });

      if (!response.ok) {
        setLikeCount((current) => Math.max(initialLikeCount, current - 1));
        return;
      }

      const payload = (await response.json()) as {
        viewCount?: number;
        likeCount?: number;
      };

      if (typeof payload.viewCount === "number") {
        setViewCount(payload.viewCount);
      }

      if (typeof payload.likeCount === "number") {
        setLikeCount(payload.likeCount);
      }
    } catch {
      setLikeCount((current) => Math.max(initialLikeCount, current - 1));
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <StatChip icon={EyeIcon} value={formatCompactNumber(viewCount)} label="浏览量" variant={variant} />
      <button
        type="button"
        onClick={handleLike}
        disabled={isLiking}
        className={buttonClassName}
      >
        <HeartIcon className="size-3.5" />
        <span>{formatCompactNumber(likeCount)}</span>
      </button>
    </div>
  );
}

function StatChip({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof EyeIcon;
  value: string;
  label: string;
  variant?: "default" | "compact";
}) {
  return (
    <span
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full border border-violet-300/70 bg-background/88 px-3 py-1.5 text-[12px] font-medium text-violet-700 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/8 dark:text-violet-200"
    >
      <Icon className="size-3.5" />
      <span>{value}</span>
    </span>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value);
}
