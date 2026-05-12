"use client";

import { startTransition, useMemo, useState } from "react";
import {
  ChevronRightIcon,
  Globe2Icon,
  RefreshCcwIcon,
  StarIcon,
} from "lucide-react";

import { subscriptionRegionPrices } from "@/data/subscription-regions";
import { formatBillingCycle, formatDate, fxReference } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan, SubscriptionRegionPrice } from "@/types";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  plans: SubscriptionPlan[];
  embedded?: boolean;
  maxRows?: number;
};

type Preset = {
  key: string;
  label: string;
  provider: string;
  productName: string;
  planName: string;
  badge?: string;
};

const productPresets: Preset[] = [
  {
    key: "chatgpt-plus",
    label: "全部套餐",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Plus",
  },
  {
    key: "chatgpt-plus-only",
    label: "ChatGPT Plus",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Plus",
    badge: "月",
  },
  {
    key: "chatgpt-pro",
    label: "ChatGPT Pro",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Pro",
    badge: "月",
  },
  {
    key: "chatgpt-team",
    label: "ChatGPT Team",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Team",
    badge: "年",
  },
  {
    key: "claude-pro",
    label: "Claude Pro",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Pro",
    badge: "月",
  },
  {
    key: "claude-max",
    label: "Claude Max",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Max 5x",
    badge: "月",
  },
  {
    key: "gemini-advanced",
    label: "Gemini Advanced",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Pro",
    badge: "月",
  },
];

const targetCurrencies = [
  { code: "CNY", label: "人民币", flag: "🇨🇳", cnyRate: 1, locale: "zh-CN" },
  { code: "USD", label: "美元", flag: "🇺🇸", cnyRate: 7.25, locale: "en-US" },
  { code: "HKD", label: "港元", flag: "🇭🇰", cnyRate: 0.93, locale: "zh-HK" },
  { code: "TWD", label: "新台币", flag: "🇹🇼", cnyRate: 0.22, locale: "zh-TW" },
  { code: "SGD", label: "新加坡元", flag: "🇸🇬", cnyRate: 5.36, locale: "en-SG" },
  { code: "AUD", label: "澳大利亚元", flag: "🇦🇺", cnyRate: 4.71, locale: "en-AU" },
  { code: "CAD", label: "加拿大元", flag: "🇨🇦", cnyRate: 5.29, locale: "en-CA" },
  { code: "EUR", label: "欧元", flag: "🇪🇺", cnyRate: 7.84, locale: "de-DE" },
  { code: "GBP", label: "英镑", flag: "🇬🇧", cnyRate: 9.18, locale: "en-GB" },
  { code: "JPY", label: "日元", flag: "🇯🇵", cnyRate: 0.047, locale: "ja-JP" },
  { code: "KRW", label: "韩元", flag: "🇰🇷", cnyRate: 0.0053, locale: "ko-KR" },
  { code: "VND", label: "越南盾", flag: "🇻🇳", cnyRate: 0.00028, locale: "vi-VN" },
  { code: "TRY", label: "土耳其里拉", flag: "🇹🇷", cnyRate: 0.224, locale: "tr-TR" },
  { code: "PHP", label: "菲律宾比索", flag: "🇵🇭", cnyRate: 0.126, locale: "en-PH" },
  { code: "PKR", label: "巴基斯坦卢比", flag: "🇵🇰", cnyRate: 0.026, locale: "en-PK" },
  { code: "NGN", label: "尼日利亚奈拉", flag: "🇳🇬", cnyRate: 0.0049, locale: "en-NG" },
  { code: "EGP", label: "埃及镑", flag: "🇪🇬", cnyRate: 0.145, locale: "ar-EG" },
  { code: "INR", label: "印度卢比", flag: "🇮🇳", cnyRate: 0.087, locale: "en-IN" },
] as const;

type TargetCurrencyCode = (typeof targetCurrencies)[number]["code"];
type ViewMode = "subscription" | "region";

