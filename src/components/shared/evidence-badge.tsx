import Link from "next/link";
import { ArrowUpRightIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";

import type { EvidenceSummary } from "@/lib/evidence";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function EvidenceBadgeGroup({
  summary,
  sourceUrl,
  compact = false,
}: {
  summary: EvidenceSummary;
  sourceUrl?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant={summary.tone === "good" ? "secondary" : "outline"}
        className={cn(
          summary.tone === "danger" && "border-destructive/25 bg-destructive/8 text-destructive",
          summary.tone === "review" && "border-amber-400/25 bg-amber-400/10 text-amber-700 dark:text-amber-200",
        )}
      >
        {summary.tone === "good" ? (
          <ShieldCheckIcon data-icon="inline-start" />
        ) : (
          <TriangleAlertIcon data-icon="inline-start" />
        )}
        {summary.confidenceLabel}
      </Badge>
      <Badge variant="outline">{summary.sourceLabel}</Badge>
      {!compact ? <Badge variant="outline">可信度 {summary.scoreLabel}</Badge> : null}
      {summary.reviewedAt && !compact ? (
        <Badge variant="outline">复核 {formatDate(summary.reviewedAt)}</Badge>
      ) : null}
      {sourceUrl ? (
        <Link
          href={sourceUrl}
          target="_blank"
          className="inline-flex h-6 items-center gap-1 rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
        >
          来源
          <ArrowUpRightIcon className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

export function EvidenceMiniPanel({
  summary,
  sourceUrl,
}: {
  summary: EvidenceSummary;
  sourceUrl?: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-background/72 px-3 py-2.5">
      <EvidenceBadgeGroup summary={summary} sourceUrl={sourceUrl} />
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/8">
        <div
          className={cn(
            "h-full rounded-full",
            summary.tone === "good" && "bg-primary",
            summary.tone === "review" && "bg-amber-400",
            summary.tone === "danger" && "bg-destructive",
            summary.tone === "muted" && "bg-muted-foreground/45",
          )}
          style={{ width: `${summary.score}%` }}
        />
      </div>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{summary.note}</p>
    </div>
  );
}
