"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRightIcon } from "lucide-react";

import { formatDate, formatDealStatus, formatRiskLevel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AIDeal } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Props = {
  deals: AIDeal[];
};

export function DealsExplorer({ deals }: Props) {
  const [status, setStatus] = useState("all");
  const [dealType, setDealType] = useState("all");
  const [riskLevel, setRiskLevel] = useState("all");

  const filteredDeals = useMemo(
    () =>
      deals
        .filter((deal) => status === "all" || deal.status === status)
        .filter((deal) => dealType === "all" || deal.dealType === dealType)
        .filter((deal) => riskLevel === "all" || deal.riskLevel === riskLevel),
    [dealType, deals, riskLevel, status],
  );

  return (
    <section className="app-shell flex flex-col gap-4 rounded-[12px] border border-border bg-background px-4 py-5 sm:px-5 sm:py-5 lg:px-6">
      <Card size="sm" className="rounded-[12px] border-border bg-card/90">
        <CardHeader className="gap-4 px-4 py-4 sm:px-5">
          <div className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
            <div className="flex flex-col gap-2">
              <div className="mono-kicker text-[12px] text-muted-foreground">
                官方优惠
              </div>
              <AnimatedSectionTitle>AI 优惠与免费额度</AnimatedSectionTitle>
              <CardDescription className="text-[12px] leading-6 sm:text-[13px]">
                只收录正规活动、官方免费层和明确的新用户 / 学生权益，不引导灰产代充。
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DealFilter
                label="状态"
                value={status}
                onValueChange={setStatus}
                items={["all", "active", "unknown", "expired"]}
              />
              <DealFilter
                label="类型"
                value={dealType}
                onValueChange={setDealType}
                items={["all", "free_credit", "trial", "student", "other"]}
              />
              <DealFilter
                label="风险"
                value={riskLevel}
                onValueChange={setRiskLevel}
                items={["all", "low", "medium", "high"]}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <MetaStat
          label="活动总数"
          value={String(filteredDeals.length)}
          detail="筛选后实时变化"
        />
        <MetaStat
          label="进行中"
          value={String(filteredDeals.filter((deal) => deal.status === "active").length)}
          detail="优先可直接领取"
        />
        <MetaStat
          label="低风险"
          value={String(filteredDeals.filter((deal) => deal.riskLevel === "low").length)}
          detail="更适合公开推荐"
        />
      </div>

      {filteredDeals.length > 0 ? (
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredDeals.map((deal, index) => (
            <DealCard
              key={deal.id}
              deal={deal}
              featured={index === 0}
            />
          ))}
        </div>
      ) : (
        <Card size="sm" className="rounded-[12px] border border-border bg-card">
          <CardContent className="px-4 py-4 text-[13px] text-muted-foreground">
            当前筛选条件下暂无结果，可以放宽状态或类型再看。
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function DealCard({
  deal,
  featured = false,
}: {
  deal: AIDeal;
  featured?: boolean;
}) {
  const toneClass = dealToneClass(deal);
  const actionLabel = deal.status === "expired" ? "查看历史活动" : "立即查看活动";

  return (
    <Card
      size="sm"
      className={cn(
        "rounded-[14px] border-border",
        "motion-surface",
        "shadow-[0_6px_22px_rgba(2,44,34,0.06)]",
        toneClass,
      )}
    >
      <CardHeader className="gap-3 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            className={cn(
              "text-[1.12rem] leading-7 tracking-[-0.03em] text-foreground",
              featured && "text-[1.24rem]",
            )}
          >
            {deal.title}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {renderDealValue(deal.value)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[12px] text-muted-foreground">{deal.provider}</span>
          <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
            {formatDealStatus(deal.status)}
          </Badge>
          <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
            {formatRiskLevel(deal.riskLevel)}
          </Badge>
          <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
            {renderDealFilterLabel(deal.dealType)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 px-4 pb-3">
        <p className="line-clamp-3 text-[13px] leading-6 text-muted-foreground">
          {deal.summary}
        </p>

        <div className="rounded-[11px] border border-border/70 bg-background/65 p-2.5">
          <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            领取方式
          </div>
          <p className="line-clamp-2 text-[12px] leading-5 text-foreground/88">
            {deal.howToGet ?? "查看来源页"}
          </p>
        </div>

        {deal.sourceUrl ? (
          <Link
            href={deal.sourceUrl}
            target="_blank"
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[11px]",
              "border border-transparent bg-primary text-[13px] font-semibold text-primary-foreground",
              "shadow-[0_10px_24px_color-mix(in_oklch,var(--primary)_28%,transparent)]",
              "transition hover:-translate-y-0.5 hover:brightness-[1.03]",
            )}
          >
            {actionLabel}
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        ) : (
          <div className="rounded-[11px] border border-dashed border-border px-3 py-2 text-center text-[12px] text-muted-foreground">
            暂无官方链接，待补充
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-border/70 pt-2 text-[12px] leading-5">
          <span className="text-muted-foreground">{formatDate(deal.updatedAt)}</span>

          {deal.sourceUrl ? (
            <Link
              href={deal.sourceUrl}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-medium text-primary/90 transition hover:text-primary"
            >
              查看官方来源
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MetaStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card
      size="sm"
      className="surface-card rounded-[12px] border-border"
    >
      <CardContent className="grid gap-1.5 px-4 py-3.5">
        <div className="text-[11px] text-muted-foreground">
          {label}
        </div>
        <div className="font-heading text-[2rem] font-semibold leading-none tracking-[-0.055em] text-primary sm:text-[2.35rem]">
          {value}
        </div>
        <div className="text-[12px] text-muted-foreground">
          {detail}
        </div>
      </CardContent>
    </Card>
  );
}

function DealFilter({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger className="h-9 w-full rounded-[10px]">
          <span className="truncate">{renderDealFilterLabel(value)}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {renderDealFilterLabel(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function renderDealFilterLabel(value: string) {
  const map: Record<string, string> = {
    all: "全部",
    active: "进行中",
    unknown: "待确认",
    expired: "已结束",
    free_credit: "免费额度",
    trial: "试用",
    student: "学生优惠",
    other: "其他",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
  };

  return map[value] ?? value;
}

function renderDealValue(value?: string) {
  const map: Record<string, string> = {
    "$0 / month": "免费 / 月",
    "Free tier": "免费层",
    "Free Tier": "免费层",
    "1 year": "1 年权益",
    "Starts at $4.99/mo": "起价 $4.99/月",
  };

  return value ? map[value] ?? value : "待确认";
}

function dealToneClass(deal: AIDeal) {
  if (deal.dealType === "student") {
    return "motion-surface--blue";
  }

  if (deal.dealType === "free_credit") {
    return "motion-surface--green";
  }

  if (deal.dealType === "trial") {
    return "motion-surface--amber";
  }

  return "motion-surface--purple";
}
