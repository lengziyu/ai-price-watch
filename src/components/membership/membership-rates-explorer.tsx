"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QuoteIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  businessCreditRows,
  membershipRateSources,
} from "@/data/membership-rates";
import { AnimeHoverCard } from "@/components/shared/anime-hover-card";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentedIndicator } from "@/components/ui/use-segmented-indicator";
import { formatDate } from "@/lib/format";
import type { SiteLocale } from "@/lib/i18n";
import {
  getLocalizedCommunityObservations,
  getLocalizedCommunitySnapshots,
  getLocalizedMembershipPlans,
  getLocalizedMembershipQuotaRows,
  getLocalizedMembershipVendorBoards,
} from "@/lib/membership-rate-localization";
import { cn } from "@/lib/utils";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";

type MembershipRatesExplorerProps = {
  defaultVendor?: string;
  defaultOpenAITab?: string;
  locale?: SiteLocale;
};

type MembershipVendorBoard = ReturnType<typeof getLocalizedMembershipVendorBoards>[number];
type PricePlan = {
  name: string;
  price?: string;
  priceLabel?: string;
  cnyEstimate?: number | null;
  audience?: string;
  summary?: string;
  detail?: string;
  note?: string;
  updatedAt?: string;
  features?: readonly string[];
};

export function MembershipRatesExplorer({
  defaultVendor = "openai",
  defaultOpenAITab = "consumer",
  locale = "zh-CN",
}: MembershipRatesExplorerProps) {
  const isEnglish = locale === "en";
  const membershipVendorBoards = getLocalizedMembershipVendorBoards(locale);
  const initialVendor = membershipVendorBoards.some(
    (item) => item.id === defaultVendor,
  )
    ? defaultVendor
    : "openai";
  const [activeVendor, setActiveVendor] = useState(initialVendor);
  const vendorTabsRef = useRef<HTMLDivElement>(null);
  const {
    stickyRef,
    stickySentinelRef,
    stickyBoundaryRef,
    isSticky,
    scrollToStickyContent,
  } = useStickyTabs("membership-rates");
  const { segmentedRef: vendorRailRef, indicatorRef: vendorIndicatorRef } =
    useSegmentedIndicator<HTMLDivElement>();

  const scrollVendorTabs = (distance: number) => {
    vendorTabsRef.current?.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  };

  const syncVendorQuery = (vendorId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    if (url.searchParams.get("vendor") === vendorId) {
      return;
    }

    url.searchParams.set("vendor", vendorId);
    window.history.replaceState(window.history.state, "", url.toString());
  };

  return (
    <section
      ref={(node) => {
        stickyBoundaryRef.current = node;
      }}
      className="app-shell mt-4 sm:mt-8"
    >
      <div className="rounded-[10px] border border-transparent bg-transparent px-0 py-0 shadow-none sm:border-border sm:bg-background sm:px-5 sm:py-5 lg:px-6">
        <AnimeReveal
          selector=":scope > *"
          stagger={80}
          className="flex flex-col gap-4 sm:gap-2"
        >
          <div className="max-w-3xl">
            <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
              vendor rate board
            </div>
            <AnimatedSectionTitle className="mt-2.5">
              {isEnglish ? "Membership Rates Overview" : "会员速率总览"}
            </AnimatedSectionTitle>
            <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground sm:text-sm">
              {isEnglish
                ? "Pricing, benefits, and quota framing are organized from official pages. Community notes are for workload feel only."
                : "按官方页面整理价格、权益和额度口径；社区观察只作为使用体感参考。"}
            </p>
          </div>

          <div ref={stickySentinelRef} className="page-tabs-sentinel" />
          <div
            ref={stickyRef}
            className={cn("page-tabs-sticky", isSticky && "is-sticky")}
          >
            <div className="page-tabs-sticky__surface p-0 sm:p-1.5">
              <div className="rate-tabs-shell">
                <button
                  type="button"
                  aria-label={isEnglish ? "Scroll vendors left" : "向左滚动厂商"}
                  onClick={() => scrollVendorTabs(-260)}
                  className="rate-tabs-arrow"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <div
                  ref={(node) => {
                    vendorTabsRef.current = node;
                    vendorRailRef.current = node;
                  }}
                  className="rate-tabs-scroll"
                >
                  <span
                    ref={vendorIndicatorRef}
                    aria-hidden="true"
                    className="segmented-indicator segmented-indicator--accent"
                  />
                  {membershipVendorBoards.map((vendor) => {
                    const active = activeVendor === vendor.id;

                    return (
                      <button
                        key={vendor.id}
                        type="button"
                        data-testid={`vendor-tab-${vendor.id}`}
                        data-segmented-active={active ? "true" : undefined}
                        onClick={() => {
                          setActiveVendor(vendor.id);
                          scrollToStickyContent();
                          syncVendorQuery(vendor.id);
                        }}
                        className={cn(
                          "rate-tab-button",
                          active ? "is-active" : "is-idle",
                        )}
                      >
                        <VendorLogo id={vendor.id} active={active} />
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-[12px] font-semibold">
                            {vendor.label}
                          </span>
                          <span className="truncate text-[10px] opacity-75">
                            {vendor.priceLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  aria-label={isEnglish ? "Scroll vendors right" : "向右滚动厂商"}
                  onClick={() => scrollVendorTabs(260)}
                  className="rate-tabs-arrow"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <AnimeReveal
            key={activeVendor}
            trigger="mount"
            selector=":scope > *"
            stagger={70}
            className="flex flex-col gap-4"
          >
            {activeVendor === "openai" ? (
              <OpenAIBoard defaultTab={defaultOpenAITab} locale={locale} />
            ) : (
              <VendorBoard
                vendor={membershipVendorBoards.find((item) => item.id === activeVendor)!}
                locale={locale}
              />
            )}
          </AnimeReveal>
        </AnimeReveal>
      </div>
    </section>
  );
}

function VendorLogo({ id, active }: { id: string; active: boolean }) {
  const logoMap: Record<string, string> = {
    openai: "/vendor-logos/openai.png",
    anthropic: "/vendor-logos/anthropic.png",
    google: "/vendor-logos/google.png",
    cursor: "/vendor-logos/cursor.png",
    github: "/vendor-logos/github.png",
    deepseek: "/vendor-logos/deepseek.png",
    grok: "/vendor-logos/grok.png",
    perplexity: "/vendor-logos/perplexity.png",
  };

  const src = logoMap[id];

  return (
    <span
      className={cn(
        "vendor-logo",
        `vendor-logo--${id}`,
        active && "is-active",
      )}
      aria-hidden="true"
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={26}
          height={26}
          className="rounded-[8px] object-contain"
        />
      ) : (
        <span className="vendor-logo__letter">{id.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}

function PricePlanCard({
  plan,
  badge,
  locale,
}: {
  plan: PricePlan;
  badge?: string;
  locale: SiteLocale;
}) {
  const isEnglish = locale === "en";
  const description = plan.summary ?? plan.detail;
  const price = plan.priceLabel ?? plan.price ?? "";
  const cnyEstimate =
    typeof plan.cnyEstimate === "number"
      ? isEnglish
        ? `Approx. ¥${plan.cnyEstimate} / mo`
        : `约 ¥${plan.cnyEstimate} / 月`
      : null;

  return (
    <AnimeHoverCard className="h-full" lift={4} scale={1.008}>
      <Card
        size="sm"
        className="membership-price-card h-full rounded-[10px] border border-border bg-card shadow-none gap-2 data-[size=sm]:gap-2.5"
      >
        <CardHeader className="gap-2 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="truncate text-[1rem]">{plan.name}</CardTitle>
            {badge ? (
              <Badge variant="secondary" className="shrink-0 rounded-[8px]">
                {badge}
              </Badge>
            ) : <span />}
          </div>
          <div className="membership-price-value-wrap px-0 py-0 text-left">
            <div className="membership-price-value text-[1.22rem] font-semibold tracking-[-0.03em] text-foreground">
              {price}
            </div>
            <div className="membership-price-sub text-[10px] text-muted-foreground">
              {cnyEstimate ?? (isEnglish ? "Official page prevails" : "以官方页面为准")}
            </div>
          </div>
          {description ? (
            <CardDescription className="membership-price-desc text-[12px] leading-5">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 pb-1">
          <PlanFeatureList features={plan.features} />
          {plan.note ? (
            <div className="membership-price-note rounded-[10px] border border-border bg-muted/35 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
              {plan.note}
            </div>
          ) : null}
          {plan.updatedAt ? (
            <div className="text-[10px] text-muted-foreground">
              {isEnglish ? "Reviewed: " : "复核时间："}
              {formatDate(plan.updatedAt, locale)}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AnimeHoverCard>
  );
}

function PlanFeatureList({ features }: { features?: readonly string[] }) {
  if (!features?.length) {
    return null;
  }

  return (
    <ul className="membership-feature-list flex flex-col gap-2 text-[12px] leading-5 text-foreground/82">
      {features.slice(0, 7).map((feature) => (
        <li key={feature} className="flex gap-2">
          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function OpenAIBoard({
  defaultTab,
  locale,
}: {
  defaultTab: string;
  locale: SiteLocale;
}) {
  const isEnglish = locale === "en";
  const membershipPlans = getLocalizedMembershipPlans(locale);
  const membershipQuotaRows = getLocalizedMembershipQuotaRows(locale);
  const communityObservations = getLocalizedCommunityObservations(locale);
  const communitySnapshots = getLocalizedCommunitySnapshots(locale);
  const [activeTab, setActiveTab] = useState(
    defaultTab === "business" ? "business" : "consumer",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {membershipPlans.map((plan) => (
          <PricePlanCard
            key={plan.id}
            plan={plan}
            badge={plan.audience}
            locale={locale}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1 text-[12px] text-primary">
        <span className="font-semibold text-primary">
          {isEnglish ? "Official Sources:" : "官方来源："}
        </span>
        <SourceLink href={membershipRateSources.officialCodexPricing} label="Codex Pricing" />
        <span className="text-primary/70">|</span>
        <SourceLink href={membershipRateSources.chatgptPricing} label="ChatGPT Pricing" />
        <span className="text-primary/70">|</span>
        <SourceLink
          href={membershipRateSources.helpArticle}
          label={isEnglish ? "Codex Help Center" : "Codex 帮助中心"}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="accent" className="w-full max-w-full sm:w-fit">
            <TabsTrigger value="consumer" className="min-w-[116px]">
              {isEnglish ? "Personal" : "个人会员"}
            </TabsTrigger>
            <TabsTrigger value="business" className="min-w-[116px]">
              {isEnglish ? "Business / Enterprise" : "Business / 企业"}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "consumer" ? (
          <AnimeReveal
            key="openai-consumer"
            trigger="mount"
            selector=":scope > *"
            stagger={70}
            className="contents"
          >
            <div className="overflow-hidden rounded-[10px] border border-border bg-card">
              <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[1rem] font-semibold">
                    {isEnglish ? "Personal Tier Matrix" : "个人会员额度"}
                  </h3>
                  <Badge variant="outline">
                    {isEnglish ? "OpenAI Official Range" : "OpenAI 官方区间"}
                  </Badge>
                  <Badge variant="secondary">
                    {isEnglish ? "Community Signal" : "社区实测体感"}
                  </Badge>
                </div>
                <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                  {isEnglish
                    ? "The official table is a range, not an exact task count. Community notes help more when judging whether heavy tasks will burn out early."
                    : "官方表格主要描述的是区间，不是单次精确次数。右侧的社区体感更适合判断重任务时会不会提前见底。"}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 sm:pl-5">
                      {isEnglish ? "Task Type" : "任务类型"}
                    </TableHead>
                    <TableHead>{isEnglish ? "Window" : "周期"}</TableHead>
                    <TableHead>Plus</TableHead>
                    <TableHead>$100</TableHead>
                    <TableHead>$200</TableHead>
                    <TableHead className="pr-4 text-left sm:pr-5">
                      {isEnglish ? "Community Signal" : "社区体感"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membershipQuotaRows.map((row) => (
                    <TableRow key={row.scope}>
                      <TableCell className="pl-4 font-medium whitespace-normal sm:pl-5">
                        {row.scope}
                      </TableCell>
                      <TableCell>{row.period}</TableCell>
                      <TableCell>{row.plus}</TableCell>
                      <TableCell>{row.pro100}</TableCell>
                      <TableCell>{row.pro200}</TableCell>
                      <TableCell className="pr-4 whitespace-normal text-muted-foreground sm:pr-5">
                        {row.community}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {communityObservations.map((item) => (
                <AnimeHoverCard key={item.title} className="h-full" lift={4} scale={1.006}>
                  <Card
                    size="sm"
                    className="h-full rounded-[10px] border border-border bg-card shadow-none"
                  >
                    <CardHeader className="gap-2 px-4 py-4">
                      <Badge variant="outline" className="w-fit">
                        {isEnglish ? "Community Note" : "社区观察"}
                      </Badge>
                      <CardTitle className="text-[0.96rem]">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                      {item.detail}
                    </CardContent>
                  </Card>
                </AnimeHoverCard>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {communitySnapshots.map((item) => (
                <AnimeHoverCard key={item.source} className="h-full" lift={4} scale={1.006}>
                  <Card
                    size="sm"
                    className="h-full rounded-[10px] border border-border bg-card shadow-none"
                  >
                    <CardHeader className="gap-3 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <QuoteIcon className="size-4" />
                        </div>
                        <div className="space-y-1.5">
                          <CardTitle className="text-[0.95rem] leading-6">{item.title}</CardTitle>
                          <CardDescription className="text-[10px]">
                            {isEnglish ? "Public sample" : "社区公开样本"} ·{" "}
                            {formatDate(item.date, locale)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 px-4 pb-4">
                      <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                        {item.takeaway}
                      </p>
                      <Link
                        href={item.source}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:text-primary"
                      >
                        {isEnglish ? "View Source Thread" : "查看原始讨论"}
                        <ArrowUpRightIcon className="size-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                </AnimeHoverCard>
              ))}
            </div>
          </AnimeReveal>
        ) : null}

        {activeTab === "business" ? (
          <AnimeReveal
            key="openai-business"
            trigger="mount"
            selector=":scope > *"
            stagger={70}
            className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]"
          >
            <Card className="rounded-[10px] border border-border bg-card shadow-none">
              <CardHeader className="gap-3 px-5 py-5">
                <CardTitle>
                  {isEnglish ? "Business / Enterprise Framing" : "Business / Enterprise 口径"}
                </CardTitle>
                <CardDescription className="text-[13px] leading-6">
                  {isEnglish
                    ? "OpenAI frames this section as credits per 1M tokens, which is more useful for team budgeting, batch workloads, and internal chargeback math."
                    : "OpenAI 官方把这部分写成 credits per 1M tokens。它更适合做团队预算、批量任务和内部计费换算。"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-5 pb-5 text-[13px] leading-6 text-muted-foreground">
                <p>
                  {isEnglish
                    ? "Business and newer Enterprise customers can scale with credits, so the framing is closer to API or team-quota budgeting than to a simple personal window."
                    : "Business 与新 Enterprise 客户可以按 credits 方式扩容，计费口径更接近 API / 团队配额思路，而不是单纯的个人会员窗口。"}
                </p>
                <p>
                  {isEnglish
                    ? "Fast mode burns credits faster. For batch work, long-context cloud tasks, or multi-model parallelism, budgeting around the midpoint of the official table is safer."
                    : "Fast mode 会更快消耗 credits。做高频批处理、长上下文云任务或多模型并行时，建议先按官方表里的中位水平估预算。"}
                </p>
                <div className="rounded-[10px] border border-border bg-background/70 px-3 py-3">
                  {isEnglish
                    ? "Use the official ChatGPT pricing page for Business seat pricing. This page prioritizes the Codex usage framing that OpenAI has made public."
                    : "Business 的座席价格请以官方 ChatGPT pricing 页面为准；本页优先收录 OpenAI 已公开写出的 Codex 使用口径。"}
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-[10px] border border-border bg-card">
              <div className="border-b border-border px-4 py-4 sm:px-5">
                <h3 className="text-[1rem] font-semibold">Business credits per 1M tokens</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 sm:pl-5">
                      {isEnglish ? "Model" : "模型"}
                    </TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead>Cached input</TableHead>
                    <TableHead className="pr-4 sm:pr-5">Output</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessCreditRows.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="pl-4 font-medium sm:pl-5">{row.model}</TableCell>
                      <TableCell>{row.input}</TableCell>
                      <TableCell>{row.cachedInput}</TableCell>
                      <TableCell className="pr-4 sm:pr-5">{row.output}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AnimeReveal>
        ) : null}
      </div>
    </div>
  );
}

function VendorBoard({
  vendor,
  locale,
}: {
  vendor: MembershipVendorBoard;
  locale: SiteLocale;
}) {
  const isEnglish = locale === "en";
  const quotaRows = "quotaRows" in vendor ? vendor.quotaRows : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {vendor.plans.map((plan) => (
          <PricePlanCard
            key={`${vendor.id}-${plan.name}`}
            plan={plan}
            badge={vendor.label}
            locale={locale}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1 text-[12px] text-primary">
        <span className="font-semibold text-primary">
          {isEnglish ? "Official Source:" : "官方来源："}
        </span>
        <SourceLink
          href={vendor.officialSource}
          label={isEnglish ? `${vendor.label} Official Page` : `${vendor.label} 官方页面`}
        />
      </div>

      {quotaRows?.length ? (
        <div className="overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[1rem] font-semibold">
                {vendor.label} {isEnglish ? "Tier Matrix" : "额度矩阵"}
              </h3>
              <Badge variant="outline">
                {isEnglish ? "Official Framing + Community Signal" : "官方口径 + 社区体感"}
              </Badge>
            </div>
            <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
              {isEnglish
                ? "Built from public docs first. When exact counts are not public, tier descriptions and community signal fill the gap."
                : "按公开文档整理关键口径；无法公开精确次数的厂商用等级和社区体感补充。"}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 sm:pl-5">
                  {isEnglish ? "Dimension" : "任务类型"}
                </TableHead>
                <TableHead>{isEnglish ? "Window" : "周期"}</TableHead>
                <TableHead>{isEnglish ? "Entry" : "入门档"}</TableHead>
                <TableHead>{isEnglish ? "Mid" : "中档"}</TableHead>
                <TableHead>{isEnglish ? "High" : "高档"}</TableHead>
                <TableHead className="pr-4 text-left sm:pr-5">
                  {isEnglish ? "Community Signal" : "社区体感"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotaRows.map((row) => (
                <TableRow key={`${vendor.id}-${row.scope}`}>
                  <TableCell className="pl-4 font-medium whitespace-normal sm:pl-5">
                    {row.scope}
                  </TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>{row.low}</TableCell>
                  <TableCell>{row.mid}</TableCell>
                  <TableCell>{row.high}</TableCell>
                  <TableCell className="pr-4 whitespace-normal text-muted-foreground sm:pr-5">
                    {row.community}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-3">
        {vendor.communityNotes.map((item) => (
          <AnimeHoverCard
            key={`${vendor.id}-community-${item}`}
            className="h-full"
            lift={4}
            scale={1.006}
          >
            <Card
              size="sm"
              className="h-full rounded-[10px] border border-border bg-card shadow-none"
            >
              <CardHeader className="gap-2 px-4 py-4">
                <Badge variant="outline" className="w-fit">
                  {isEnglish ? "Community Note" : "社区观察"}
                </Badge>
                <CardDescription className="text-[12px] leading-6 sm:text-[13px]">
                  {item}
                </CardDescription>
              </CardHeader>
            </Card>
          </AnimeHoverCard>
        ))}
      </div>
    </div>
  );
}

function SourceLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80",
        className,
      )}
    >
      {label}
      <ArrowUpRightIcon className="size-3.5" />
    </Link>
  );
}
