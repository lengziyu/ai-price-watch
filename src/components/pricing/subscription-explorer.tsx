"use client";

import { startTransition, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronRightIcon,
  RefreshCcwIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { subscriptionRegionPrices } from "@/data/subscription-regions";
import { buildEvidenceSummary } from "@/lib/evidence";
import { formatBillingCycle, formatDate, fxReference } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan, SubscriptionRegionPrice } from "@/types";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import { EvidenceBadgeGroup } from "@/components/shared/evidence-badge";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSegmentedIndicator } from "@/components/ui/use-segmented-indicator";

type Props = {
  plans: SubscriptionPlan[];
  embedded?: boolean;
  maxRows?: number;
  disableStickyTabs?: boolean;
};

type Preset = {
  key: string;
  label: string;
  provider: string;
  productName: string;
  planName: string;
  billingCycle: "monthly" | "yearly";
  badge?: string;
};

type ProviderPreset = {
  key: string;
  label: string;
  provider: string;
  productName: string;
};

const productPresets: Preset[] = [
  {
    key: "chatgpt-plus-monthly",
    label: "ChatGPT Plus",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Plus",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "chatgpt-go-monthly",
    label: "ChatGPT Go",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Go",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "chatgpt-pro-5x-monthly",
    label: "ChatGPT Pro 5x",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Pro 5x",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "chatgpt-pro-20x-monthly",
    label: "ChatGPT Pro 20x",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Pro 20x",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "chatgpt-plus-yearly",
    label: "ChatGPT Plus 年",
    provider: "OpenAI",
    productName: "ChatGPT",
    planName: "Plus",
    billingCycle: "yearly",
    badge: "年",
  },
  {
    key: "claude-pro",
    label: "Claude Pro",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Pro",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "claude-max",
    label: "Claude Max",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Max 5x",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "gemini-advanced",
    label: "Gemini Advanced",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Pro",
    billingCycle: "monthly",
    badge: "月",
  },
];

const providerPresets: ProviderPreset[] = [
  {
    key: "chatgpt",
    label: "ChatGPT",
    provider: "OpenAI",
    productName: "ChatGPT",
  },
  {
    key: "claude",
    label: "Claude",
    provider: "Anthropic",
    productName: "Claude",
  },
  {
    key: "gemini",
    label: "Gemini",
    provider: "Google",
    productName: "Gemini",
  },
];

const targetCurrencies = [
  { code: "CNY", label: "人民币", flagCode: "CN", cnyRate: 1, locale: "zh-CN" },
  { code: "USD", label: "美元", flagCode: "US", cnyRate: 7.25, locale: "en-US" },
  { code: "HKD", label: "港元", flagCode: "HK", cnyRate: 0.93, locale: "zh-HK" },
  { code: "TWD", label: "新台币", flagCode: "TW", cnyRate: 0.22, locale: "zh-TW" },
  { code: "SGD", label: "新加坡元", flagCode: "SG", cnyRate: 5.36, locale: "en-SG" },
  { code: "AUD", label: "澳大利亚元", flagCode: "AU", cnyRate: 4.71, locale: "en-AU" },
  { code: "CAD", label: "加拿大元", flagCode: "CA", cnyRate: 5.29, locale: "en-CA" },
  { code: "BRL", label: "巴西雷亚尔", flagCode: "BR", cnyRate: 1.38, locale: "pt-BR" },
  { code: "EUR", label: "欧元", flagCode: "EU", cnyRate: 7.84, locale: "de-DE" },
  { code: "GBP", label: "英镑", flagCode: "GB", cnyRate: 9.18, locale: "en-GB" },
  { code: "JPY", label: "日元", flagCode: "JP", cnyRate: 0.047, locale: "ja-JP" },
  { code: "KRW", label: "韩元", flagCode: "KR", cnyRate: 0.0053, locale: "ko-KR" },
  { code: "MXN", label: "墨西哥比索", flagCode: "MX", cnyRate: 0.395, locale: "es-MX" },
  { code: "VND", label: "越南盾", flagCode: "VN", cnyRate: 0.00028, locale: "vi-VN" },
  { code: "TRY", label: "土耳其里拉", flagCode: "TR", cnyRate: 0.224, locale: "tr-TR" },
  { code: "PHP", label: "菲律宾比索", flagCode: "PH", cnyRate: 0.126, locale: "en-PH" },
  { code: "PKR", label: "巴基斯坦卢比", flagCode: "PK", cnyRate: 0.026, locale: "en-PK" },
  { code: "NGN", label: "尼日利亚奈拉", flagCode: "NG", cnyRate: 0.0049, locale: "en-NG" },
  { code: "EGP", label: "埃及镑", flagCode: "EG", cnyRate: 0.145, locale: "ar-EG" },
  { code: "INR", label: "印度卢比", flagCode: "IN", cnyRate: 0.087, locale: "en-IN" },
] as const;

type TargetCurrencyCode = (typeof targetCurrencies)[number]["code"];
type ViewMode = "subscription" | "region";
type FxFeed = {
  fetchedAt?: string;
  rates: Partial<Record<TargetCurrencyCode, number>>;
  source: "frankfurter" | "snapshot";
  updatedAt?: string;
};

const fxTickIntervalSeconds = 4;
const fxFetchIntervalMs = 30_000;
const defaultRowsPerTab = 20;

