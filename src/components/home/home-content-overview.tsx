import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CompassIcon,
  CrownIcon,
  GiftIcon,
  Layers3Icon,
} from "lucide-react";

import { DealArticleEngagement } from "@/components/deals/deal-article-engagement";
import { InteractiveSummaryCard } from "@/components/home/interactive-summary-card";
import { AnimeHoverCard } from "@/components/shared/anime-hover-card";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { Badge } from "@/components/ui/badge";
import { membershipVendorBoards } from "@/data/membership-rates";
import { toolsDirectory } from "@/data/tools";
import { useCases } from "@/data/use-cases";
import { formatDate, formatDateTime, formatDealArticleStatus } from "@/lib/format";
import type { DealArticle } from "@/types";

type HomeContentOverviewProps = {
  articles: DealArticle[];
};

const featuredVendorIds = ["openai", "anthropic", "google", "cursor"] as const;
export function HomeContentOverview({ articles }: HomeContentOverviewProps) {
  const featuredVendors = membershipVendorBoards.filter((item) =>
    featuredVendorIds.includes(item.id as (typeof featuredVendorIds)[number]),
  );
  const latestArticles = articles.slice(0, 3);
  const latestArticle = latestArticles[0];
  const totalTagCount = new Set(articles.flatMap((item) => item.tags)).size;

  const summaryCards = [
    {
      label: "会员厂商",
      value: String(membershipVendorBoards.length),
      detail: "价格、额度、社区观察",
      iconKey: "vendors" as const,
    },
    {
      label: "使用场景",
      value: String(useCases.length),
      detail: "开发、办公、研究、自动化",
      iconKey: "useCases" as const,
    },
    {
      label: "优惠文章",
      value: String(articles.length),
      detail: latestArticle
        ? `最近更新 ${formatDate(latestArticle.publishedAt)}`
        : "持续更新中",
      iconKey: "articles" as const,
    },
    {
      label: "工具导航",
      value: String(toolsDirectory.length),
      detail: `${totalTagCount} 个标签关键词`,
      iconKey: "tools" as const,
    },
  ];

  return (
    <>
      <section className="app-shell mt-4 sm:mt-8">
        <AnimeReveal
          selector=":scope > *"
          stagger={80}
          className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        >
          {summaryCards.map((item) => (
            <InteractiveSummaryCard
              key={item.label}
              label={item.label}
              value={item.value}
              detail={item.detail}
              iconKey={item.iconKey}
            />
          ))}
        </AnimeReveal>
      </section>

      <section className="app-shell mt-4 sm:mt-8">
        <AnimeReveal className="rounded-[6px] border border-transparent bg-transparent p-0 shadow-none sm:border-border/80 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,252,249,0.96))] sm:p-6 sm:shadow-[0_20px_54px_rgba(15,23,42,0.05)] dark:sm:bg-[linear-gradient(180deg,rgba(8,14,18,0.98),rgba(9,17,20,0.95))]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-[11px] font-medium text-primary dark:border-primary/24 dark:bg-primary/14">
                热门入口
              </div>
              <h2 className="mt-3 text-[1.55rem] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-[2rem]">
                先从热门会员和最新活动入手，再继续挑适合你的工具
              </h2>
              <p className="mt-3 max-w-[64ch] text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
                先用首页完成第一轮筛选：看热门会员厂商、查看最新优惠文章，再按使用场景或工具类型继续深入。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <FeatureIntroTile
                icon={<CrownIcon className="size-4" />}
                title="会员速率"
                detail="先看额度、官方价格和社区体感，再决定值不值得深挖。"
                href="/membership-rates"
                hrefLabel="看速率"
              />
              <FeatureIntroTile
                icon={<CompassIcon className="size-4" />}
                title="场景速配"
                detail="按编码、写作、研究这类真实任务反推工具和订阅组合。"
                href="/use-cases"
                hrefLabel="看场景"
              />
              <FeatureIntroTile
                icon={<Layers3Icon className="size-4" />}
                title="工具入口"
                detail="整理常用 AI 工具的定位、定价方式和官方入口，方便快速判断先看哪一类。"
                href="/tools"
                hrefLabel="看工具"
                className="col-span-2 sm:col-span-1"
                hideOnMobile
              />
            </div>
          </div>
        </AnimeReveal>
      </section>

      <section className="app-shell mt-4 sm:mt-8">
        <Panel
          icon={<CrownIcon className="size-4" />}
          title="会员厂商速览"
          href="/membership-rates"
          hrefLabel="全部厂商"
          description="首页先保留最常看的四个会员厂商，快速扫一眼月费、层级差异和体感说明。"
        >
          <AnimeReveal
            selector=":scope > *"
            stagger={70}
            className="grid grid-cols-2 gap-3 xl:grid-cols-4"
          >
            {featuredVendors.map((vendor) => (
              <AnimeHoverCard key={vendor.id} className="group h-full">
                <Link
                  href={`/membership-rates?vendor=${vendor.id}`}
                  className="block h-full rounded-[6px] border border-border/75 bg-background/84 px-4 py-4 transition-[border-color,box-shadow] group-hover:border-primary/28 group-hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <BrandLogo name={vendor.id} />
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                          {vendor.label}
                        </div>
                        <div className="truncate text-[12px] text-muted-foreground">
                          {vendor.priceLabel}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                    {vendor.plans[0]?.detail ?? vendor.officialRate}
                  </p>
                  <div className="mt-3 rounded-[6px] border border-border/70 bg-background/88 px-3 py-2 text-[11px] text-foreground/78">
                    <p className="line-clamp-2 leading-5">
                      {vendor.plans[1]?.name ?? "次级层级"} · {vendor.plans[1]?.detail ?? vendor.communityRate}
                    </p>
                  </div>
                </Link>
              </AnimeHoverCard>
            ))}
          </AnimeReveal>
        </Panel>
      </section>

      <section className="app-shell mt-4 sm:mt-8">
        <Panel
          icon={<GiftIcon className="size-4" />}
          title="最新优惠文章"
          href="/deals#deal-articles"
          hrefLabel="全部文章"
          description="这里展示最近更新的 3 篇 AI 优惠文章，方便快速浏览和进入详情。"
        >
          {latestArticles.length ? (
            <AnimeReveal
              selector=":scope > *"
              stagger={90}
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
            >
              {latestArticles.map((article) => (
                <AnimeHoverCard
                  key={article.id}
                  className="group h-full min-w-0 w-full"
                  lift={5}
                  scale={1.012}
                >
                  <article className="relative h-full w-full min-w-0 overflow-hidden rounded-[6px] border border-border/85 bg-white/82 shadow-[0_8px_18px_rgba(25,42,74,0.08)] backdrop-blur-md transition-[box-shadow,border-color] duration-200 group-hover:border-primary/28 group-hover:shadow-[0_16px_26px_color-mix(in_srgb,var(--primary)_18%,transparent)] dark:border-white/12 dark:bg-[rgba(17,27,44,0.82)] dark:group-hover:border-primary/34">
                    <Link
                      href={`/deals/articles/${article.slug}`}
                      aria-label={`查看文章：${article.title}`}
                      className="absolute inset-0 z-10 rounded-[6px]"
                    />
                    <div className="pointer-events-none relative z-20">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[6px] border-b border-border/70">
                        <Image
                          src={article.coverImageUrl}
                          alt={`${article.title} 封面图`}
                          fill
                          className="scale-[1.02] object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(22,18,18,0.06),rgba(56,34,24,0.12)_42%,rgba(22,14,12,0.44)_100%)]" />
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <Badge className={dealStatusClass(article.status)}>
                            {formatDealArticleStatus(article.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="px-4 pb-2.5 pt-2">
                        <div className="min-w-0 transition-transform duration-200 group-hover:-translate-y-1">
                          <div className="truncate py-[10px] text-[18px] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[20px]">
                            {article.title}
                          </div>
                          <p className="mt-1 line-clamp-2 h-[3rem] overflow-hidden break-words text-[12px] leading-6 text-foreground/72 sm:text-[13px]">
                            {article.summary}
                          </p>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={`${tag}-${index}`}
                              className="h-auto rounded-full border-primary/28 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary shadow-sm dark:border-primary/32 dark:bg-primary/16 dark:text-primary"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-border/70 pt-3">
                          <span className="inline-flex min-h-8 items-center text-[12px] text-muted-foreground">
                            {formatDateTime(article.publishedAt)}
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
                      </div>
                    </div>
                  </article>
                </AnimeHoverCard>
              ))}
            </AnimeReveal>
          ) : (
            <div className="rounded-[16px] border border-dashed border-border px-4 py-5 text-[13px] text-muted-foreground">
              当前还没有发布文章，有新内容时会自动显示在这里。
            </div>
          )}
        </Panel>
      </section>
    </>
  );
}

function Panel({
  icon,
  title,
  href,
  hrefLabel,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  hrefLabel: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-[6px] border border-transparent bg-transparent p-0 shadow-none sm:border-border/80 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,251,255,0.96))] sm:p-5 sm:shadow-[0_22px_60px_rgba(15,23,42,0.05)] dark:sm:bg-[linear-gradient(180deg,rgba(8,14,18,0.98),rgba(12,18,28,0.94))]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/75 bg-background/88 text-primary">
              {icon}
            </span>
            <div className="text-[17px] font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </div>
          </div>
          {description ? (
            <p className="mt-2 max-w-[68ch] text-[12px] leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-primary transition hover:text-primary/80"
        >
          {hrefLabel}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>

      <div>{children}</div>
    </div>
  );
}

function FeatureIntroTile({
  icon,
  title,
  detail,
  href,
  hrefLabel,
  className,
  hideOnMobile = false,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  href: string;
  hrefLabel: string;
  className?: string;
  hideOnMobile?: boolean;
}) {
  return (
    <AnimeHoverCard
      className={[
        "group h-full min-w-0",
        hideOnMobile ? "hidden sm:block" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      lift={4}
      scale={1.01}
    >
      <div className="flex h-full flex-col rounded-[6px] border border-border/75 bg-background/82 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] group-hover:border-primary/24 group-hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)] dark:bg-background/60">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-primary/16 bg-primary/8 text-primary dark:border-primary/24 dark:bg-primary/14">
          {icon}
        </div>
        <div className="mt-3 text-[14px] font-semibold tracking-[-0.03em] text-foreground">{title}</div>
        <p className="mt-1.5 min-h-[3.75rem] text-[12px] leading-5 text-muted-foreground">{detail}</p>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1 pt-3 text-[12px] font-medium text-primary transition hover:text-primary/80"
        >
          {hrefLabel}
          <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </AnimeHoverCard>
  );
}

function BrandLogo({ name, compact = false }: { name: string; compact?: boolean }) {
  const src = getLogoPath(name);
  const size = compact ? 18 : 24;
  const shell = compact ? "h-9 w-9 rounded-[6px]" : "h-10 w-10 rounded-[6px]";

  return (
    <span
      className={`inline-flex ${shell} items-center justify-center overflow-hidden border border-border/75 bg-background/92`}
    >
      {src ? (
        <Image src={src} alt="" width={size} height={size} className="object-contain" />
      ) : (
        <span className="text-[12px] font-semibold text-foreground">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function getLogoPath(name: string) {
  const key = name.toLowerCase();

  if (key.includes("openai") || key.includes("chatgpt")) return "/vendor-logos/openai.png";
  if (key.includes("claude") || key.includes("anthropic")) return "/vendor-logos/anthropic.png";
  if (key.includes("gemini") || key.includes("google") || key.includes("notebooklm")) return "/vendor-logos/google.png";
  if (key.includes("cursor")) return "/vendor-logos/cursor.png";
  if (key.includes("github") || key.includes("copilot")) return "/vendor-logos/github.png";
  if (key.includes("perplexity")) return "/vendor-logos/perplexity.png";
  if (key.includes("grok")) return "/vendor-logos/grok.png";
  if (key.includes("deepseek")) return "/vendor-logos/deepseek.png";

  return null;
}

function dealStatusClass(status: DealArticle["status"]) {
  return {
    not_started:
      "rounded-full border border-slate-200/90 bg-slate-100/95 px-2.5 py-0.5 text-[11px] text-slate-700 dark:border-slate-500/28 dark:bg-slate-500/18 dark:text-slate-200",
    in_progress:
      "rounded-full border border-emerald-200/90 bg-emerald-100/95 px-2.5 py-0.5 text-[11px] text-emerald-700 dark:border-emerald-500/28 dark:bg-emerald-500/18 dark:text-emerald-200",
    ended:
      "rounded-full border border-rose-200/90 bg-rose-100/95 px-2.5 py-0.5 text-[11px] text-rose-700 dark:border-rose-500/28 dark:bg-rose-500/18 dark:text-rose-200",
  }[status];
}
