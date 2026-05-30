"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { DealArticleEngagement } from "@/components/deals/deal-article-engagement";
import { AnimeHoverCard } from "@/components/shared/anime-hover-card";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { getDealArticleSlugForLocale } from "@/lib/deal-article-localization";
import {
  formatDealArticleDifficulty,
  formatDealArticleStatus,
  getDealArticleStatusCounts,
} from "@/lib/deal-articles";
import { formatDateTime } from "@/lib/format";
import { addLocalePrefix, defaultLocale, type SiteLocale } from "@/lib/i18n";
import { getUICopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import type { DealArticle, DealArticleStatus } from "@/types";

type DealArticlesSectionProps = {
  articles: DealArticle[];
  locale?: SiteLocale;
};

export function DealArticlesSection({
  articles,
  locale = defaultLocale,
}: DealArticlesSectionProps) {
  const uiCopy = getUICopy(locale);
  const statusCounts = getDealArticleStatusCounts(articles);
  const topTags = getTopTags(articles, 6);
  const [activeStatus, setActiveStatus] = useState<"all" | DealArticleStatus>("all");
  const [activeTag, setActiveTag] = useState<"all" | string>("all");

  const filteredArticles = articles.filter((article) => {
    const matchesStatus = activeStatus === "all" || article.status === activeStatus;
    const matchesTag = activeTag === "all" || article.tags.includes(activeTag);

    return matchesStatus && matchesTag;
  });

  return (
    <section
      id="deal-articles"
      className="app-shell flex flex-col gap-3"
    >
      <Card
        size="sm"
        className="overflow-hidden rounded-[16px] border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,255,251,0.96)_42%,rgba(240,249,255,0.98))] shadow-[0_16px_38px_rgba(14,24,40,0.045)] dark:bg-[linear-gradient(135deg,rgba(9,14,16,0.96),rgba(8,20,18,0.92)_48%,rgba(10,18,28,0.96))]"
      >
        <CardHeader className="gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <InlineFilterGroup
                  label={uiCopy.dealArticlesSection.filterStatus}
                  options={[
                    { value: "all", label: uiCopy.dealArticlesSection.all, tone: "all" },
                    { value: "not_started", label: uiCopy.dealArticlesSection.notStarted, tone: "not_started" },
                    { value: "in_progress", label: uiCopy.dealArticlesSection.inProgress, tone: "in_progress" },
                    { value: "ended", label: uiCopy.dealArticlesSection.ended, tone: "ended" },
                  ]}
                  activeValue={activeStatus}
                  onChange={(value) => setActiveStatus(value as "all" | DealArticleStatus)}
                />

                {topTags.length > 0 ? (
                  <InlineFilterGroup
                    label={uiCopy.dealArticlesSection.filterTag}
                    options={[
                      { value: "all", label: uiCopy.dealArticlesSection.all, tone: "all" },
                      ...topTags.map((tag) => ({ value: tag, label: tag, tone: "tag" as const })),
                    ]}
                    activeValue={activeTag}
                    onChange={(value) => setActiveTag(value)}
                  />
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 self-start xl:self-center">
              <HeaderStat label={uiCopy.dealArticlesSection.statTotal} value={String(statusCounts.total)} />
              <HeaderStat label={uiCopy.dealArticlesSection.statInProgress} value={String(statusCounts.inProgress)} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredArticles.length ? (
        <AnimeReveal
          selector=":scope > *"
          stagger={90}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredArticles.map((article) => {
            return (
              <AnimeHoverCard key={article.id} className="group/card h-full" lift={5} scale={1.012}>
                <SpotlightCard className="h-full rounded-[6px]" contentClassName="rounded-[6px]">
                  <Card
                    size="sm"
                    className="relative h-full !gap-0 rounded-[6px] border border-black/10 bg-transparent !py-0 shadow-[0_8px_18px_rgba(25,42,74,0.08)] transition-[box-shadow,border-color] duration-200 group-hover/card:border-primary/20 group-hover/card:shadow-[0_16px_28px_color-mix(in_srgb,var(--primary)_18%,transparent)] dark:border-white/10 dark:group-hover/card:border-primary/30"
                  >
                    <Link
                      href={addLocalePrefix(
                        `/deals/articles/${getDealArticleSlugForLocale(article, locale)}`,
                        locale,
                      )}
                      aria-label={`${uiCopy.dealArticlesSection.previewAriaPrefix}${article.title}`}
                      className="absolute inset-0 z-10 rounded-[6px]"
                    />
                    <div className="pointer-events-none relative z-20">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[6px] border-b border-border/70">
                        <Image
                          src={article.coverImageUrl}
                          alt={`${article.title} 封面图`}
                          fill
                          className="scale-[1.02] object-cover transition-transform duration-300 group-hover/card:scale-[1.06]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,18,0.06),rgba(56,34,24,0.12)_42%,rgba(22,14,12,0.44)_100%)]" />
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <Badge className={cn("h-auto rounded-full px-3 py-1 text-[12px] font-semibold shadow-sm", statusToneClass(article.status))}>
                            {formatDealArticleStatus(article.status, locale)}
                          </Badge>
                        </div>
                        <div className="absolute right-3 top-3">
                          <Badge
                            variant="outline"
                            className="rounded-full border-white/40 bg-background/88 px-3 py-1 text-[11px] shadow-sm backdrop-blur-sm"
                          >
                            {formatDealArticleDifficulty(article.difficulty, locale)}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="gap-1 px-4 pb-1 pt-2">
                        <div className="min-w-0 w-full transition-transform duration-200 group-hover/card:-translate-y-1">
                          <div className="block w-full truncate overflow-hidden whitespace-nowrap py-[10px] text-[20px] font-semibold leading-tight tracking-[-0.03em] text-foreground">
                            {article.title}
                          </div>
                          <CardDescription
                            className={cn(
                              "mt-1 line-clamp-2 h-[3rem] overflow-hidden text-[12px] leading-6 text-foreground/72 sm:text-[13px]",
                            )}
                          >
                            {buildCompactSummary(article.summary)}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2.5 px-4 pb-2.5">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 4).map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              className={cn("h-auto rounded-full px-3 py-1 text-[11px] font-medium shadow-sm", tagToneClass())}
                            >
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length === 0 ? (
                            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                              {uiCopy.dealArticlesSection.pendingTag}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border/70 pt-3">
                          <span className="inline-flex min-h-8 items-center text-[12px] text-muted-foreground">
                            {formatDateTime(article.publishedAt, locale)}
                          </span>
                          <DealArticleEngagement
                            articleId={article.id}
                            initialViewCount={article.viewCount}
                            initialLikeCount={article.likeCount}
                            recordView={false}
                            variant="compact"
                            className="pointer-events-auto relative z-30 justify-end"
                          />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </SpotlightCard>
              </AnimeHoverCard>
            );
          })}
        </AnimeReveal>
      ) : (
        <Card size="sm" className="rounded-[12px] border border-border bg-card">
          <CardContent className="px-4 py-4 text-[13px] text-muted-foreground">
            {uiCopy.dealArticlesSection.emptyTip}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function tagToneClass() {
  return "border-primary/28 bg-primary/10 text-primary dark:border-primary/32 dark:bg-primary/16 dark:text-primary";
}

function statusToneClass(status: DealArticle["status"]) {
  return {
    not_started:
      "bg-slate-950/72 text-white backdrop-blur-sm dark:bg-slate-950/70 dark:text-white",
    in_progress:
      "bg-emerald-500/88 text-white backdrop-blur-sm dark:bg-emerald-500/78 dark:text-white",
    ended:
      "bg-rose-500/88 text-white backdrop-blur-sm dark:bg-rose-500/78 dark:text-white",
  }[status];
}

function InlineFilterGroup({
  label,
  options,
  activeValue,
  onChange,
}: {
  label: string;
  options: Array<{
    value: string;
    label: string;
    tone?: "all" | "tag" | "not_started" | "in_progress" | "ended";
  }>;
  activeValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="shrink-0 text-[12px] font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = activeValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-medium tracking-[-0.01em] transition-all duration-200",
                isActive
                  ? activeFilterToneClass(option.tone)
                  : "border-border/85 bg-background/92 text-muted-foreground hover:border-primary/24 hover:bg-primary/6 hover:text-foreground dark:bg-background/60",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function activeFilterToneClass(tone?: "all" | "tag" | "not_started" | "in_progress" | "ended") {
  if (tone === "not_started") {
    return "border-slate-300/90 bg-slate-100/95 text-slate-700 shadow-[0_8px_20px_rgba(100,116,139,0.16)] dark:border-slate-500/42 dark:bg-slate-500/20 dark:text-slate-200";
  }

  if (tone === "in_progress") {
    return "border-emerald-300/90 bg-emerald-100/95 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.16)] dark:border-emerald-500/42 dark:bg-emerald-500/20 dark:text-emerald-200";
  }

  if (tone === "ended") {
    return "border-rose-300/90 bg-rose-100/95 text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.16)] dark:border-rose-500/42 dark:bg-rose-500/18 dark:text-rose-200";
  }

  if (tone === "tag") {
    return "border-primary/32 bg-primary/14 text-primary shadow-[0_8px_20px_rgba(16,185,129,0.16)] dark:border-primary/38 dark:bg-primary/20 dark:text-primary";
  }

  return "border-primary/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.92))] text-primary shadow-[0_10px_28px_rgba(16,185,129,0.12)] dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(10,14,16,0.92))]";
}

function HeaderStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex min-w-[86px] items-center gap-1.5 rounded-full border border-primary/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.58))] px-3 py-1.5 shadow-[0_8px_18px_rgba(16,24,40,0.05)] backdrop-blur-md dark:border-primary/18 dark:bg-[linear-gradient(135deg,rgba(20,27,38,0.74),rgba(20,27,38,0.52))]">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-[1rem] font-semibold leading-none tracking-[-0.04em] text-primary">
        {value}
      </span>
    </div>
  );
}

function getTopTags(articles: DealArticle[], limit: number) {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0], "zh-CN");
    })
    .slice(0, limit)
    .map(([tag]) => tag);
}

function buildCompactSummary(summary: string) {
  const text = summary.replace(/\s+/g, " ").trim();
  if (text.length <= 76) {
    return text;
  }

  return `${text.slice(0, 76).trim()}...`;
}