export function SubscriptionExplorer({
  plans,
  embedded = false,
  maxRows,
  disableStickyTabs = false,
}: Props) {
  const isCompact = embedded;
  const [activeProviderKey, setActiveProviderKey] = useState(providerPresets[0].key);
  const [activePresetKey, setActivePresetKey] = useState(productPresets[0].key);
  const [targetCurrency, setTargetCurrency] = useState<TargetCurrencyCode>("CNY");
  const [viewMode, setViewMode] = useState<ViewMode>("subscription");
  const [providerOpen, setProviderOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(null);
  const [fxTick, setFxTick] = useState(0);
  const [nextFxRefresh, setNextFxRefresh] = useState(fxTickIntervalSeconds);
  const [fxFeed, setFxFeed] = useState<FxFeed>({
    rates: {},
    source: "snapshot",
  });
  const stickyTabsEnabled = !embedded && !disableStickyTabs;
  const {
    stickyRef,
    stickySentinelRef,
    stickyBoundaryRef,
    isSticky,
    scrollToStickyContent,
  } = useStickyTabs("subscriptions", {
    enabled: stickyTabsEnabled,
  });
  const { segmentedRef: presetTabsRef, indicatorRef: presetIndicatorRef } =
    useSegmentedIndicator<HTMLDivElement>();
  const targetRowsPerTab = maxRows ?? defaultRowsPerTab;
  const activeProvider =
    providerPresets.find((item) => item.key === activeProviderKey) ?? providerPresets[0];
  const filteredPresets = useMemo(
    () =>
      productPresets.filter(
        (item) =>
          item.provider === activeProvider.provider &&
          item.productName === activeProvider.productName,
      ),
    [activeProvider],
  );
  const activePreset =
    filteredPresets.find((item) => item.key === activePresetKey) ??
    filteredPresets[0] ??
    productPresets[0];

  useEffect(() => {
    if (activePreset && activePreset.key !== activePresetKey) {
      setActivePresetKey(activePreset.key);
    }
  }, [activePreset, activePresetKey]);

  useEffect(() => {
    setExpandedRegionId(null);
  }, [activePreset.key, targetCurrency, viewMode]);

  const currentPlan = useMemo<SubscriptionPlan>(
    () => resolvePlanForPreset(activePreset, plans),
    [activePreset, plans],
  );
  const currentProviderPlans = useMemo(
    () => filteredPresets.map((item) => resolvePlanForPreset(item, plans)),
    [filteredPresets, plans],
  );

  const currentRegions = useMemo(
    () =>
      buildComparableRegions({
        preset: activePreset,
        plan: currentPlan,
        targetCount: targetRowsPerTab,
      }),
    [activePreset, currentPlan, targetRowsPerTab],
  );
  const liveCnyRates = useMemo(
    () => buildLiveCnyRates(fxFeed.rates),
    [fxFeed.rates],
  );
  const rankedRegions = useMemo(
    () =>
      [...currentRegions].sort(
        (left, right) =>
          liveCnyValueFor(left, liveCnyRates) - liveCnyValueFor(right, liveCnyRates),
      ),
    [currentRegions, liveCnyRates],
  );
  const cheapest = rankedRegions[0];
  const referenceRegion = rankedRegions.at(-1);
  const updatedAt = currentRegions[0]?.updatedAt ?? currentPlan?.updatedAt;

  const description = planSummaryFor(currentPlan);
  const visibleRegions = rankedRegions;
  const regionGroups = useMemo(
    () => buildRegionGroups(activePreset.provider, activePreset.productName),
    [activePreset.provider, activePreset.productName],
  );
  const visibleRegionGroups =
    typeof maxRows === "number" ? regionGroups.slice(0, maxRows) : regionGroups;
  const hoverDetailMap = useMemo(
    () =>
      new Map(
        visibleRegions.map((region) => [
          region.countryCode,
          buildProviderCountryDetails({
            countryTemplate: region,
            activePreset,
            activePlan: currentPlan,
            providerPlans: currentProviderPlans,
          }),
        ]),
      ),
    [activePreset, currentPlan, currentProviderPlans, visibleRegions],
  );
  const selectedCurrency = currencyFor(targetCurrency);
  const liveCheapestCny = cheapest ? liveCnyValueFor(cheapest, liveCnyRates) : 0;
  const liveReferenceCny = referenceRegion ? liveCnyValueFor(referenceRegion, liveCnyRates) : 0;
  const liveSavingsValue = Math.max(liveReferenceCny - liveCheapestCny, 0);
  const liveSavingsPercent =
    liveReferenceCny > 0 ? Math.round((liveSavingsValue / liveReferenceCny) * 100) : 0;
  const trackedCurrency = targetCurrency === "CNY" ? "USD" : targetCurrency;
  const trackedBaseRate = currencyFor(trackedCurrency).cnyRate;
  const trackedLiveRate = liveCnyRates[trackedCurrency] ?? trackedBaseRate;
  const fxDeltaPercent =
    trackedBaseRate > 0 ? ((trackedLiveRate - trackedBaseRate) / trackedBaseRate) * 100 : 0;
  const fxTrend = fxDeltaPercent >= 0 ? "up" : "down";
  const fxSourceLabel = fxFeed.source === "frankfurter" ? "Frankfurter" : "快照";

  useEffect(() => {
    let cancelled = false;

    async function refreshFxRates() {
      try {
        const response = await fetch("/api/fx", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`FX route returned ${response.status}`);
        }

        const payload = (await response.json()) as {
          fetchedAt?: string;
          rates?: Record<string, number>;
          source?: string;
          updatedAt?: string;
        };
        const rates = normalizeFxRates(payload.rates);

        if (!cancelled) {
          setFxFeed({
            fetchedAt: payload.fetchedAt,
            rates,
            source: payload.source === "frankfurter" ? "frankfurter" : "snapshot",
            updatedAt: payload.updatedAt,
          });
        }
      } catch {
        if (!cancelled) {
          setFxFeed((current) => ({
            ...current,
            source: "snapshot",
          }));
        }
      }
    }

    void refreshFxRates();
    const interval = window.setInterval(() => {
      void refreshFxRates();
    }, fxFetchIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    let seconds = fxTickIntervalSeconds;
    const interval = window.setInterval(() => {
      seconds -= 1;

      if (seconds <= 0) {
        seconds = fxTickIntervalSeconds;
        setFxTick((current) => current + 1);
      }

      setNextFxRefresh(seconds);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      ref={(node) => {
        stickyBoundaryRef.current = node;
      }}
      className={cn(
        "rounded-[12px] border border-border bg-background px-4 sm:px-5 lg:px-6",
        isCompact ? "py-3 sm:py-3.5" : "py-4 sm:py-5",
        !embedded && "app-shell",
      )}
    >
      <div
        className={cn(
          "grid gap-3",
          "lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-5",
        )}
      >
        <div className="min-w-0">
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
        <div className="order-2 flex flex-col items-center gap-1.5 text-center lg:order-2 lg:justify-self-end lg:items-end lg:text-right">
          <div className="inline-flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/18 bg-primary/[0.065] px-3 py-1.5 text-[11px] font-medium text-primary">
            <span className="live-fx-dot size-2 rounded-full bg-primary" />
            <span>实时汇率 tick</span>
            <span className="text-muted-foreground">源 {fxSourceLabel}</span>
            <span className="text-foreground">
              {trackedCurrency}/CNY {fxDeltaPercent >= 0 ? "+" : ""}
              {fxDeltaPercent.toFixed(2)}%
            </span>
            {fxTrend === "up" ? (
              <TrendingUpIcon className="size-3.5" />
            ) : (
              <TrendingDownIcon className="size-3.5" />
            )}
            <span className="text-muted-foreground">{nextFxRefresh}s 后刷新</span>
          </div>
          <div className="flex items-center justify-center text-[11px] text-muted-foreground sm:text-xs">
            更新时间：{updatedAt ? formatDate(updatedAt) : "持续维护"}
            <span className="ml-2 size-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-2.5",
          isCompact ? "mt-2.5" : "mt-4",
          "sm:grid-cols-[auto_1fr_auto] sm:items-center",
        )}
      >
        <div className="w-fit">
          <Tabs
            value={viewMode}
            onValueChange={(nextValue) =>
              startTransition(() => setViewMode(nextValue as ViewMode))
            }
          >
            <TabsList variant="accent" className="w-full max-w-full sm:w-fit">
              <TabsTrigger value="subscription" className="min-w-[120px]">
                订阅
              </TabsTrigger>
              <TabsTrigger value="region" className="min-w-[120px]">
                地区
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="hidden sm:block" />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-self-end">
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
            <SelectTrigger
              className={cn(
                "w-full rounded-full border-primary/20 bg-card px-4 sm:w-[236px]",
                isCompact ? "min-h-10" : "min-h-11",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <CountryFlag countryCode={selectedCurrency.flagCode} className="h-4 w-5" />
                <span className="truncate font-semibold text-foreground">
                  {selectedCurrency.label}
                </span>
                <span className="truncate text-muted-foreground">({selectedCurrency.code})</span>
              </div>
            </SelectTrigger>
            <SelectContent
              align="end"
              alignItemWithTrigger={false}
              className="max-h-[360px] min-w-[280px] rounded-[16px] bg-popover/94 p-2 shadow-[0_22px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
            >
              <SelectGroup className="p-0">
                <SelectLabel className="px-3 pb-2 pt-2 text-sm font-medium text-foreground">
                  目标货币
                </SelectLabel>
                {targetCurrencies.map((item) => (
                  <SelectItem
                    key={item.code}
                    value={item.code}
                    className="rounded-[16px] px-3 py-3 text-[15px]"
                  >
                    <CountryFlag countryCode={item.flagCode} className="h-4 w-5" />
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">（{item.code}）</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <button
            type="button"
            aria-label="切换目标货币"
            onClick={() => {
              const currentIndex = targetCurrencies.findIndex(
                (item) => item.code === targetCurrency,
              );
              const next = targetCurrencies[(currentIndex + 1) % targetCurrencies.length];
              setTargetCurrency(next.code);
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15",
              isCompact ? "size-10" : "size-11",
            )}
          >
            <RefreshCcwIcon className="size-4.5" />
          </button>
        </div>
      </div>

      {stickyTabsEnabled ? <div ref={stickySentinelRef} className="page-tabs-sentinel" /> : null}
      <div
        ref={stickyRef}
        className={cn(
          isCompact ? "mt-2.5 sm:mt-3" : "mt-3.5 sm:mt-5",
          stickyTabsEnabled && "page-tabs-sticky",
          stickyTabsEnabled && isSticky && "is-sticky",
        )}
      >
        <div className="page-tabs-sticky__surface subscription-preset-rail">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={activeProvider.key}
              open={providerOpen}
              onOpenChange={setProviderOpen}
              onValueChange={(nextValue) => {
                const nextProvider = providerPresets.find((item) => item.key === nextValue);

                if (!nextProvider) {
                  return;
                }

                const nextPreset = productPresets.find(
                  (item) =>
                    item.provider === nextProvider.provider &&
                    item.productName === nextProvider.productName,
                );

                setActiveProviderKey(nextProvider.key);
                setProviderOpen(false);

                if (nextPreset) {
                  startTransition(() => setActivePresetKey(nextPreset.key));
                }
              }}
            >
              <SelectTrigger className="min-h-9 w-full rounded-[14px] border-border bg-background px-3.5 sm:w-[148px]">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{activeProvider.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="min-w-[220px] rounded-[12px] bg-popover/94 p-1 shadow-[0_22px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
              >
                <SelectGroup>
                  <SelectLabel>厂商</SelectLabel>
                  {providerPresets.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">· {item.provider}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div
              ref={presetTabsRef}
              className="segmented-scroll-shell min-w-0 flex-1"
            >
              <span
                ref={presetIndicatorRef}
                aria-hidden="true"
                className="segmented-indicator segmented-indicator--accent"
              />
              {filteredPresets.map((preset) => {
                const isActive = activePreset.key === preset.key;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    data-segmented-active={isActive ? "true" : undefined}
                    onClick={() => {
                      startTransition(() => setActivePresetKey(preset.key));
                      scrollToStickyContent();
                    }}
                    className={cn(
                      "relative z-[1] inline-flex min-h-9 flex-none items-center gap-1.5 rounded-[14px] px-3 py-2 text-[12px] transition-colors sm:gap-2 sm:px-3.5 sm:text-[13px]",
                      isActive
                        ? "border border-primary/15 bg-primary text-white shadow-[0_12px_30px_rgba(0,188,125,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : "text-foreground hover:bg-background hover:text-foreground hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]",
                    )}
                  >
                    <span className="whitespace-nowrap">{membershipLabelForPreset(preset)}</span>
                    {preset.badge ? (
                      <span
                        className={cn(
                          "rounded-[10px] px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[11px]",
                          isActive ? "bg-white/15 text-white" : "bg-primary/10 text-primary",
                        )}
                      >
                        {preset.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "subscription" && cheapest && referenceRegion ? (
        <div className="motion-surface motion-surface--green mt-3.5 overflow-hidden rounded-[24px] border border-border p-2 sm:mt-5 sm:p-2.5">
          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr] sm:gap-0">
            <CompareEdge
              region={cheapest}
              align="left"
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />

            <div className="pointer-events-none inset-x-0 top-1/2 z-[1] flex justify-center sm:absolute sm:-translate-y-1/2">
              <div className="flex w-full max-w-[176px] flex-col items-center rounded-[999px] border border-orange-200/60 bg-white/92 px-3 py-2 text-center shadow-[0_20px_44px_rgba(251,146,60,0.18)] backdrop-blur-xl dark:border-orange-300/18 dark:bg-[rgba(15,15,15,0.9)] sm:max-w-[192px] sm:px-4 sm:py-3">
                <div className="text-[11px] font-medium text-orange-500 sm:text-xs">比高价地区低</div>
                <div className="mt-0.5 text-[1.18rem] font-semibold tracking-[-0.025em] text-orange-500 sm:text-[1.52rem]">
                  <LivePriceTick pulseKey={fxTick}>{liveSavingsPercent}%</LivePriceTick>
                </div>
                <div className="text-[11px] text-muted-foreground sm:text-xs">
                  差价{" "}
                  <LivePriceTick pulseKey={fxTick}>
                    {formatCnyAsTargetMoney(liveSavingsValue, targetCurrency, liveCnyRates)}
                  </LivePriceTick>
                </div>
              </div>
            </div>

            <CompareEdge
              region={referenceRegion}
              align="right"
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />
          </div>
        </div>
      ) : null}

      {viewMode === "subscription" && currentPlan ? (
        <div className="mt-3.5 overflow-visible rounded-[12px] border border-border bg-card px-3.5 py-3.5 sm:mt-5 sm:px-4 sm:py-4">
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

          <div className="mt-3.5 flex flex-col gap-2.5 sm:mt-4">
            {visibleRegions.map((item, index) => (
              <PriceRow
                key={item.id}
                region={item}
                detailRows={hoverDetailMap.get(item.countryCode) ?? []}
                isPinned={expandedRegionId === item.id}
                onTogglePinned={() =>
                  setExpandedRegionId((current) => (current === item.id ? null : item.id))
                }
                onClosePinned={() => setExpandedRegionId(null)}
                highlighted={index === 0}
                targetCurrency={targetCurrency}
                liveCnyRates={liveCnyRates}
                pulseKey={fxTick}
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
        <div className="mt-3.5 grid gap-3 sm:mt-5 lg:grid-cols-2">
          {visibleRegionGroups.map((group) => (
            <RegionPlanCard
              key={group.countryCode}
              group={group}
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />
          ))}
          {visibleRegionGroups.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground lg:col-span-2">
              当前产品的地区价格仍在持续整理中。
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 text-[11px] leading-6 text-muted-foreground sm:text-xs">
        目标货币：{selectedCurrency.label}（{selectedCurrency.code}）。当前优先读取 Frankfurter 参考汇率，失败时回落到静态快照；几秒级 tick 用于展示汇率波动感，真实结算价格仍请以官方页面为准。
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
    sourceLabel: "官方定价",
    updatedAt: plan.updatedAt,
  };
}

function resolvePlanForPreset(preset: Preset | undefined, plans: SubscriptionPlan[]) {
  if (!preset) {
    return {
      id: "fallback-plan",
      provider: "OpenAI",
      productName: "ChatGPT",
      planName: "Plus",
      officialPriceUSD: 20,
      priceCNY: 137,
      billingCycle: "monthly" as const,
      region: "US reference",
      note: "该档位当前按公开价格整理展示，地区明细会持续补齐。",
      tags: ["seed"],
      updatedAt: "2026-05-11",
    } satisfies SubscriptionPlan;
  }

  return (
    plans.find(
      (item) =>
        item.provider === preset.provider &&
        item.productName === preset.productName &&
        item.planName === preset.planName &&
        item.billingCycle === preset.billingCycle,
    ) ?? {
      id: preset.key,
      provider: preset.provider,
      productName: preset.productName,
      planName: preset.planName,
      officialPriceUSD: 20,
      priceCNY: 137,
      billingCycle: preset.billingCycle,
      region: "US reference",
      note: "该档位当前按公开价格整理展示，地区明细会持续补齐。",
      tags: ["seed"],
      updatedAt: "2026-05-11",
    }
  );
}

function buildProviderCountryDetails({
  countryTemplate,
  activePreset,
  activePlan,
  providerPlans,
}: {
  countryTemplate: SubscriptionRegionPrice;
  activePreset: Preset;
  activePlan: SubscriptionPlan;
  providerPlans: SubscriptionPlan[];
}) {
  const activeUsReference =
    subscriptionRegionPrices.find(
      (item) =>
        item.provider === activePreset.provider &&
        item.productName === activePreset.productName &&
        item.planName === activePreset.planName &&
        item.billingCycle === activePreset.billingCycle &&
        item.countryCode === "US",
    ) ?? buildFallbackRegion(activePlan);
  const countryFactor =
    activeUsReference.convertedCNY > 0
      ? countryTemplate.convertedCNY / activeUsReference.convertedCNY
      : 1;
  const localRate = baseCnyRateFor(countryTemplate.currencyCode) ?? fxReference.rate;

  return providerPlans
    .map((plan) => {
      const exact = subscriptionRegionPrices.find(
        (item) =>
          item.provider === plan.provider &&
          item.productName === plan.productName &&
          item.planName === plan.planName &&
          item.billingCycle === plan.billingCycle &&
          item.countryCode === countryTemplate.countryCode,
      );

      if (exact) {
        return exact;
      }

      const baseCny = plan.priceCNY ?? Math.round((plan.officialPriceUSD ?? 20) * fxReference.rate);
      const convertedCNY = Number((baseCny * countryFactor).toFixed(2));

      return {
        id: `hover-${plan.id}-${countryTemplate.countryCode}`,
        provider: plan.provider,
        productName: plan.productName,
        planName: plan.planName,
        billingCycle: plan.billingCycle,
        country: countryTemplate.country,
        countryCode: countryTemplate.countryCode,
        currencyCode: countryTemplate.currencyCode,
        localPrice: Number((convertedCNY / localRate).toFixed(2)),
        convertedCNY,
        sourceLabel: "按当前地区汇率估算",
        updatedAt: plan.updatedAt,
      } satisfies SubscriptionRegionPrice;
    })
    .sort((left, right) => left.convertedCNY - right.convertedCNY);
}

function buildComparableRegions({
  preset,
  plan,
  targetCount,
}: {
  preset: Preset;
  plan: SubscriptionPlan;
  targetCount: number;
}) {
  const safeCount = Math.max(1, targetCount);
  const matched = subscriptionRegionPrices
    .filter(
      (item) =>
        item.provider === preset.provider &&
        item.productName === preset.productName &&
        item.planName === preset.planName &&
        item.billingCycle === preset.billingCycle,
    )
    .toSorted((left, right) => left.convertedCNY - right.convertedCNY);

  if (matched.length >= safeCount) {
    const cheapestSlice = matched.slice(0, Math.max(1, safeCount - 1));
    const highest = matched.at(-1);

    if (!highest || cheapestSlice.some((item) => item.countryCode === highest.countryCode)) {
      return matched.slice(0, safeCount);
    }

    return [...cheapestSlice, highest].toSorted(
      (left, right) => left.convertedCNY - right.convertedCNY,
    );
  }

  const templateByCountry = new Map<string, SubscriptionRegionPrice>();
  subscriptionRegionPrices
    .filter(
      (item) =>
        item.provider === preset.provider && item.productName === preset.productName,
    )
    .toSorted((left, right) => left.convertedCNY - right.convertedCNY)
    .forEach((item) => {
      if (!templateByCountry.has(item.countryCode)) {
        templateByCountry.set(item.countryCode, item);
      }
    });

  const templates =
    templateByCountry.size > 0
      ? Array.from(templateByCountry.values()).slice(0, safeCount)
      : [buildFallbackRegion(plan)];
  const existingByCountry = new Map(matched.map((item) => [item.countryCode, item]));
  const usTemplate = templates.find((item) => item.countryCode === "US") ?? templates[0];
  const usCny = plan.priceCNY ?? Math.round((plan.officialPriceUSD ?? 20) * fxReference.rate);
  const completed = templates.map((template) => {
    const existing = existingByCountry.get(template.countryCode);

    if (existing) {
      return existing;
    }

    const ratio = usTemplate?.convertedCNY
      ? template.convertedCNY / usTemplate.convertedCNY
      : 1;
    const convertedCNY = Number((usCny * ratio).toFixed(2));
    const baseRate = baseCnyRateFor(template.currencyCode) ?? fxReference.rate;
    const localPrice = Number((convertedCNY / baseRate).toFixed(2));

    return {
      id: `derived-${plan.id}-${template.countryCode}`,
      provider: plan.provider,
      productName: plan.productName,
      planName: plan.planName,
      billingCycle: plan.billingCycle,
      country: template.country,
      countryCode: template.countryCode,
      currencyCode: template.currencyCode,
      localPrice,
      convertedCNY,
      sourceLabel: "汇率换算估算",
      updatedAt: plan.updatedAt,
    } satisfies SubscriptionRegionPrice;
  });

  return completed.toSorted((left, right) => left.convertedCNY - right.convertedCNY);
}

function CompareEdge({
  region,
  align,
  targetCurrency,
  liveCnyRates,
  pulseKey,
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
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const displayPrice = formatTargetMoney(
    region.convertedCNY,
    targetCurrency,
    region,
    liveCnyRates,
  );

  return (
    <div
      className={cn(
        "relative flex min-h-[122px] items-center gap-2 overflow-hidden rounded-[22px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:min-h-[136px] sm:gap-3 sm:px-5",
        align === "left" &&
          "justify-start border-emerald-200/70 bg-[linear-gradient(135deg,rgba(236,255,247,0.98),rgba(222,249,236,0.9))] text-left sm:[clip-path:polygon(0_0,100%_0,86%_100%,0_100%)] dark:border-emerald-500/22 dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.42),rgba(5,46,34,0.68))]",
        align === "right" &&
          "justify-end border-orange-200/70 bg-[linear-gradient(135deg,rgba(255,247,240,0.98),rgba(255,233,224,0.9))] text-right sm:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] dark:border-orange-500/20 dark:bg-[linear-gradient(135deg,rgba(127,29,29,0.36),rgba(67,20,7,0.68))]",
      )}
    >
      {align === "left" ? (
        <CountryFlag countryCode={region.countryCode} className="h-[22px] w-[30px] sm:h-7 sm:w-9" />
      ) : null}
      <div>
        <div className={cn("text-[11px]", align === "left" ? "text-emerald-700/70 dark:text-emerald-100/76" : "text-orange-900/60 dark:text-orange-100/70")}>
          {region.country}
        </div>
        <div
          className={cn(
            "mt-1 text-[1.28rem] font-semibold tracking-[-0.03em] sm:text-[1.72rem]",
            align === "left" ? "text-emerald-500" : "text-[#7b6f69] dark:text-orange-100",
          )}
        >
          <LivePriceTick pulseKey={pulseKey}>{displayPrice}</LivePriceTick>
        </div>
        <div
          className={cn(
            "mt-1 text-[11px]",
            align === "left"
              ? "text-emerald-800/55 dark:text-emerald-100/58"
              : "text-orange-900/45 dark:text-orange-100/55",
          )}
        >
          {region.currencyCode} {formatLocalNumber(region.localPrice)}
        </div>
      </div>
      {align === "right" ? (
        <CountryFlag countryCode={region.countryCode} className="h-[22px] w-[30px] sm:h-7 sm:w-9" />
      ) : null}
    </div>
  );
}

function PriceRow({
  region,
  detailRows,
  isPinned,
  onTogglePinned,
  onClosePinned,
  highlighted,
  targetCurrency,
  liveCnyRates,
  pulseKey,
}: {
  region: SubscriptionRegionPrice;
  detailRows: SubscriptionRegionPrice[];
  isPinned: boolean;
  onTogglePinned: () => void;
  onClosePinned: () => void;
  highlighted: boolean;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const openHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPinnedRef = useRef(isPinned);

  useEffect(() => {
    isPinnedRef.current = isPinned;
  }, [isPinned]);

  const clearOpenHoverTimer = () => {
    if (!openHoverTimerRef.current) {
      return;
    }

    clearTimeout(openHoverTimerRef.current);
    openHoverTimerRef.current = null;
  };

  const clearCloseHoverTimer = () => {
    if (!closeHoverTimerRef.current) {
      return;
    }

    clearTimeout(closeHoverTimerRef.current);
    closeHoverTimerRef.current = null;
  };

  const openHover = () => {
    clearOpenHoverTimer();
    clearCloseHoverTimer();
    openHoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
      openHoverTimerRef.current = null;
    }, 70);
  };

  const scheduleCloseHover = () => {
    clearOpenHoverTimer();
    clearCloseHoverTimer();
    closeHoverTimerRef.current = setTimeout(() => {
      if (isPinnedRef.current) {
        closeHoverTimerRef.current = null;
        return;
      }
      setIsHovered(false);
      closeHoverTimerRef.current = null;
    }, 260);
  };

  useEffect(() => {
    return () => {
      clearOpenHoverTimer();
      clearCloseHoverTimer();
    };
  }, []);

  const finalPrice = formatTargetMoney(region.convertedCNY, targetCurrency, region, liveCnyRates);
  const evidence = buildEvidenceSummary(region);
  const sortedDetailRows = [...detailRows].sort(
    (left, right) => liveCnyValueFor(left, liveCnyRates) - liveCnyValueFor(right, liveCnyRates),
  );
  const hasEstimatedRows = sortedDetailRows.some((item) => item.sourceLabel.includes("估算"));
  const desktopOpen = sortedDetailRows.length > 0 && (isHovered || isPinned);
  const mobileOpen = sortedDetailRows.length > 0 && isPinned;

  return (
    <div
      className={cn("group/price-row relative", desktopOpen && "z-30")}
      onPointerEnter={openHover}
      onPointerLeave={scheduleCloseHover}
    >
      <div
        className={cn(
          "relative grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 overflow-hidden rounded-[12px] border px-2.5 py-2.5 transition-[border-color,box-shadow] duration-200 ease-out before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary before:opacity-0 before:transition-opacity before:duration-200 sm:gap-2.5 sm:px-3.5 lg:grid-cols-[1.2fr_0.9fr_0.5fr_0.7fr_auto_auto]",
          highlighted
            ? "border-primary/25 bg-primary/7 shadow-[0_12px_28px_rgba(0,188,125,0.08)]"
            : "border-border bg-background hover:border-primary/16 hover:before:opacity-100",
          (desktopOpen || mobileOpen) &&
            "border-primary/20 before:opacity-100",
        )}
        role={sortedDetailRows.length > 0 ? "button" : undefined}
        aria-expanded={sortedDetailRows.length > 0 ? desktopOpen || mobileOpen : undefined}
        aria-haspopup={sortedDetailRows.length > 0 ? "dialog" : undefined}
        tabIndex={sortedDetailRows.length > 0 ? 0 : -1}
        onFocus={openHover}
        onBlur={scheduleCloseHover}
        onClick={() => {
          if (sortedDetailRows.length > 0) {
            onTogglePinned();
          }
        }}
        onKeyDown={(event) => {
          if (sortedDetailRows.length === 0) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTogglePinned();
          }

          if (event.key === "Escape") {
            clearOpenHoverTimer();
            clearCloseHoverTimer();
            setIsHovered(false);
            onClosePinned();
          }
        }}
      >
        <div className="flex items-center gap-4">
          <CountryFlag countryCode={region.countryCode} className="h-[22px] w-[30px] sm:h-[24px] sm:w-8" />
          <div>
            <div className="text-[13px] font-semibold sm:text-sm">{region.country}</div>
            <div className="text-[11px] text-muted-foreground">{region.sourceLabel}</div>
          </div>
        </div>

        <div className="hidden text-[11px] text-muted-foreground lg:block">
          <EvidenceBadgeGroup summary={evidence} compact />
        </div>
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
          <div>
            <LivePriceTick pulseKey={pulseKey}>{finalPrice}</LivePriceTick>
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-normal text-muted-foreground lg:hidden">
            {region.currencyCode} {symbolFor(region.currencyCode)}
            {region.localPrice.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center justify-end">
          {highlighted && !(desktopOpen || mobileOpen) ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
              推荐
            </span>
          ) : (
            <ChevronRightIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-300",
                (desktopOpen || mobileOpen) && "rotate-90 text-primary",
              )}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 z-40 hidden w-[340px] max-w-[calc(100%-10rem)] -translate-y-1/2 origin-left transition-[opacity,filter] duration-200 ease-out lg:block",
          desktopOpen ? "opacity-100 blur-0" : "opacity-0 blur-[1px]",
        )}
      >
        <div>
          <MembershipPricePopover
            compact
            region={region}
            sortedDetailRows={sortedDetailRows}
            hasEstimatedRows={hasEstimatedRows}
            targetCurrency={targetCurrency}
            liveCnyRates={liveCnyRates}
            pulseKey={pulseKey}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out lg:hidden",
          mobileOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <MembershipPricePopover
            region={region}
            sortedDetailRows={sortedDetailRows}
            hasEstimatedRows={hasEstimatedRows}
            targetCurrency={targetCurrency}
            liveCnyRates={liveCnyRates}
            pulseKey={pulseKey}
          />
        </div>
      </div>
    </div>
  );
}

function MembershipPricePopover({
  region,
  sortedDetailRows,
  hasEstimatedRows,
  targetCurrency,
  liveCnyRates,
  pulseKey,
  compact = false,
}: {
  region: SubscriptionRegionPrice;
  sortedDetailRows: SubscriptionRegionPrice[];
  hasEstimatedRows: boolean;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-border/80 bg-card/95 backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,16,15,0.96),rgba(10,12,12,0.92))]",
        compact
          ? "overflow-hidden border-primary/16 p-3 shadow-[0_24px_56px_rgba(15,23,42,0.18)]"
          : "p-3.5 shadow-[0_20px_46px_rgba(15,23,42,0.1)]",
      )}
    >
      <div className={cn("mb-3 flex flex-wrap items-center justify-between gap-3", compact && "mb-2.5")}>
        <div className="flex min-w-0 items-center gap-2.5">
          <CountryFlag
            countryCode={region.countryCode}
            className={cn(compact ? "h-[22px] w-[30px]" : "h-6 w-8")}
          />
          <div className="min-w-0">
            <div
              className={cn(
                "truncate font-semibold tracking-[-0.03em] text-foreground",
                compact ? "text-[0.98rem]" : "text-[1.02rem]",
              )}
            >
              {region.country}
            </div>
            <div className="text-[11px] text-muted-foreground">
              当前厂商下全部会员价格，按 {targetCurrency} 实时换算排序
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            {sortedDetailRows.length} 个档位
          </span>
          {hasEstimatedRows ? (
            <span className="rounded-full bg-amber-400/12 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-200">
              含估算价格
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-2", compact && "space-y-1.5")}>
        {sortedDetailRows.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border",
              compact ? "px-3 py-2.5" : "px-3.5 py-3",
              index % 2 === 0
                ? "border-border/70 bg-background/80 dark:bg-white/[0.03]"
                : "border-primary/10 bg-primary/[0.05] dark:bg-primary/[0.08]",
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-[13px] font-semibold text-foreground">
                  {membershipLabelForRow(item)}
                </div>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-500/12 dark:text-sky-200">
                  {formatBillingCycle(item.billingCycle)}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {item.currencyCode} {formatLocalNumber(item.localPrice)}
              </div>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "font-semibold tracking-[-0.03em] text-foreground",
                  compact ? "text-[1rem]" : "text-[1.04rem]",
                )}
              >
                <LivePriceTick pulseKey={pulseKey}>
                  {formatTargetMoney(item.convertedCNY, targetCurrency, item, liveCnyRates)}
                </LivePriceTick>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{item.sourceLabel}</div>
            </div>
          </div>
        ))}
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
  liveCnyRates,
  pulseKey,
}: {
  group: RegionGroup;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-3.5 shadow-[0_12px_44px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CountryFlag countryCode={group.countryCode} className="h-6 w-8" />
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
              <LivePriceTick pulseKey={pulseKey}>
                {formatTargetMoney(item.convertedCNY, targetCurrency, item, liveCnyRates)}
              </LivePriceTick>
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
      "go-monthly": 1,
      "pro 5x-monthly": 2,
      "plus-yearly": 3,
      "pro 20x-monthly": 4,
      "pro-monthly": 5,
      "max 5x-monthly": 6,
      "team-yearly": 7,
      "max 20x-monthly": 8,
      "google ai pro-monthly": 9,
    }[key] ?? 20
  );
}

function membershipLabelForPreset(preset: Preset) {
  if (preset.productName === "ChatGPT") {
    return preset.planName;
  }

  if (preset.productName === "Gemini" && preset.planName === "Google AI Pro") {
    return "AI Pro";
  }

  return preset.planName;
}

function membershipLabelForRow(item: SubscriptionRegionPrice) {
  if (item.productName === "ChatGPT") {
    return `${item.productName} ${item.planName}`;
  }

  if (item.productName === "Gemini" && item.planName === "Google AI Pro") {
    return "Gemini AI Pro";
  }

  return `${item.productName} ${item.planName}`;
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
  liveCnyRates?: Record<string, number>,
) {
  if (original?.currencyCode === targetCurrency) {
    return formatCurrencyAmount(original.localPrice, targetCurrency);
  }

  const targetRate = liveCnyRates?.[targetCurrency] ?? currencyFor(targetCurrency).cnyRate;
  const nextCnyValue = original ? liveCnyValueFor(original, liveCnyRates) : cnyValue;

  return formatCurrencyAmount(nextCnyValue / targetRate, targetCurrency);
}

function formatCnyAsTargetMoney(
  cnyValue: number,
  targetCurrency: TargetCurrencyCode,
  liveCnyRates: Record<string, number>,
) {
  const targetRate = liveCnyRates[targetCurrency] ?? currencyFor(targetCurrency).cnyRate;

  return formatCurrencyAmount(cnyValue / targetRate, targetCurrency);
}

function liveCnyValueFor(
  original: {
    currencyCode: string;
    localPrice: number;
    convertedCNY?: number;
  },
  liveCnyRates?: Record<string, number>,
) {
  const baseline = original.convertedCNY ?? original.localPrice;
  const liveRate = liveCnyRates?.[original.currencyCode];
  const baseRate = baseCnyRateFor(original.currencyCode);

  if (typeof liveRate === "number" && typeof baseRate === "number" && baseRate > 0) {
    return baseline * (liveRate / baseRate);
  }

  return baseline;
}

function buildLiveCnyRates(feedRates?: Partial<Record<TargetCurrencyCode, number>>) {
  return Object.fromEntries(
    targetCurrencies.map((item) => {
      const marketBias = normalizedMarketBias(item.cnyRate, feedRates?.[item.code]);

      return [
        item.code,
        item.cnyRate * (1 + marketBias),
      ];
    }),
  );
}

function normalizeFxRates(rates?: Record<string, number>) {
  if (!rates) {
    return {};
  }

  return Object.fromEntries(
    targetCurrencies
      .map((item) => {
        const rate = rates[item.code];

        return typeof rate === "number" && Number.isFinite(rate) && rate > 0
          ? ([item.code, rate] as [TargetCurrencyCode, number])
          : undefined;
      })
      .filter((item): item is [TargetCurrencyCode, number] => Boolean(item)),
  );
}

function normalizedMarketBias(snapshotRate: number, feedRate?: number) {
  if (!feedRate || snapshotRate <= 0) {
    return 0;
  }

  const rawDelta = feedRate / snapshotRate - 1;

  return Math.max(-0.006, Math.min(0.006, rawDelta * 0.18));
}

function baseCnyRateFor(code: string) {
  return targetCurrencies.find((item) => item.code === code)?.cnyRate;
}

function LivePriceTick({
  children,
  pulseKey,
}: {
  children: ReactNode;
  pulseKey: number;
}) {
  return (
    <span key={`${pulseKey}-${String(children)}`} className="live-price-tick">
      {children}
    </span>
  );
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

function CountryFlag({ countryCode, className }: { countryCode: string; className?: string }) {
  const assetCode = countryCode.toLowerCase();

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-black/5 bg-muted text-[9px] font-semibold uppercase leading-none text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <span aria-hidden>{countryCode}</span>
      <img
        src={`https://flagcdn.com/${assetCode}.svg`}
        alt={`${countryCode} flag`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}

function symbolFor(currencyCode: string) {
  return (
    {
      CNY: "¥",
      USD: "$",
      HKD: "HK$",
      TWD: "NT$",
      SGD: "S$",
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
      BRL: "R$",
      INR: "₹",
      MXN: "MX$",
    }[currencyCode] ?? ""
  );
}

function planSummaryFor(plan: SubscriptionPlan) {
  const key = `${plan.productName}-${plan.planName}-${plan.billingCycle}`.toLowerCase();

  return (
    {
      "chatgpt-plus-monthly": "适合日常使用，覆盖常见问答、写作、轻量分析与图片生成场景。",
      "chatgpt-go-monthly": "更轻量的入门档位，适合预算敏感但希望拿到更高额度与更顺畅体验的用户。",
      "chatgpt-pro 5x-monthly":
        "面向高频使用者，强调更高消息额度与更稳定的高峰时段可用性。",
      "chatgpt-pro 20x-monthly":
        "面向最重度使用场景，适合多任务并行、长会话和更高强度的日常工作流。",
      "chatgpt-plus-yearly": "适合长期订阅用户，按年查看更方便直接比较不同地区的年度成本。",
      "claude-pro-monthly":
        "适合写作、总结、知识工作与轻量编程，是 Claude 的主力个人订阅档位。",
      "claude-max 5x-monthly":
        "适合更高频 Claude 使用者，偏向长会话、重度总结和更大的调用额度。",
      "gemini-google ai pro-monthly":
        "适合 Gemini 深度使用者，兼顾模型能力与 Google One 生态权益。",
    }[key] ?? plan.note ?? "按公开价格和复核记录持续维护。"
  );
}
