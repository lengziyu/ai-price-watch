import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CompassIcon,
  CrownIcon,
  FileTextIcon,
  GiftIcon,
  Layers3Icon,
  LibraryBigIcon,
  SparklesIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { membershipRatesUpdatedAt, membershipVendorBoards } from "@/data/membership-rates";
import { toolsDirectory } from "@/data/tools";
import { useCases } from "@/data/use-cases";
import {
  formatCostBand,
  formatDate,
  formatDateTime,
  formatDealArticleStatus,
  formatDifficulty,
} from "@/lib/format";
import type { DealArticle } from "@/types";

type HomeContentOverviewProps = {
  articles: DealArticle[];
};

const featuredVendorIds = ["openai", "anthropic", "google", "cursor"] as const;
const featuredUseCaseIds = [
  "coding",
  "writing",
  "deep-research",
  "office-automation",
] as const;
const featuredToolIds = [
  "chatgpt",
  "claude",
  "cursor",
  "github-copilot",
  "gemini",
  "perplexity",
] as const;

export function HomeContentOverview({ articles }: HomeContentOverviewProps) {
  const featuredVendors = membershipVendorBoards.filter((item) =>
    featuredVendorIds.includes(item.id as (typeof featuredVendorIds)[number]),
  );
  const featuredUseCases = featuredUseCaseIds
    .map((id) => useCases.find((item) => item.id === id))
    .filter((item): item is (typeof useCases)[number] => Boolean(item));
  const featuredTools = featuredToolIds
    .map((id) => toolsDirectory.find((item) => item.id === id))
    .filter((item): item is (typeof toolsDirectory)[number] => Boolean(item));
  const latestArticles = articles.slice(0, 3);
  const latestArticle = latestArticles[0];
  const totalTagCount = new Set(articles.flatMap((item) => item.tags)).size;

  const summaryCards = [
    {
      label: "会员厂商",
      value: String(membershipVendorBoards.length),
      detail: "价格、额度、社区观察",
      icon: <CrownIcon className="size-4" />,
    },
    {
      label: "使用场景",
      value: String(useCases.length),
      detail: "开发、办公、研究、自动化",
      icon: <SparklesIcon className="size-4" />,
    },
    {
      label: "优惠文章",
      value: String(articles.length),
      detail: latestArticle ? `最近更新 ${formatDateTime(latestArticle.publishedAt)}` : "后台可持续补录",
      icon: <FileTextIcon className="size-4" />,
    },
    {
      label: "工具导航",
      value: String(toolsDirectory.length),
      detail: `${totalTagCount} 个标签关键词`,
      icon: <LibraryBigIcon className="size-4" />,
    },
  ];

  return (
    <>
      <section className="app-shell mt-4 sm:mt-8">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,252,250,0.96))] px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] dark:bg-[linear-gradient(180deg,rgba(8,14,18,0.96),rgba(10,20,24,0.92))]"
            >
              <div className="text-[12px] font-medium text-muted-foreground">{item.label}</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-[1.72rem] font-semibold tracking-[-0.05em] text-foreground">
                  {item.value}
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-border/75 bg-background/88 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  {item.icon}
                </span>
              </div>
              <div className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-shell mt-4 sm:mt-8">
        <div className="grid items-stretch gap-4 xl:grid-cols-2">
          <Panel
            icon={<CrownIcon className="size-4" />}
            title="会员速率重点"
            href="/membership-rates"
            hrefLabel="全部厂商"
            className="xl:h-full xl:self-auto"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/membership-rates?vendor=${vendor.id}`}
                  className="group rounded-[16px] border border-border/75 bg-background/84 px-4 py-4 transition hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
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
                  <div className="mt-3 rounded-[12px] border border-border/70 bg-background/88 px-3 py-2 text-[11px] text-foreground/78">
                    <p className="line-clamp-2 leading-5">
                      {vendor.plans[1]?.name ?? "次级层级"} ·{" "}
                      {vendor.plans[1]?.detail ?? vendor.communityRate}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel
            icon={<CompassIcon className="size-4" />}
            title="场景速配"
            href="/use-cases"
            hrefLabel="全部场景"
            className="xl:h-full xl:self-auto"
          >
            <div className="grid h-full auto-rows-fr gap-3 sm:grid-cols-2">
              {featuredUseCases.map((item) => (
                <Link
                  key={item.id}
                  href={item.ctaHref}
                  className="group flex h-full flex-col rounded-[16px] border border-border/75 bg-background/84 px-4 py-4 transition hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                >
                  <div className="text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                    {item.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-primary/16 bg-primary/8 px-2.5 py-0.5 text-[11px] text-primary">
                      {formatDifficulty(item.difficulty)}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-sky-200/80 bg-sky-50/90 px-2.5 py-0.5 text-[11px] text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200">
                      {formatCostBand(item.estimatedCost)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.recommendedTools.slice(0, 2).map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center gap-1 rounded-full border border-border/75 bg-background/92 px-2.5 py-1 text-[11px] text-foreground/82"
                      >
                        <ToolLogo name={tool} />
                        {tool}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-2 text-[11px] text-muted-foreground/85">
                    更新：{formatDate(membershipRatesUpdatedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel
            icon={<GiftIcon className="size-4" />}
            title="最新优惠文章"
            href="/deals#deal-articles"
            hrefLabel="全部文章"
            className="xl:h-full xl:self-auto"
          >
            {latestArticles.length ? (
              <div className="grid gap-3">
                {latestArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/deals/articles/${article.slug}`}
                    className={[
                      "group rounded-[16px] border border-border/75 bg-background/84 p-3.5 transition hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)]",
                      index === 0 ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(242,255,248,0.94))] dark:bg-[linear-gradient(135deg,rgba(9,20,16,0.92),rgba(13,16,24,0.92))]" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-[88px] w-[118px] shrink-0 overflow-hidden rounded-[12px] border border-border/70">
                        <Image
                          src={article.coverImageUrl}
                          alt={`${article.title} 封面图`}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.04]"
                          sizes="118px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={dealStatusClass(article.status)}>
                            {formatDealArticleStatus(article.status)}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(article.publishedAt)}
                          </span>
                        </div>
                        <div className={`mt-2 font-semibold tracking-[-0.03em] text-foreground ${index === 0 ? "line-clamp-2 text-[17px] leading-6" : "line-clamp-2 text-[14px] leading-[1.38]"}`}>
                          {article.title}
                        </div>
                        <p className={`mt-1 text-[12px] leading-5 text-muted-foreground ${index === 0 ? "line-clamp-2" : "line-clamp-2"}`}>
                          {article.summary}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-border px-4 py-5 text-[13px] text-muted-foreground">
                当前还没有发布文章，后续后台新增后会自动在这里汇总展示。
              </div>
            )}
          </Panel>

          <Panel
            icon={<Layers3Icon className="size-4" />}
            title="工具入口精选"
            href="/tools"
            hrefLabel="全部工具"
            className="xl:h-full xl:self-auto"
          >
            <div className="grid h-full auto-rows-fr gap-3 sm:grid-cols-2">
              {featuredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href="/tools"
                  className="group flex h-full flex-col rounded-[16px] border border-border/75 bg-background/84 px-4 py-4 transition hover:-translate-y-[2px] hover:border-primary/28 hover:shadow-[0_18px_34px_color-mix(in_srgb,var(--primary)_12%,transparent)]"
                >
                  <div className="flex items-center gap-3">
                    <BrandLogo name={tool.name} compact />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold tracking-[-0.03em] text-foreground">
                        {tool.name}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {tool.pricing}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                    {tool.summary}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}

