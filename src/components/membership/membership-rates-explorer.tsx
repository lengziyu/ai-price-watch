"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowUpRightIcon,
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
  communityObservations,
  communitySnapshots,
  membershipPlans,
  membershipQuotaRows,
  membershipRateSources,
  membershipVendorBoards,
} from "@/data/membership-rates";
import { cn } from "@/lib/utils";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";

type MembershipRatesExplorerProps = {
  defaultVendor?: string;
  defaultOpenAITab?: string;
};

type MembershipVendorBoard = (typeof membershipVendorBoards)[number];

export function MembershipRatesExplorer({
  defaultVendor = "openai",
  defaultOpenAITab = "consumer",
}: MembershipRatesExplorerProps) {
  const initialVendor = membershipVendorBoards.some(
    (item) => item.id === defaultVendor,
  )
    ? defaultVendor
    : "openai";
  const [activeVendor, setActiveVendor] = useState(initialVendor);
  const vendorTabsRef = useRef<HTMLDivElement>(null);

  const scrollVendorTabs = (distance: number) => {
    vendorTabsRef.current?.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="app-shell mt-6 sm:mt-8">
      <div className="rounded-[12px] border border-border bg-background px-3.5 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="max-w-3xl">
            <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
              vendor rate board
            </div>
            <AnimatedSectionTitle className="mt-2.5">
              会员速率总览
            </AnimatedSectionTitle>
            <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground sm:text-sm">
              先按厂商切换，再看官方公开的速率口径与社区常见体感。OpenAI 这一页保留最完整的细表，其它厂商先做摘要型面板。
            </p>
          </div>

          <div className="rate-tabs-shell">
            <button
              type="button"
              aria-label="向左滚动厂商"
              onClick={() => scrollVendorTabs(-260)}
              className="rate-tabs-arrow"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <div ref={vendorTabsRef} className="rate-tabs-scroll">
              {membershipVendorBoards.map((vendor) => {
                const active = activeVendor === vendor.id;

                return (
                  <button
                    key={vendor.id}
                    type="button"
                    data-testid={`vendor-tab-${vendor.id}`}
                    onClick={() => setActiveVendor(vendor.id)}
                    className={cn(
                      "rate-tab-button",
                      active
                        ? "is-active"
                        : "text-foreground/70 hover:bg-primary/7 hover:text-foreground",
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
              aria-label="向右滚动厂商"
              onClick={() => scrollVendorTabs(260)}
              className="rate-tabs-arrow"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>

          {activeVendor === "openai" ? (
            <OpenAIBoard defaultTab={defaultOpenAITab} />
          ) : (
            <VendorBoard
              vendor={membershipVendorBoards.find((item) => item.id === activeVendor)!}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function VendorLogo({ id, active }: { id: string; active: boolean }) {
  return (
    <span
      className={cn(
        "vendor-logo",
        `vendor-logo--${id}`,
        active && "is-active",
      )}
      aria-hidden="true"
    >
      {id === "openai" ? (
        <svg viewBox="0 0 24 24">
          <path d="M12 4.2c2.1 0 3.8 1.1 4.6 2.8 1.9.2 3.3 1.7 3.3 3.7 0 1.5-.8 2.8-2.1 3.4.1 1.9-1.2 3.7-3.1 4.3-1.4.5-2.9.1-4-.9-1.6.9-3.8.6-5-.9-1-1.2-1.2-2.8-.6-4.2-1.2-1.1-1.6-2.9-.8-4.4.7-1.3 2-2 3.4-2 1-1.1 2.5-1.8 4.3-1.8Z" />
          <path d="M8.1 8.6 12 6.3l3.9 2.3v4.8L12 15.7l-3.9-2.3V8.6Z" />
        </svg>
      ) : null}
      {id === "anthropic" ? (
        <svg viewBox="0 0 24 24">
          <path d="m12 3 2.4 6.5L21 12l-6.6 2.5L12 21l-2.4-6.5L3 12l6.6-2.5L12 3Z" />
        </svg>
      ) : null}
      {id === "google" ? <span className="vendor-logo__letter">G</span> : null}
      {id === "cursor" ? (
        <svg viewBox="0 0 24 24">
          <path d="M5 3.8 19.6 11 13 13l-2 6.8L5 3.8Z" />
        </svg>
      ) : null}
    </span>
  );
}

function OpenAIBoard({ defaultTab }: { defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(
    defaultTab === "business" ? "business" : "consumer",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 lg:grid-cols-4">
        {membershipPlans.map((plan) => (
          <Card key={plan.id} size="sm" className="surface-card rounded-[12px]">
            <CardHeader className="gap-2 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-[0.98rem]">{plan.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {plan.audience}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-[1.08rem] font-semibold tracking-[-0.03em] text-foreground">
                    {plan.priceLabel}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    约 ¥{plan.cnyEstimate} / 月
                  </div>
                </div>
              </div>
              <CardDescription className="text-[12px] leading-6">
                {plan.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-4 pb-4">
              <div className="rounded-[10px] border border-border bg-background/70 px-3 py-2.5 text-[12px] leading-6 text-muted-foreground">
                {plan.note}
              </div>
              <div className="text-[10px] text-muted-foreground">
                复核时间：{plan.updatedAt}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card size="sm" className="rounded-[12px] border border-border bg-card">
          <CardHeader className="gap-2 px-4 py-4">
            <Badge variant="outline" className="w-fit">
              官方来源
            </Badge>
            <CardTitle className="text-[0.98rem]">OpenAI 公开口径</CardTitle>
            <CardDescription className="text-[12px] leading-6">
              目前能同时看到会员价格、Codex 帮助说明和 Business credits 三层文档。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-4 pb-4 text-[12px]">
            <SourceLink href={membershipRateSources.officialCodexPricing} label="Codex Pricing" />
            <SourceLink href={membershipRateSources.chatgptPricing} label="ChatGPT Pricing" />
            <SourceLink href={membershipRateSources.helpArticle} label="Codex 帮助中心" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex w-fit items-center gap-1 rounded-[12px] border border-border bg-background/75 p-1">
          <button
            type="button"
            data-testid="openai-rate-tab-consumer"
            onClick={() => setActiveTab("consumer")}
            className={
              activeTab === "consumer"
                ? "min-w-[120px] rounded-[10px] bg-primary px-4 py-2 text-[13px] font-medium text-white"
                : "min-w-[120px] rounded-[10px] px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-primary/7 hover:text-foreground"
            }
          >
            个人会员
          </button>
          <button
            type="button"
            data-testid="openai-rate-tab-business"
            onClick={() => setActiveTab("business")}
            className={
              activeTab === "business"
                ? "min-w-[120px] rounded-[10px] bg-primary px-4 py-2 text-[13px] font-medium text-white"
                : "min-w-[120px] rounded-[10px] px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-primary/7 hover:text-foreground"
            }
          >
            Business / 企业
          </button>
        </div>

        {activeTab === "consumer" ? (
          <>
            <div className="overflow-hidden rounded-[12px] border border-border bg-card">
              <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[1rem] font-semibold">个人会员额度</h3>
                  <Badge variant="outline">OpenAI 官方区间</Badge>
                  <Badge variant="secondary">社区实测体感</Badge>
                </div>
                <p className="text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                  官方表格主要描述的是区间，不是单次精确次数。右侧的社区体感更适合判断重任务时会不会提前见底。
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 sm:pl-5">任务类型</TableHead>
                    <TableHead>周期</TableHead>
                    <TableHead>Plus</TableHead>
                    <TableHead>$100</TableHead>
                    <TableHead>$200</TableHead>
                    <TableHead className="pr-4 text-left sm:pr-5">社区体感</TableHead>
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
                <Card key={item.title} size="sm" className="surface-card rounded-[12px]">
                  <CardHeader className="gap-2 px-4 py-4">
                    <Badge variant="outline" className="w-fit">
                      社区观察
                    </Badge>
                    <CardTitle className="text-[0.96rem]">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                    {item.detail}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {communitySnapshots.map((item) => (
                <Card key={item.source} size="sm" className="motion-surface motion-surface--cyan rounded-[12px] border border-border">
                  <CardHeader className="gap-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <QuoteIcon className="size-4" />
                      </div>
                      <div className="space-y-1.5">
                        <CardTitle className="text-[0.95rem] leading-6">{item.title}</CardTitle>
                        <CardDescription className="text-[10px]">
                          社区公开样本 · {item.date}
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
                      查看原始讨论
                      <ArrowUpRightIcon className="size-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : null}

        {activeTab === "business" ? (
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <Card className="surface-card rounded-[12px]">
              <CardHeader className="gap-3 px-5 py-5">
                <CardTitle>Business / Enterprise 口径</CardTitle>
                <CardDescription className="text-[13px] leading-6">
                  OpenAI 官方把这部分写成 credits per 1M tokens。它更适合做团队预算、批量任务和内部计费换算。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-5 pb-5 text-[13px] leading-6 text-muted-foreground">
                <p>Business 与新 Enterprise 客户可以按 credits 方式扩容，计费口径更接近 API / 团队配额思路，而不是单纯的个人会员窗口。</p>
                <p>Fast mode 会更快消耗 credits。做高频批处理、长上下文云任务或多模型并行时，建议先按官方表里的中位水平估预算。</p>
                <div className="rounded-[10px] border border-border bg-background/70 px-3 py-3">
                  Business 的座席价格请以官方 ChatGPT pricing 页面为准；本页优先收录 OpenAI 已公开写出的 Codex 使用口径。
                </div>
              </CardContent>
            </Card>

            <div className="overflow-hidden rounded-[12px] border border-border bg-card">
              <div className="border-b border-border px-4 py-4 sm:px-5">
                <h3 className="text-[1rem] font-semibold">Business credits per 1M tokens</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4 sm:pl-5">模型</TableHead>
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
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VendorBoard({ vendor }: { vendor: MembershipVendorBoard }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <VendorMetricCard
          label="价格带"
          value={vendor.priceLabel}
          detail={vendor.officialRate}
          accent
        />
        <VendorMetricCard
          label="官方口径"
          value="公开说明"
          detail={vendor.officialRate}
        />
        <VendorMetricCard
          label="社区体感"
          value="真实使用"
          detail={vendor.communityRate}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <Card className="surface-card rounded-[12px]">
          <CardHeader className="gap-3 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit">
                  {vendor.label}
                </Badge>
                <CardTitle>{vendor.title}</CardTitle>
              </div>
              <Link
                href={vendor.officialSource}
                target="_blank"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:text-primary"
              >
                官方页面
                <ArrowUpRightIcon className="size-3.5" />
              </Link>
            </div>
            <CardDescription className="text-[13px] leading-6">
              {vendor.officialRate}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {vendor.plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-[12px] border border-border bg-background/78 px-3.5 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-semibold text-foreground">
                    {plan.name}
                  </div>
                  <div className="text-[12px] font-medium text-primary">
                    {plan.price}
                  </div>
                </div>
                <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
                  {plan.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[12px] border border-border bg-card">
            <CardHeader className="gap-2 px-5 py-5">
              <Badge variant="secondary" className="w-fit">
                官方说明
              </Badge>
              <CardTitle className="text-[1rem]">官方速率口径怎么写</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 px-5 pb-5">
              {vendor.officialNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-[10px] border border-border bg-background/72 px-3 py-2.5 text-[12px] leading-6 text-muted-foreground sm:text-[13px]"
                >
                  {note}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[12px] border border-border bg-card">
            <CardHeader className="gap-2 px-5 py-5">
              <Badge variant="outline" className="w-fit">
                社区体感
              </Badge>
              <CardTitle className="text-[1rem]">网友实际怎么感受</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 px-5 pb-5">
              {vendor.communityNotes.map((note) => (
                <div
                  key={note}
                  className="rounded-[10px] border border-border bg-background/72 px-3 py-2.5 text-[12px] leading-6 text-muted-foreground sm:text-[13px]"
                >
                  {note}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VendorMetricCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={
        accent
          ? "motion-surface motion-surface--green rounded-[12px] border-border"
          : "surface-card rounded-[12px]"
      }
    >
      <CardHeader className="gap-1.5 px-4 py-4">
        <CardDescription className="text-[11px] uppercase tracking-[0.12em]">
          {label}
        </CardDescription>
        <CardTitle className="text-[1rem]">{value}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
        {detail}
      </CardContent>
    </Card>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:text-primary"
    >
      {label}
      <ArrowUpRightIcon className="size-3.5" />
    </Link>
  );
}