export function SubscriptionExplorer({ plans, embedded = false, maxRows }: Props) {
  const [activePreset, setActivePreset] = useState(productPresets[0]);
  const [targetCurrency, setTargetCurrency] = useState<TargetCurrencyCode>("CNY");
  const [viewMode, setViewMode] = useState<ViewMode>("subscription");
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const currentPlan = useMemo<SubscriptionPlan>(
    () =>
      plans.find(
        (item) =>
          item.provider === activePreset.provider &&
          item.productName === activePreset.productName &&
          item.planName === activePreset.planName,
      ) ?? {
        id: activePreset.key,
        provider: activePreset.provider,
        productName: activePreset.productName,
        planName: activePreset.planName,
        officialPriceUSD: 20,
        priceCNY: 137,
        billingCycle: activePreset.badge === "年" ? "yearly" : "monthly",
        region: "US reference",
        note: "该档位暂时使用示例种子数据，后续可继续补充地区明细。",
        tags: ["seed"],
        updatedAt: "2026-05-11",
      },
    [activePreset, plans],
  );

  const currentRegions = useMemo(
    () => {
      const matchedRegions = subscriptionRegionPrices
        .filter(
          (item) =>
            item.provider === activePreset.provider &&
            item.productName === activePreset.productName &&
            item.planName === activePreset.planName,
        )
        .sort((left, right) => left.convertedCNY - right.convertedCNY);

      if (matchedRegions.length > 0) {
        return matchedRegions;
      }

      return [buildFallbackRegion(currentPlan)];
    },
    [activePreset, currentPlan],
  );

  const cheapest = currentRegions[0];
  const usReference =
    currentRegions.find((item) => item.countryCode === "US") ?? currentRegions.at(-1);
  const updatedAt = currentPlan?.updatedAt ?? currentRegions[0]?.updatedAt;

  const savingsValue =
    cheapest && usReference
      ? Math.max(usReference.convertedCNY - cheapest.convertedCNY, 0)
      : 0;
  const savingsPercent =
    cheapest && usReference && usReference.convertedCNY > 0
      ? Math.round((savingsValue / usReference.convertedCNY) * 100)
      : 0;

  const description = planSummaryFor(currentPlan);
  const visibleRegions =
    typeof maxRows === "number" ? currentRegions.slice(0, maxRows) : currentRegions;
  const regionGroups = useMemo(
    () => buildRegionGroups(activePreset.provider, activePreset.productName),
    [activePreset.provider, activePreset.productName],
  );
  const visibleRegionGroups =
    typeof maxRows === "number" ? regionGroups.slice(0, maxRows) : regionGroups;
  const selectedCurrency = currencyFor(targetCurrency);

  return (
    <section
      className={cn(
        "rounded-[12px] border border-border bg-background px-4 py-5 sm:px-5 lg:px-6",
        !embedded && "app-shell",
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto_auto] xl:items-end">
        <div>
          <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
            pricing by region
          </div>
          <AnimatedSectionTitle className="mt-2.5">
            会员订阅比价
          </AnimatedSectionTitle>
          <p className="mt-1.5 text-[13px] text-muted-foreground sm:text-sm">
            选择币种与地区，查看各套餐价格对比
          </p>
        </div>

        <div className="flex w-fit items-center rounded-full border border-border bg-card p-1">
          {(["subscription", "region"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => startTransition(() => setViewMode(mode))}
              className={cn(
                "min-h-8 min-w-[82px] rounded-full px-4 text-[13px] font-semibold transition-colors",
                viewMode === mode
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-primary/7 hover:text-foreground",
              )}
            >
              {mode === "subscription" ? "订阅" : "地区"}
            </button>
          ))}
        </div>

        <Select
          value={targetCurrency}
          open={currencyOpen}
          onOpenChange={setCurrencyOpen}
          onValueChange={(nextValue) => {
            if (nextValue) {
              setTargetCurrency(nextValue as TargetCurrencyCode);
              setCurrencyOpen(false);
            }
          }}
        >
          <SelectTrigger className="min-h-9 min-w-[250px] rounded-full border-border bg-card px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Globe2Icon className="size-4 text-primary" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent
            align="end"
            alignItemWithTrigger={false}
            className="max-h-[360px] min-w-[260px] rounded-[12px] bg-popover/94 p-1 shadow-[0_22px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
          >
            <SelectGroup>
              <SelectLabel>目标货币</SelectLabel>
              {targetCurrencies.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  <span className="text-[15px]">{item.flag}</span>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">（{item.code}）</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => {
            const currentIndex = targetCurrencies.findIndex((item) => item.code === targetCurrency);
            const next = targetCurrencies[(currentIndex + 1) % targetCurrencies.length];
            setTargetCurrency(next.code);
          }}
          className="flex min-h-9 min-w-[116px] items-center justify-center gap-2 rounded-full bg-primary/10 px-4 text-[13px] font-medium text-primary transition-colors hover:bg-primary/15 sm:text-sm"
        >
          <RefreshCcwIcon className="size-4" />
          切换
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end text-[11px] text-muted-foreground sm:text-xs">
        更新时间：{updatedAt ? formatDate(updatedAt) : "待补充"}
        <span className="ml-2 size-2 rounded-full bg-primary" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {productPresets.map((preset) => {
          const isActive = activePreset.key === preset.key;

          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => startTransition(() => setActivePreset(preset))}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] transition-colors sm:px-3.5 sm:text-[13px]",
                isActive
                  ? "border-transparent bg-primary font-semibold text-white"
                  : "border-border bg-card text-foreground hover:border-primary/25 hover:bg-primary/7",
              )}
            >
              <span>{preset.label}</span>
              {preset.badge ? (
                <span
                  className={cn(
                    "rounded-[10px] px-2 py-0.5 text-[10px] sm:text-[11px]",
                    isActive ? "bg-white/15 text-white" : "bg-primary/10 text-primary",
                  )}
                >
                  {preset.badge}
                </span>
              ) : null}
              {preset.key === productPresets.at(-1)?.key ? (
                <ChevronRightIcon className={cn("size-4", isActive ? "text-white" : "text-muted-foreground")} />
              ) : null}
            </button>
          );
        })}
      </div>

      {viewMode === "subscription" && cheapest && usReference ? (
        <div className="motion-surface motion-surface--green mt-5 rounded-[12px] border border-border p-2.5">
          <div className="grid gap-2.5 rounded-[12px] sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <CompareEdge region={cheapest} align="left" targetCurrency={targetCurrency} />

            <div className="mx-auto flex w-full max-w-[148px] flex-col items-center rounded-[12px] border border-border bg-card px-3 py-2.5 text-center">
              <div className="text-[11px] text-muted-foreground sm:text-xs">比美国便宜</div>
              <div className="mt-1 text-[1.5rem] font-semibold tracking-[-0.025em] text-primary sm:text-[1.72rem]">
                {savingsPercent}%
              </div>
              <div className="text-[11px] text-muted-foreground sm:text-xs">
                约 {formatTargetMoney(savingsValue, targetCurrency)}
              </div>
            </div>

            <CompareEdge region={usReference} align="right" targetCurrency={targetCurrency} />
          </div>
        </div>
      ) : null}

      {viewMode === "subscription" && currentPlan ? (
        <div className="mt-5 rounded-[12px] border border-border bg-card px-4 py-4 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-[1.15rem] font-semibold tracking-[-0.025em] sm:text-[1.28rem]">
                  {currentPlan.productName} {currentPlan.planName}
                </h3>
                <span className="rounded-[10px] bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  {formatBillingCycle(currentPlan.billingCycle)}
                </span>
              </div>
              <p className="mt-1.5 max-w-4xl text-[12.5px] leading-6 text-muted-foreground sm:text-[13px]">
                {description}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-primary/10 px-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              <StarIcon className="size-4 fill-current" />
              收藏
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {visibleRegions.map((item, index) => (
              <PriceRow
                key={item.id}
                region={item}
                highlighted={index === 0}
                targetCurrency={targetCurrency}
              />
            ))}
          </div>

          {visibleRegions.length < currentRegions.length ? (
            <div className="mt-3 rounded-[10px] border border-dashed border-border bg-background/70 px-3 py-2 text-[11px] leading-5 text-muted-foreground sm:text-xs">
              首页仅预览前 {visibleRegions.length} 个地区，完整列表和更多套餐可以进入会员订阅页继续查看。
            </div>
          ) : null}
        </div>
      ) : null}

      {viewMode === "region" ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {visibleRegionGroups.map((group) => (
            <RegionPlanCard
              key={group.countryCode}
              group={group}
              targetCurrency={targetCurrency}
            />
          ))}
          {visibleRegionGroups.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground lg:col-span-2">
              当前产品还没有足够地区数据，后续爬虫会继续补齐。
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 text-[11px] leading-6 text-muted-foreground sm:text-xs">
        目标货币：{selectedCurrency.label}（{selectedCurrency.code}）。汇率为静态参考值，仅用于布局与成本感知演示；真实价格请以官方页面为准。
      </div>
    </section>
  );
}