function Panel({
  icon,
  title,
  href,
  hrefLabel,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  hrefLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex h-fit self-start flex-col rounded-[20px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,251,255,0.96))] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.05)] dark:bg-[linear-gradient(180deg,rgba(8,14,18,0.98),rgba(12,18,28,0.94))]",
        className ?? "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/75 bg-background/88 text-primary">
            {icon}
          </span>
          <div className="text-[17px] font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary transition hover:text-primary/80"
        >
          {hrefLabel}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function BrandLogo({ name, compact = false }: { name: string; compact?: boolean }) {
  const src = getLogoPath(name);
  const size = compact ? 18 : 24;
  const shell = compact ? "h-9 w-9 rounded-[10px]" : "h-10 w-10 rounded-[12px]";

  return (
    <span className={`inline-flex ${shell} items-center justify-center overflow-hidden border border-border/75 bg-background/92`}>
      {src ? (
        <Image src={src} alt="" width={size} height={size} className="object-contain" />
      ) : (
        <span className="text-[12px] font-semibold text-foreground">{name.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}

function ToolLogo({ name }: { name: string }) {
  const src = getLogoPath(name);

  return (
    <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-[4px] border border-border/70 bg-background/92">
      {src ? (
        <Image src={src} alt="" width={12} height={12} className="object-contain" />
      ) : null}
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