function buildFallbackRegion(plan: SubscriptionPlan): SubscriptionRegionPrice {
  return {
    id: `${plan.id}-us`,
    provider: plan.provider,
    productName: plan.productName,
    planName: plan.planName,
    billingCycle: plan.billingCycle,
    country: "美国",
    countryCode: "US",
    currencyCode: "USD",
    localPrice: plan.officialPriceUSD ?? 20,
    convertedCNY:
      plan.priceCNY ?? Math.round((plan.officialPriceUSD ?? 20) * fxReference.rate),
    sourceLabel: "官方价格参考",
    updatedAt: plan.updatedAt,
  };
}

function CompareEdge({
  region,
  align,
  targetCurrency,
}: {
  region: {
    country: string;
    countryCode: string;
    currencyCode: string;
    localPrice: number;
    convertedCNY: number;
  };
  align: "left" | "right";
  targetCurrency: TargetCurrencyCode;
}) {
  const displayPrice = formatTargetMoney(region.convertedCNY, targetCurrency, region);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[12px] px-3 py-2 sm:px-3.5",
        align === "right" && "justify-end text-right",
      )}
    >
      {align === "left" ? <span className="text-[24px] sm:text-[28px]">{flagFor(region.countryCode)}</span> : null}
      <div>
        <div className="text-[11px] text-muted-foreground">{region.country}</div>
        <div
          className={cn(
            "mt-1 text-[1.35rem] font-semibold tracking-[-0.025em] sm:text-[1.58rem]",
            align === "left" ? "text-primary" : "text-foreground",
          )}
        >
          {displayPrice}
        </div>
        <div className="text-[11px] text-muted-foreground">{targetCurrency}</div>
      </div>
      {align === "right" ? <span className="text-[24px] sm:text-[28px]">{flagFor(region.countryCode)}</span> : null}
    </div>
  );
}

function PriceRow({
  region,
  highlighted,
  targetCurrency,
}: {
  region: {
    country: string;
    countryCode: string;
    currencyCode: string;
    localPrice: number;
    convertedCNY: number;
  };
  highlighted: boolean;
  targetCurrency: TargetCurrencyCode;
}) {
  const finalPrice = formatTargetMoney(region.convertedCNY, targetCurrency, region);

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 rounded-[12px] border px-3 py-2.5 transition-colors sm:px-3.5 lg:grid-cols-[1.2fr_0.9fr_0.5fr_0.7fr_auto_auto]",
        highlighted
          ? "border-primary/25 bg-primary/7"
          : "border-border bg-background",
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-[24px] sm:text-[26px]">{flagFor(region.countryCode)}</span>
        <div>
          <div className="text-[13px] font-semibold sm:text-sm">{region.country}</div>
          <div className="text-[11px] text-muted-foreground">官方价格</div>
        </div>
      </div>

      <div className="hidden text-[11px] text-muted-foreground lg:block">官方价格</div>
      <div className="hidden text-[11px] text-muted-foreground lg:block">{region.currencyCode}</div>
      <div className="hidden text-[1rem] font-semibold tracking-[-0.04em] sm:text-[1.05rem] lg:block">
        {symbolFor(region.currencyCode)}
        {region.localPrice.toFixed(2)}
      </div>
      <div
        className={cn(
          "text-right text-[1rem] font-semibold tracking-[-0.025em] sm:text-[1.05rem] lg:text-left",
          highlighted ? "text-primary" : "text-foreground",
        )}
      >
        <div>{finalPrice}</div>
        <div className="mt-0.5 text-[10px] font-medium tracking-normal text-muted-foreground lg:hidden">
          {region.currencyCode} {symbolFor(region.currencyCode)}
          {region.localPrice.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center justify-end">
        {highlighted ? (
          <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
            推荐
          </span>
        ) : (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

type RegionGroup = {
  country: string;
  countryCode: string;
  prices: SubscriptionRegionPrice[];
};

function RegionPlanCard({
  group,
  targetCurrency,
}: {
  group: RegionGroup;
  targetCurrency: TargetCurrencyCode;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-3.5 shadow-[0_12px_44px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[24px]">{flagFor(group.countryCode)}</span>
          <h3 className="truncate text-[1.05rem] font-semibold tracking-[-0.025em]">
            {group.country}
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {group.prices.length} 个价格
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {group.prices.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[10px] px-3 py-2.5",
              index % 2 === 0 ? "bg-background" : "bg-primary/7",
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-foreground sm:text-sm">
                {item.productName} {item.planName} - {formatCycleEnglish(item.billingCycle)}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {item.currencyCode} {formatLocalNumber(item.localPrice)}
              </div>
            </div>
            <div className="text-right text-[1rem] font-semibold tracking-[-0.025em] text-foreground">
              {formatTargetMoney(item.convertedCNY, targetCurrency, item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildRegionGroups(provider: string, productName: string): RegionGroup[] {
  const groups = new Map<string, RegionGroup>();

  subscriptionRegionPrices
    .filter((item) => item.provider === provider && item.productName === productName)
    .forEach((item) => {
      const current = groups.get(item.countryCode) ?? {
        country: item.country,
        countryCode: item.countryCode,
        prices: [],
      };

      current.prices.push(item);
      groups.set(item.countryCode, current);
    });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      prices: group.prices.sort((left, right) => {
        const leftWeight = planSortWeight(left);
        const rightWeight = planSortWeight(right);

        return leftWeight - rightWeight || left.convertedCNY - right.convertedCNY;
      }),
    }))
    .sort(
      (left, right) =>
        Math.min(...left.prices.map((item) => item.convertedCNY)) -
        Math.min(...right.prices.map((item) => item.convertedCNY)),
    );
}

function planSortWeight(item: SubscriptionRegionPrice) {
  const key = `${item.planName}-${item.billingCycle}`.toLowerCase();

  return (
    {
      "plus-monthly": 0,
      "pro-monthly": 1,
      "max 5x-monthly": 2,
      "pro-yearly": 3,
      "team-yearly": 4,
      "max 20x-monthly": 5,
      "google ai pro-monthly": 6,
    }[key] ?? 20
  );
}

function currencyFor(code: TargetCurrencyCode) {
  return targetCurrencies.find((item) => item.code === code) ?? targetCurrencies[0];
}

function formatTargetMoney(
  cnyValue: number,
  targetCurrency: TargetCurrencyCode,
  original?: {
    currencyCode: string;
    localPrice: number;
  },
) {
  if (original?.currencyCode === targetCurrency) {
    return formatCurrencyAmount(original.localPrice, targetCurrency);
  }

  const currency = currencyFor(targetCurrency);
  return formatCurrencyAmount(cnyValue / currency.cnyRate, targetCurrency);
}

function formatCurrencyAmount(value: number, targetCurrency: TargetCurrencyCode) {
  const currency = currencyFor(targetCurrency);
  const zeroDecimal = ["JPY", "KRW", "VND"].includes(targetCurrency);

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: targetCurrency,
    maximumFractionDigits: zeroDecimal || value >= 100 ? 0 : 2,
  }).format(value);
}

function formatLocalNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatCycleEnglish(value: "monthly" | "yearly") {
  return value === "monthly" ? "Monthly" : "Annual";
}

function flagFor(countryCode: string) {
  return (
    {
      CN: "🇨🇳",
      US: "🇺🇸",
      TR: "🇹🇷",
      PH: "🇵🇭",
      PK: "🇵🇰",
      FR: "🇫🇷",
      GB: "🇬🇧",
      JP: "🇯🇵",
      AR: "🇦🇷",
      AU: "🇦🇺",
      NG: "🇳🇬",
      EG: "🇪🇬",
      VN: "🇻🇳",
      KR: "🇰🇷",
      CA: "🇨🇦",
      IN: "🇮🇳",
    }[countryCode] ?? "🏳️"
  );
}

function symbolFor(currencyCode: string) {
  return (
    {
      CNY: "¥",
      USD: "$",
      TRY: "₺",
      PHP: "₱",
      PKR: "₨",
      NGN: "₦",
      EGP: "E£",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      KRW: "₩",
      VND: "₫",
      AUD: "A$",
      CAD: "C$",
      INR: "₹",
    }[currencyCode] ?? ""
  );
}

function planSummaryFor(plan: SubscriptionPlan) {
  const key = `${plan.productName}-${plan.planName}`.toLowerCase();

  return (
    {
      "chatgpt-plus": "适合日常使用，包含 GPT-4o、文件分析、图片生成功能",
      "chatgpt-pro": "适合高频重度使用，偏向更高额度、更稳定访问与更强工具能力。",
      "chatgpt-team": "适合小团队协作，强调共享工作空间、成员管理与更稳定的多人使用体验。",
      "claude-pro": "适合写作、总结、知识工作与轻量编程，是 Claude 的主力个人订阅档位。",
      "claude-max 5x": "适合更高频 Claude 使用者，偏向长会话、重度总结和更大的调用额度。",
      "gemini-google ai pro": "适合 Gemini 深度使用者，兼顾模型能力与 Google One 生态权益。",
    }[key] ?? plan.note ?? "按当前官方页面维护种子数据，并保留后续扩展后台管理位。"
  );
}
