"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  startTransition,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  ChevronRightIcon,
  RefreshCcwIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { subscriptionRegionPrices } from "@/data/subscription-regions";
import { formatBillingCycle, formatDate, fxReference } from "@/lib/format";
import { defaultLocale, getLocaleFromPathname, type SiteLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan, SubscriptionRegionPrice } from "@/types";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { useSegmentedIndicator } from "@/components/ui/use-segmented-indicator";
import styles from "./subscription-explorer-effect.module.css";

type Props = {
  plans: SubscriptionPlan[];
  embedded?: boolean;
  maxRows?: number;
  disableStickyTabs?: boolean;
  initialViewMode?: ViewMode;
  persistViewInUrl?: boolean;
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
    key: "claude-max-20x",
    label: "Claude Max 20x",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Max 20x",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "claude-pro-yearly",
    label: "Claude Pro 年",
    provider: "Anthropic",
    productName: "Claude",
    planName: "Pro",
    billingCycle: "yearly",
    badge: "年",
  },
  {
    key: "gemini-ai-pro-monthly",
    label: "Google AI Pro (5 TB)",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Pro (5 TB)",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "gemini-ai-plus-monthly",
    label: "Google AI Plus (200GB)",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Plus (200GB)",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "gemini-ai-plus-yearly",
    label: "Google AI Plus (200GB)",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Plus (200GB)",
    billingCycle: "yearly",
    badge: "年",
  },
  {
    key: "gemini-ai-pro-yearly",
    label: "Google AI Pro (5 TB)",
    provider: "Google",
    productName: "Gemini",
    planName: "Google AI Pro (5 TB)",
    billingCycle: "yearly",
    badge: "年",
  },
  {
    key: "github-pro-monthly",
    label: "GitHub Pro",
    provider: "GitHub",
    productName: "GitHub",
    planName: "GitHub Pro",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "github-copilot-pro-monthly",
    label: "Copilot Pro",
    provider: "GitHub",
    productName: "GitHub",
    planName: "Copilot Pro",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "github-copilot-pro-plus-monthly",
    label: "Copilot Pro+",
    provider: "GitHub",
    productName: "GitHub",
    planName: "Copilot Pro+",
    billingCycle: "monthly",
    badge: "月",
  },
  {
    key: "github-copilot-max-monthly",
    label: "Copilot Max",
    provider: "GitHub",
    productName: "GitHub",
    planName: "Copilot Max",
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
  {
    key: "github",
    label: "GitHub",
    provider: "GitHub",
    productName: "GitHub",
  },
];

const providerLogoMap = {
  OpenAI: "/vendor-logos/openai.png",
  Anthropic: "/vendor-logos/anthropic.png",
  Google: "/vendor-logos/google.png",
  GitHub: "/vendor-logos/github.png",
} as const;

const targetCurrencies = [
  { code: "CNY", flagCode: "CN", cnyRate: 1, locale: "zh-CN" },
  { code: "USD", flagCode: "US", cnyRate: 7.25, locale: "en-US" },
  { code: "HKD", flagCode: "HK", cnyRate: 0.93, locale: "zh-HK" },
  { code: "TWD", flagCode: "TW", cnyRate: 0.22, locale: "zh-TW" },
  { code: "SGD", flagCode: "SG", cnyRate: 5.36, locale: "en-SG" },
  { code: "AUD", flagCode: "AU", cnyRate: 4.71, locale: "en-AU" },
  { code: "CAD", flagCode: "CA", cnyRate: 5.29, locale: "en-CA" },
  { code: "BRL", flagCode: "BR", cnyRate: 1.38, locale: "pt-BR" },
  { code: "EUR", flagCode: "EU", cnyRate: 7.84, locale: "de-DE" },
  { code: "GBP", flagCode: "GB", cnyRate: 9.18, locale: "en-GB" },
  { code: "JPY", flagCode: "JP", cnyRate: 0.047, locale: "ja-JP" },
  { code: "KRW", flagCode: "KR", cnyRate: 0.0053, locale: "ko-KR" },
  { code: "MXN", flagCode: "MX", cnyRate: 0.395, locale: "es-MX" },
  { code: "VND", flagCode: "VN", cnyRate: 0.00028, locale: "vi-VN" },
  { code: "TRY", flagCode: "TR", cnyRate: 0.224, locale: "tr-TR" },
  { code: "PHP", flagCode: "PH", cnyRate: 0.126, locale: "en-PH" },
  { code: "PKR", flagCode: "PK", cnyRate: 0.026, locale: "en-PK" },
  { code: "NGN", flagCode: "NG", cnyRate: 0.0049, locale: "en-NG" },
  { code: "EGP", flagCode: "EG", cnyRate: 0.145, locale: "ar-EG" },
  { code: "INR", flagCode: "IN", cnyRate: 0.087, locale: "en-IN" },
] as const;

const subscriptionViewModes = ["subscription", "best", "region"] as const;

type TargetCurrencyCode = (typeof targetCurrencies)[number]["code"];
type ViewMode = "subscription" | "region" | "best";
type BestValueMode = "lowest" | "value";
type FxFeed = {
  fetchedAt?: string;
  rates: Partial<Record<TargetCurrencyCode, number>>;
  source: "frankfurter" | "snapshot";
  updatedAt?: string;
};

const fxTickIntervalSeconds = 4;
const fxFetchIntervalMs = 30_000;
const defaultRowsPerTab = 20;
const rowHoverLockMs = 520;
const rowHoverUnlockDistancePx = 24;
const curatedBestValueProductOrder: Record<string, number> = {
  "OpenAI::ChatGPT": 0,
  "Anthropic::Claude": 1,
  "GitHub::GitHub": 2,
  "Google::Gemini": 3,
  "Quora::Poe": 4,
  "Windsurf::Windsurf": 5,
};
const curatedBestValueWinnerPlan: Record<string, string> = {
  "OpenAI::ChatGPT": "chatgpt-plus",
  "Anthropic::Claude": "claude-pro",
  "GitHub::GitHub": "github-copilot-pro",
  "Google::Gemini": "gemini-ai-plus",
  "Quora::Poe": "poe-starter",
  "Windsurf::Windsurf": "windsurf-pro",
};
const curatedBestValueRunnerUpPlan: Record<string, string> = {
  "OpenAI::ChatGPT": "chatgpt-pro-5x",
};
const curatedBestValueWinnerRegion: Record<string, string> = {
  "chatgpt-plus": "TR",
  "claude-pro": "NG",
};

const currencyLabels: Record<
  TargetCurrencyCode,
  Record<SiteLocale, string>
> = {
  CNY: { "zh-CN": "人民币", en: "Chinese Yuan" },
  USD: { "zh-CN": "美元", en: "US Dollar" },
  HKD: { "zh-CN": "港元", en: "Hong Kong Dollar" },
  TWD: { "zh-CN": "新台币", en: "Taiwan Dollar" },
  SGD: { "zh-CN": "新加坡元", en: "Singapore Dollar" },
  AUD: { "zh-CN": "澳大利亚元", en: "Australian Dollar" },
  CAD: { "zh-CN": "加拿大元", en: "Canadian Dollar" },
  BRL: { "zh-CN": "巴西雷亚尔", en: "Brazilian Real" },
  EUR: { "zh-CN": "欧元", en: "Euro" },
  GBP: { "zh-CN": "英镑", en: "British Pound" },
  JPY: { "zh-CN": "日元", en: "Japanese Yen" },
  KRW: { "zh-CN": "韩元", en: "South Korean Won" },
  MXN: { "zh-CN": "墨西哥比索", en: "Mexican Peso" },
  VND: { "zh-CN": "越南盾", en: "Vietnamese Dong" },
  TRY: { "zh-CN": "土耳其里拉", en: "Turkish Lira" },
  PHP: { "zh-CN": "菲律宾比索", en: "Philippine Peso" },
  PKR: { "zh-CN": "巴基斯坦卢比", en: "Pakistani Rupee" },
  NGN: { "zh-CN": "尼日利亚奈拉", en: "Nigerian Naira" },
  EGP: { "zh-CN": "埃及镑", en: "Egyptian Pound" },
  INR: { "zh-CN": "印度卢比", en: "Indian Rupee" },
};

function viewModeLabel(mode: ViewMode, locale: SiteLocale) {
  if (locale === "en") {
    return {
      subscription: "Plans",
      best: "Best Value",
      region: "Regions",
    }[mode];
  }

  return {
    subscription: "订阅",
    best: "最值得",
    region: "地区",
  }[mode];
}

function currencyLabel(code: TargetCurrencyCode, locale: SiteLocale) {
  return currencyLabels[code][locale];
}

function billingCycleBadge(cycle: "monthly" | "yearly", locale: SiteLocale) {
  if (locale === "en") {
    return cycle === "monthly" ? "Mo" : "Yr";
  }

  return cycle === "monthly" ? "月" : "年";
}

export function SubscriptionExplorer({
  plans,
  embedded = false,
  maxRows,
  disableStickyTabs = false,
  initialViewMode = "subscription",
  persistViewInUrl = false,
}: Props) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? defaultLocale;
  const isEnglish = locale === "en";
  const isCompact = embedded;
  const [activeProviderKey, setActiveProviderKey] = useState(providerPresets[0].key);
  const [activePresetKey, setActivePresetKey] = useState(productPresets[0].key);
  const [targetCurrency, setTargetCurrency] = useState<TargetCurrencyCode>("CNY");
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [bestValueMode, setBestValueMode] = useState<BestValueMode>("value");
  const [providerOpen, setProviderOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [suppressRowHover, setSuppressRowHover] = useState(false);
  const [requireRowHoverReentry, setRequireRowHoverReentry] = useState(false);
  const rowHoverLockedUntilRef = useRef(0);
  const rowHoverUnlockStartRef = useRef<{ x: number; y: number } | null>(null);
  const [fxTick, setFxTick] = useState(0);
  const [nextFxRefresh, setNextFxRefresh] = useState(fxTickIntervalSeconds);
  const [fxFeed, setFxFeed] = useState<FxFeed>({
    rates: {},
    source: "snapshot",
  });
  const savingsMaskIdSeed = useId();
  const savingsMaskId = `subscription-savings-mask-${savingsMaskIdSeed.replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  )}`;
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

  const resetRowHoverState = () => {
    rowHoverLockedUntilRef.current = Date.now() + rowHoverLockMs;
    rowHoverUnlockStartRef.current = null;
    setExpandedRegionId(null);
    setHoveredRegionId(null);
    setSuppressRowHover(true);
    setRequireRowHoverReentry(true);
  };

  const unlockRowHoverAfterRealMove = (event: PointerEvent<HTMLDivElement>) => {
    if (requireRowHoverReentry || !suppressRowHover || Date.now() < rowHoverLockedUntilRef.current) {
      return;
    }

    const start = rowHoverUnlockStartRef.current;

    if (!start) {
      rowHoverUnlockStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      return;
    }

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);

    if (distance >= rowHoverUnlockDistancePx) {
      rowHoverUnlockStartRef.current = null;
      setSuppressRowHover(false);
    }
  };

  const currentPlan = useMemo<SubscriptionPlan>(
    () => resolvePlanForPreset(activePreset, plans, locale),
    [activePreset, locale, plans],
  );
  const currentProviderPlans = useMemo(
    () => filteredPresets.map((item) => resolvePlanForPreset(item, plans, locale)),
    [filteredPresets, locale, plans],
  );

  const currentRegions = useMemo(
    () =>
      buildComparableRegions({
        preset: activePreset,
        plan: currentPlan,
        targetCount: targetRowsPerTab,
        locale,
      }),
    [activePreset, currentPlan, locale, targetRowsPerTab],
  );
  const liveCnyRates = useMemo(
    () => buildLiveCnyRates(fxFeed.rates),
    [fxFeed.rates],
  );
  const bestValueSummaries = useMemo(
    () => buildBestValueSummaries(plans, liveCnyRates, bestValueMode, locale),
    [plans, liveCnyRates, bestValueMode, locale],
  );
  const visibleBestValueSummaries =
    typeof maxRows === "number"
      ? bestValueSummaries.slice(0, maxRows)
      : bestValueSummaries;
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

  const description = planSummaryFor(currentPlan, locale);
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
            locale,
          }),
        ]),
      ),
    [activePreset, currentPlan, currentProviderPlans, locale, visibleRegions],
  );
  const selectedCurrency = currencyFor(targetCurrency);
  const liveCheapestCny = cheapest ? liveCnyValueFor(cheapest, liveCnyRates) : 0;
  const liveReferenceCny = referenceRegion ? liveCnyValueFor(referenceRegion, liveCnyRates) : 0;
  const liveSavingsValue = Math.max(liveReferenceCny - liveCheapestCny, 0);
  const liveSavingsPercent =
    liveReferenceCny > 0 ? Math.round((liveSavingsValue / liveReferenceCny) * 100) : 0;
  const notRecommendedThresholdCny = liveReferenceCny * 0.97;
  const trackedCurrency = targetCurrency === "CNY" ? "USD" : targetCurrency;
  const trackedBaseRate = currencyFor(trackedCurrency).cnyRate;
  const trackedLiveRate = liveCnyRates[trackedCurrency] ?? trackedBaseRate;
  const fxDeltaPercent =
    trackedBaseRate > 0 ? ((trackedLiveRate - trackedBaseRate) / trackedBaseRate) * 100 : 0;
  const fxTrend = fxDeltaPercent >= 0 ? "up" : "down";
  const fxSourceLabel = fxFeed.source === "frankfurter" ? "Frankfurter" : isEnglish ? "Snapshot" : "快照";
  const activeProviderLogo = logoForProvider(activeProvider.provider);
  const currentPlanProviderLogo = logoForProvider(currentPlan.provider);
  const handleProviderChange = (nextValue: string | null) => {
    if (!nextValue) {
      return;
    }

    resetRowHoverState();
    const nextProvider = providerPresets.find((item) => item.key === nextValue);

    if (!nextProvider) {
      return;
    }

    const nextPreset = productPresets.find(
      (item) =>
        item.provider === nextProvider.provider && item.productName === nextProvider.productName,
    );

    setActiveProviderKey(nextProvider.key);
    setProviderOpen(false);

    if (nextPreset) {
      startTransition(() => setActivePresetKey(nextPreset.key));
    }
  };

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

  const viewHrefFor = (nextMode: ViewMode) =>
    nextMode === "subscription"
      ? "/pricing/subscriptions#subscriptions-board"
      : `/pricing/subscriptions?view=${nextMode}#subscriptions-board`;

  return (
    <section
      ref={(node) => {
        stickyBoundaryRef.current = node;
      }}
      className={cn(
        embedded
          ? "px-0 py-0"
          : "rounded-[12px] border border-transparent bg-transparent px-0 py-0 shadow-none sm:border-border sm:bg-background sm:px-5 sm:py-5 lg:px-6",
        isCompact && !embedded && "py-3 sm:py-3.5",
        !embedded && "app-shell",
      )}
    >
      <AnimeReveal
        selector=":scope > *"
        stagger={90}
        className={cn(
          "grid gap-3",
          "lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-5",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-col gap-2">
            <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
              global subscription pricing
            </div>
            <AnimatedSectionTitle>
              {isEnglish ? "Subscription Pricing" : "会员订阅比价"}
            </AnimatedSectionTitle>
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
            {isEnglish
              ? "Switch currency and region to compare plans faster."
              : "选择币种与地区，查看各套餐价格对比"}
          </p>
        </div>
        <div className="order-2 flex flex-col items-center gap-1.5 text-center lg:order-2 lg:justify-self-end lg:items-end lg:text-right">
          <div className="inline-flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/18 bg-primary/[0.065] px-3 py-1.5 text-[11px] font-medium text-primary">
            <span className="live-fx-dot size-2 rounded-full bg-primary" />
            <span>{isEnglish ? "Live FX tick" : "实时汇率 tick"}</span>
            <span className="text-muted-foreground">
              {isEnglish ? "Source" : "源"} {fxSourceLabel}
            </span>
            <span className="text-foreground">
              {trackedCurrency}/CNY {fxDeltaPercent >= 0 ? "+" : ""}
              {fxDeltaPercent.toFixed(2)}%
            </span>
            {fxTrend === "up" ? (
              <TrendingUpIcon className="size-3.5" />
            ) : (
              <TrendingDownIcon className="size-3.5" />
            )}
            <span className="text-muted-foreground">
              {isEnglish ? `Refresh in ${nextFxRefresh}s` : `${nextFxRefresh}s 后刷新`}
            </span>
          </div>
        </div>
      </AnimeReveal>

      <div
        className={cn(
          "grid gap-2.5",
          isCompact ? "mt-2.5" : "mt-4",
          "sm:grid-cols-[auto_1fr_auto] sm:items-center",
        )}
      >
        <div
          role="group"
          aria-label={isEnglish ? "Subscription view switcher" : "订阅视图切换"}
          className="segmented-shell inline-flex w-full max-w-full gap-1 text-muted-foreground sm:w-fit"
        >
          {subscriptionViewModes.map((item) => {
            const isActive = viewMode === item;
            const controlClassName = cn(
              "relative z-[1] inline-flex min-h-9 min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-transparent px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-foreground/62 transition-[color,transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground",
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,188,125,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]"
                : "hover:bg-background hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]",
            );

            if (persistViewInUrl) {
              return (
                <Link
                  key={item}
                  href={viewHrefFor(item)}
                  aria-pressed={isActive}
                  data-active={isActive ? "true" : undefined}
                  onClick={() => {
                    resetRowHoverState();
                    setViewMode(item);
                  }}
                  className={controlClassName}
                >
                  {viewModeLabel(item, locale)}
                </Link>
              );
            }

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                data-active={isActive ? "true" : undefined}
                onClick={() => {
                  resetRowHoverState();
                  setViewMode(item);
                }}
                className={controlClassName}
              >
                {viewModeLabel(item, locale)}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block" />

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-row sm:items-center sm:justify-self-end">
          {viewMode !== "best" ? (
            <Select
              value={activeProvider.key}
              open={providerOpen}
              onOpenChange={(nextOpen) => {
                if (nextOpen) {
                  resetRowHoverState();
                }
                setProviderOpen(nextOpen);
              }}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger
                className={cn(
                  "w-full min-w-0 rounded-full border-primary/20 bg-card px-3 sm:w-[172px] sm:px-4",
                  isCompact ? "min-h-10" : "min-h-11",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {activeProviderLogo ? (
                    <Image
                      src={activeProviderLogo}
                      alt={`${activeProvider.label} logo`}
                      width={18}
                      height={18}
                      className="rounded-[4px] object-contain"
                    />
                  ) : null}
                  <span className="truncate font-semibold text-foreground">{activeProvider.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent
                align="end"
                alignItemWithTrigger={false}
                className="min-w-[220px] rounded-[12px] bg-popover/94 p-1 shadow-[0_22px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
              >
                <SelectGroup>
                  <SelectLabel>{isEnglish ? "Vendor" : "厂商"}</SelectLabel>
                  {providerPresets.map((item) => {
                    const logoPath = logoForProvider(item.provider);

                    return (
                      <SelectItem key={item.key} value={item.key}>
                        {logoPath ? (
                          <Image
                            src={logoPath}
                            alt={`${item.label} logo`}
                            width={18}
                            height={18}
                            className="rounded-[4px] object-contain"
                          />
                        ) : null}
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">· {item.provider}</span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className="hidden sm:block sm:w-[172px]" />
          )}

          <Select
            value={targetCurrency}
            open={currencyOpen}
            onOpenChange={(nextOpen) => {
              if (nextOpen) {
                resetRowHoverState();
              }
              setCurrencyOpen(nextOpen);
            }}
            onValueChange={(nextValue) => {
              if (nextValue) {
                resetRowHoverState();
                setTargetCurrency(nextValue as TargetCurrencyCode);
                setCurrencyOpen(false);
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full min-w-0 rounded-full border-primary/20 bg-card px-3 sm:w-[236px] sm:px-4",
                isCompact ? "min-h-10" : "min-h-11",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <CountryFlag countryCode={selectedCurrency.flagCode} className="h-4 w-5" />
                <span className="truncate font-semibold text-foreground">
                  {currencyLabel(selectedCurrency.code, locale)}
                </span>
                <span className="hidden truncate text-muted-foreground sm:inline">
                  ({selectedCurrency.code})
                </span>
              </div>
            </SelectTrigger>
            <SelectContent
              align="end"
              alignItemWithTrigger={false}
              className="max-h-[360px] min-w-[280px] rounded-[16px] bg-popover/94 p-2 shadow-[0_22px_80px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
            >
              <SelectGroup className="p-0">
                <SelectLabel className="px-3 pb-2 pt-2 text-sm font-medium text-foreground">
                  {isEnglish ? "Target Currency" : "目标货币"}
                </SelectLabel>
                {targetCurrencies.map((item) => (
                  <SelectItem
                    key={item.code}
                    value={item.code}
                    className="rounded-[16px] px-3 py-3 text-[15px]"
                  >
                    <CountryFlag countryCode={item.flagCode} className="h-4 w-5" />
                    <span className="font-semibold text-foreground">
                      {currencyLabel(item.code, locale)}
                    </span>
                    <span className="text-muted-foreground">
                      {isEnglish ? `(${item.code})` : `（${item.code}）`}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <button
            type="button"
            aria-label={isEnglish ? "Switch target currency" : "切换目标货币"}
            onClick={() => {
              resetRowHoverState();
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

      {viewMode === "subscription" ? (
        <>
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
              <div ref={presetTabsRef} className="segmented-scroll-shell min-w-0 flex-1">
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
                        resetRowHoverState();
                        startTransition(() => setActivePresetKey(preset.key));
                        scrollToStickyContent();
                      }}
                      className={cn(
                        "relative z-[1] inline-flex min-h-9 flex-none items-center gap-1.5 rounded-[14px] px-3 py-2 text-[12px] transition-[color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px sm:gap-2 sm:px-3.5 sm:text-[13px]",
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
                      {billingCycleBadge(preset.billingCycle, locale)}
                    </span>
                  ) : null}
                </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {viewMode === "subscription" && cheapest && referenceRegion ? (
        <AnimeReveal
          key={`subscription-compare-${activePreset.key}-${targetCurrency}`}
          trigger="mount"
          className="motion-surface motion-surface--green mt-3.5 overflow-hidden rounded-[18px] border border-border p-2 sm:mt-5 sm:rounded-[20px] sm:p-2.5"
        >
          <div className="relative grid grid-cols-2 items-center gap-2 py-3 sm:gap-0 sm:py-0">
            <CompareEdge
              region={cheapest}
              align="left"
              locale={locale}
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />

            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] flex -translate-y-1/2 justify-center">
              <div className="relative isolate flex w-full max-w-[108px] flex-col items-center justify-center py-0.5 text-center sm:max-w-[192px] sm:py-1.5">
                <div aria-hidden="true" className={styles.savingsLoaderBackdrop}>
                  <div className={styles.loader}>
                    <svg viewBox="0 0 100 100">
                      <defs>
                        <mask id={savingsMaskId}>
                          <polygon points="0,0 100,0 100,100 0,100" fill="black" />
                          <polygon points="25,25 75,25 50,75" fill="white" />
                          <polygon points="50,25 75,75 25,75" fill="white" />
                          <polygon points="35,35 65,35 50,65" fill="white" />
                          <polygon points="35,35 65,35 50,65" fill="white" />
                          <polygon points="35,35 65,35 50,65" fill="white" />
                          <polygon points="35,35 65,35 50,65" fill="white" />
                        </mask>
                      </defs>
                    </svg>
                    <div
                      className={styles.loaderBox}
                      style={{
                        mask: `url(#${savingsMaskId})`,
                        WebkitMask: `url(#${savingsMaskId})`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="relative z-[1] text-[0.98rem] font-semibold tracking-[-0.025em] text-orange-500 sm:text-[1.52rem]"
                  style={{ WebkitTextStroke: "1px rgba(0, 0, 0, 0.25)" }}
                >
                  <LivePriceTick pulseKey={fxTick}>{liveSavingsPercent}%</LivePriceTick>
                </div>
                <div className="relative z-[1] text-[10px] text-red sm:text-xs">
                  {isEnglish ? "Gap " : "差价 "}
                  <LivePriceTick pulseKey={fxTick}>
                    {formatCnyAsTargetMoney(liveSavingsValue, targetCurrency, liveCnyRates)}
                  </LivePriceTick>
                </div>
              </div>
            </div>

            <CompareEdge
              region={referenceRegion}
              align="right"
              locale={locale}
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />
          </div>
        </AnimeReveal>
      ) : null}

      {viewMode === "subscription" && currentPlan ? (
        <AnimeReveal
          key={`subscription-plan-${activePreset.key}-${targetCurrency}`}
          trigger="mount"
          className={cn(
            "mt-3.5 overflow-visible rounded-[12px] border border-border bg-card px-3.5 py-3.5 sm:mt-5 sm:px-4 sm:py-4",
            embedded && "border-none bg-transparent px-0 py-0 shadow-none",
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {currentPlanProviderLogo ? (
                  <Image
                    src={currentPlanProviderLogo}
                    alt={`${currentPlan.provider} logo`}
                    width={26}
                    height={26}
                    className="rounded-[6px] object-contain"
                  />
                ) : null}
                <h3 className="text-[1.15rem] font-semibold tracking-[-0.025em] sm:text-[1.28rem]">
                  {currentPlan.productName} {currentPlan.planName}
                </h3>
                <span className="rounded-[10px] bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  {formatBillingCycle(currentPlan.billingCycle, locale)}
                </span>
                {!embedded ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-[10px] font-semibold text-primary">
                    <span className="live-fx-dot size-1.5 rounded-full bg-primary" />
                    {isEnglish ? "Live Check" : "实时校验"}
                    <span className="text-muted-foreground">
                      {updatedAt ? formatDate(updatedAt, locale) : isEnglish ? "Maintained" : "持续更新"}
                    </span>
                  </span>
                ) : null}
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
              {isEnglish ? "Save" : "收藏"}
            </button>
          </div>

          <div className="mt-3.5 hidden items-center rounded-[10px] border border-border/50 bg-muted/22 px-3 py-2 text-[12px] font-semibold text-muted-foreground sm:grid sm:grid-cols-[72px_minmax(0,1fr)_136px_72px_132px_106px] sm:gap-3 sm:mt-4">
            <span className="text-center">{isEnglish ? "Rank" : "排名"}</span>
            <span>{isEnglish ? "Region" : "地区"}</span>
            <span className="text-right">{isEnglish ? "Local Price" : "原价"}</span>
            <span className="text-center">{isEnglish ? "Unit" : "单位"}</span>
            <span className="text-right">CNY</span>
            <span className="text-right">{isEnglish ? "Status" : "状态"}</span>
          </div>

          <div className="mt-2.5 flex flex-col gap-2.5">
            <div
              onPointerEnter={(event) => {
                if (requireRowHoverReentry) {
                  rowHoverUnlockStartRef.current = {
                    x: event.clientX,
                    y: event.clientY,
                  };
                  setRequireRowHoverReentry(false);
                }
              }}
              onPointerMove={unlockRowHoverAfterRealMove}
            >
              {visibleRegions.map((item, index) => (
                <PriceRow
                  key={item.id}
                  rank={index + 1}
                  region={item}
                  detailRows={hoverDetailMap.get(item.countryCode) ?? []}
                  isPinned={expandedRegionId === item.id}
                  isHovered={hoveredRegionId === item.id}
                  hoverEnabled={
                    !suppressRowHover &&
                    !providerOpen &&
                    !currencyOpen &&
                    !requireRowHoverReentry
                  }
                  popoverEnabled={
                    !suppressRowHover &&
                    !providerOpen &&
                    !currencyOpen &&
                    !requireRowHoverReentry
                  }
                  onHoverStart={() => setHoveredRegionId(item.id)}
                  onHoverEnd={() =>
                    setHoveredRegionId((current) => (current === item.id ? null : current))
                  }
                  onTogglePinned={() =>
                    setExpandedRegionId((current) => (current === item.id ? null : item.id))
                  }
                  onClosePinned={() => setExpandedRegionId(null)}
                  highlighted={index === 0}
                  notRecommended={
                    index !== 0 &&
                    liveReferenceCny > 0 &&
                    liveCnyValueFor(item, liveCnyRates) >= notRecommendedThresholdCny
                  }
                  locale={locale}
                  targetCurrency={targetCurrency}
                  liveCnyRates={liveCnyRates}
                  pulseKey={fxTick}
                />
              ))}
            </div>
          </div>

          {visibleRegions.length < currentRegions.length ? (
            <div className="mt-3 rounded-[10px] border border-dashed border-border bg-background/70 px-3 py-2 text-[11px] leading-5 text-muted-foreground sm:text-xs">
              {isEnglish
                ? `Home preview shows ${visibleRegions.length} regions. Open the full subscriptions page for the complete list and more plans.`
                : `首页仅预览前 ${visibleRegions.length} 个地区，完整列表和更多套餐可以进入会员订阅页继续查看。`}
            </div>
          ) : null}
        </AnimeReveal>
      ) : null}

      {viewMode === "region" ? (
        <AnimeReveal
          key={`region-view-${activeProvider.key}-${targetCurrency}`}
          trigger="mount"
          selector=":scope > *"
          stagger={60}
          className="mt-3.5 grid gap-3 sm:mt-5 lg:grid-cols-3"
        >
          {visibleRegionGroups.map((group) => (
            <RegionPlanCard
              key={group.countryCode}
              group={group}
              locale={locale}
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={fxTick}
            />
          ))}
          {visibleRegionGroups.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground lg:col-span-3">
              {isEnglish ? "Regional pricing is not tracked for this product yet." : "当前产品地区价格暂未收录。"}
            </div>
          ) : null}
        </AnimeReveal>
      ) : null}

      {viewMode === "best" ? (
        <AnimeReveal
          key={`best-view-${targetCurrency}-${bestValueMode}`}
          trigger="mount"
          selector=":scope > *"
          stagger={60}
          className="mt-3.5 grid gap-3 sm:mt-5"
        >
          <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-card/92 p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                best value board
              </div>
              <div className="mt-1 text-[14px] font-semibold text-foreground">
                {bestValueMode === "lowest"
                  ? isEnglish
                    ? "Sorted by lowest price"
                    : "按绝对最低价排序"
                  : isEnglish
                    ? "Sorted by best value"
                    : "按性价比排序"}
              </div>
            </div>
            <div className="inline-flex w-fit rounded-full border border-border bg-background/86 p-1">
              <button
                type="button"
                onClick={() => setBestValueMode("lowest")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  bestValueMode === "lowest"
                    ? "bg-primary text-white shadow-[0_8px_18px_rgba(0,188,125,0.22)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isEnglish ? "Lowest Price" : "绝对最低价"}
              </button>
              <button
                type="button"
                onClick={() => setBestValueMode("value")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  bestValueMode === "value"
                    ? "bg-primary text-white shadow-[0_8px_18px_rgba(0,188,125,0.22)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isEnglish ? "Best Value" : "性价比"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {visibleBestValueSummaries.map((summary, index) => (
              <BestValueCard
                key={summary.key}
                rank={index + 1}
                summary={summary}
                locale={locale}
                targetCurrency={targetCurrency}
                liveCnyRates={liveCnyRates}
                pulseKey={fxTick}
              />
            ))}
            {visibleBestValueSummaries.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground lg:col-span-2">
                {isEnglish
                  ? 'There is not enough plan pricing data yet to rank "Best Value".'
                  : "暂时还没有足够的订阅价格数据来计算“最值得”。"}
              </div>
            ) : null}
          </div>
        </AnimeReveal>
      ) : null}

      <div className={cn("mt-4 text-[11px] leading-6 text-muted-foreground sm:text-xs", embedded && "mt-3")}>
        {isEnglish
          ? `Target currency: ${currencyLabel(selectedCurrency.code, locale)} (${selectedCurrency.code}). We use Frankfurter rates first and fall back to a static snapshot if needed. The short tick is for FX movement only. Final billing still depends on the official page.`
          : `目标货币：${currencyLabel(selectedCurrency.code, locale)}（${selectedCurrency.code}）。当前优先读取 Frankfurter 参考汇率，失败时回落到静态快照；几秒级 tick 用于展示汇率波动感，真实结算价格仍请以官方页面为准。`}
      </div>
    </section>
  );
}

function buildFallbackRegion(
  plan: SubscriptionPlan,
  locale: SiteLocale = defaultLocale,
): SubscriptionRegionPrice {
  return {
    id: `${plan.id}-us`,
    provider: plan.provider,
    productName: plan.productName,
    planName: plan.planName,
    billingCycle: plan.billingCycle,
    country: locale === "en" ? "United States" : "美国",
    countryCode: "US",
    currencyCode: "USD",
    localPrice: plan.officialPriceUSD ?? 20,
    convertedCNY:
      plan.priceCNY ?? Math.round((plan.officialPriceUSD ?? 20) * fxReference.rate),
    sourceLabel: locale === "en" ? "Official Pricing" : "官方定价",
    updatedAt: plan.updatedAt,
  };
}

function resolvePlanForPreset(
  preset: Preset | undefined,
  plans: SubscriptionPlan[],
  locale: SiteLocale = defaultLocale,
) {
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
      note:
        locale === "en"
          ? "This tier is maintained from public pricing data while regional coverage is still expanding."
          : "该档位当前按公开价格整理展示，地区明细会持续补齐。",
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
      note:
        locale === "en"
          ? "This tier is maintained from public pricing data while regional coverage is still expanding."
          : "该档位当前按公开价格整理展示，地区明细会持续补齐。",
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
  locale,
}: {
  countryTemplate: SubscriptionRegionPrice;
  activePreset: Preset;
  activePlan: SubscriptionPlan;
  providerPlans: SubscriptionPlan[];
  locale: SiteLocale;
}) {
  const activeUsReference =
    subscriptionRegionPrices.find(
      (item) =>
        item.provider === activePreset.provider &&
        item.productName === activePreset.productName &&
        item.planName === activePreset.planName &&
        item.billingCycle === activePreset.billingCycle &&
        item.countryCode === "US",
    ) ?? buildFallbackRegion(activePlan, locale);
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
        sourceLabel: locale === "en" ? "Estimated by regional FX ratio" : "按当前地区汇率估算",
        updatedAt: plan.updatedAt,
      } satisfies SubscriptionRegionPrice;
    })
    .sort((left, right) => left.convertedCNY - right.convertedCNY);
}

function buildComparableRegions({
  preset,
  plan,
  targetCount,
  locale,
}: {
  preset: Preset;
  plan: SubscriptionPlan;
  targetCount: number;
  locale: SiteLocale;
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
      : [buildFallbackRegion(plan, locale)];
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
      sourceLabel: locale === "en" ? "Estimated by FX conversion" : "汇率换算估算",
      updatedAt: plan.updatedAt,
    } satisfies SubscriptionRegionPrice;
  });

  return completed.toSorted((left, right) => left.convertedCNY - right.convertedCNY);
}

function CompareEdge({
  region,
  align,
  locale,
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
  locale: SiteLocale;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const regionName = displayRegionName(region.countryCode, region.country, locale);
  const displayPrice = formatTargetMoney(
    region.convertedCNY,
    targetCurrency,
    region,
    liveCnyRates,
  );

  return (
    <div
      className={cn(
        "relative flex min-w-0 min-h-[112px] items-center gap-2 overflow-hidden rounded-[28px] border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:min-h-[136px] sm:gap-3 sm:rounded-[18px] sm:px-5 sm:py-3",
        align === "left" &&
          "justify-start border-emerald-200/70 bg-[linear-gradient(135deg,rgba(236,255,247,0.98),rgba(222,249,236,0.9))] text-left sm:[clip-path:polygon(0_0,100%_0,86%_100%,0_100%)] dark:border-emerald-500/22 dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.42),rgba(5,46,34,0.68))]",
        align === "right" &&
          "justify-end border-orange-200/70 bg-[linear-gradient(135deg,rgba(255,247,240,0.98),rgba(255,233,224,0.9))] text-right sm:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] dark:border-orange-500/20 dark:bg-[linear-gradient(135deg,rgba(127,29,29,0.36),rgba(67,20,7,0.68))]",
      )}
    >
      {align === "left" ? (
        <CountryFlag countryCode={region.countryCode} className="h-4 w-5 sm:h-7 sm:w-9" />
      ) : null}
      <div className="min-w-0">
        <div
          className={cn(
            "truncate text-[10px] sm:text-[11px]",
            align === "left"
              ? "text-emerald-700/70 dark:text-emerald-100/76"
              : "text-orange-900/60 dark:text-orange-100/70",
          )}
        >
          {regionName}
        </div>
        <div
          className={cn(
            "mt-1 truncate text-[1rem] font-semibold tracking-[-0.03em] sm:text-[1.72rem]",
            align === "left" ? "text-emerald-500" : "text-[#7b6f69] dark:text-orange-100",
          )}
        >
          <LivePriceTick pulseKey={pulseKey}>{displayPrice}</LivePriceTick>
        </div>
        <div
          className={cn(
            "mt-1 truncate text-[10px] sm:text-[11px]",
            align === "left"
              ? "text-emerald-800/55 dark:text-emerald-100/58"
              : "text-orange-900/45 dark:text-orange-100/55",
          )}
        >
          {region.currencyCode} {formatLocalNumber(region.localPrice)}
        </div>
      </div>
      {align === "right" ? (
        <CountryFlag countryCode={region.countryCode} className="h-4 w-5 sm:h-7 sm:w-9" />
      ) : null}
    </div>
  );
}

function PriceRow({
  rank,
  region,
  detailRows,
  isPinned,
  isHovered,
  hoverEnabled,
  popoverEnabled,
  onHoverStart,
  onHoverEnd,
  onTogglePinned,
  onClosePinned,
  highlighted,
  notRecommended,
  locale,
  targetCurrency,
  liveCnyRates,
  pulseKey,
}: {
  rank: number;
  region: SubscriptionRegionPrice;
  detailRows: SubscriptionRegionPrice[];
  isPinned: boolean;
  isHovered: boolean;
  hoverEnabled: boolean;
  popoverEnabled: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onTogglePinned: () => void;
  onClosePinned: () => void;
  highlighted: boolean;
  notRecommended: boolean;
  locale: SiteLocale;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const regionName = displayRegionName(region.countryCode, region.country, locale);
  const finalPrice = formatTargetMoney(region.convertedCNY, targetCurrency, region, liveCnyRates);
  const sortedDetailRows = [...detailRows].sort(
    (left, right) => liveCnyValueFor(left, liveCnyRates) - liveCnyValueFor(right, liveCnyRates),
  );
  const hasEstimatedRows = sortedDetailRows.some((item) =>
    locale === "en" ? item.sourceLabel.toLowerCase().includes("estimate") : item.sourceLabel.includes("估算"),
  );
  const desktopOpen = popoverEnabled && sortedDetailRows.length > 0 && (isHovered || isPinned);
  const mobileOpen = popoverEnabled && sortedDetailRows.length > 0 && isPinned;

  return (
    <div
      className={cn("group/price-row relative", desktopOpen && "z-30")}
      onPointerMove={() => {
        if (hoverEnabled && !isHovered && !isPinned) {
          onHoverStart();
        }
      }}
      onPointerLeave={onHoverEnd}
    >
      <div
        className={cn(
          "relative grid grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2 overflow-hidden rounded-none border px-2.5 py-2.5 transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary before:opacity-0 before:transition-opacity before:duration-300 sm:grid-cols-[72px_minmax(0,1fr)_136px_72px_132px_106px] sm:gap-3 sm:px-3.5",
          highlighted
            ? "border-primary/16 bg-primary/5 shadow-[0_8px_18px_rgba(0,188,125,0.05)]"
            : "border-border/55 bg-background hover:border-primary/12 hover:before:opacity-100",
          (desktopOpen || mobileOpen) &&
            "border-primary/14 before:opacity-100",
        )}
        role={sortedDetailRows.length > 0 ? "button" : undefined}
        aria-expanded={sortedDetailRows.length > 0 ? desktopOpen || mobileOpen : undefined}
        aria-haspopup={sortedDetailRows.length > 0 ? "dialog" : undefined}
        tabIndex={sortedDetailRows.length > 0 ? 0 : -1}
        onFocus={() => {
          if (hoverEnabled) {
            onHoverStart();
          }
        }}
        onBlur={onHoverEnd}
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
            onHoverEnd();
            onClosePinned();
          }
        }}
      >
        <div className="text-center text-[1.06rem] font-semibold tabular-nums tracking-[-0.02em] text-muted-foreground sm:text-[1.14rem]">
          {rank}
        </div>

        <div className="flex items-center gap-4">
          <CountryFlag countryCode={region.countryCode} className="h-[22px] w-[30px] sm:h-[24px] sm:w-8" />
          <div>
            <div className="text-[13px] font-semibold sm:text-sm">{regionName}</div>
          </div>
        </div>

        <div className="hidden text-right text-[0.98rem] font-semibold tracking-[-0.03em] text-foreground sm:block">
          {symbolFor(region.currencyCode)}
          {region.localPrice.toFixed(2)}
        </div>

        <div className="hidden text-center text-[11px] font-medium tracking-normal text-muted-foreground sm:block">
          {region.currencyCode}
        </div>

        <div
          className={cn(
            "text-right text-[1rem] font-semibold tracking-[-0.025em] sm:text-[1.05rem]",
            highlighted ? "text-primary" : "text-foreground",
          )}
        >
          <div>
            <LivePriceTick pulseKey={pulseKey}>{finalPrice}</LivePriceTick>
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-normal text-muted-foreground sm:hidden">
            {region.currencyCode} {symbolFor(region.currencyCode)}
            {region.localPrice.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          {highlighted ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
              {locale === "en" ? "Top Pick" : "推荐"}
            </span>
          ) : notRecommended ? (
            <span className="rounded-full border border-rose-300/70 bg-rose-50/80 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
              {locale === "en" ? "Skip" : "不推荐"}
            </span>
          ) : null}
          <ChevronRightIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              (desktopOpen || mobileOpen) && "rotate-90 text-primary",
            )}
          />
        </div>
      </div>

      {popoverEnabled && desktopOpen ? (
        <div
          className={cn(
            "subscription-popover-shell pointer-events-none absolute left-4 top-1/2 z-40 hidden w-[340px] max-w-[calc(100%-10rem)] lg:block",
            "subscription-popover-open",
          )}
        >
          <div>
            <MembershipPricePopover
              compact
              region={region}
              sortedDetailRows={sortedDetailRows}
              hasEstimatedRows={hasEstimatedRows}
              locale={locale}
              targetCurrency={targetCurrency}
              liveCnyRates={liveCnyRates}
              pulseKey={pulseKey}
            />
          </div>
        </div>
      ) : null}

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
            locale={locale}
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
  locale,
  targetCurrency,
  liveCnyRates,
  pulseKey,
  compact = false,
}: {
  region: SubscriptionRegionPrice;
  sortedDetailRows: SubscriptionRegionPrice[];
  hasEstimatedRows: boolean;
  locale: SiteLocale;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
  compact?: boolean;
}) {
  const regionName = displayRegionName(region.countryCode, region.country, locale);
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
              {regionName}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {locale === "en"
                ? `All plan prices for this vendor, sorted by live ${targetCurrency} conversion`
                : `当前厂商下全部会员价格，按 ${targetCurrency} 实时换算排序`}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            {locale === "en" ? `${sortedDetailRows.length} tiers` : `${sortedDetailRows.length} 个档位`}
          </span>
          {hasEstimatedRows ? (
            <span className="rounded-full bg-amber-400/12 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-200">
              {locale === "en" ? "Includes estimates" : "含估算价格"}
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
                  {formatBillingCycle(item.billingCycle, locale)}
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
              <div className="mt-1 text-[10px] text-muted-foreground">
                {formatDate(item.updatedAt, locale)}
              </div>
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

type BestValueSummary = {
  key: string;
  provider: string;
  productName: string;
  bestValueScore: number;
  winner: {
    plan: SubscriptionPlan;
    region: SubscriptionRegionPrice;
    liveCny: number;
    valueScore: number;
  };
  runnerUp?: {
    plan: SubscriptionPlan;
    region: SubscriptionRegionPrice;
    liveCny: number;
    valueScore: number;
  };
  variantCount: number;
};

function RegionPlanCard({
  group,
  locale,
  targetCurrency,
  liveCnyRates,
  pulseKey,
}: {
  group: RegionGroup;
  locale: SiteLocale;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const regionName = displayRegionName(group.countryCode, group.country, locale);
  return (
    <div className="rounded-[12px] border border-border bg-card p-3.5 shadow-[0_12px_44px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CountryFlag countryCode={group.countryCode} className="h-6 w-8" />
          <h3 className="truncate text-[1.05rem] font-semibold tracking-[-0.025em]">
            {regionName}
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {locale === "en" ? `${group.prices.length} prices` : `${group.prices.length} 个价格`}
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
                {item.productName} {item.planName} - {formatBillingCycle(item.billingCycle, locale)}
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

function BestValueCard({
  rank,
  summary,
  locale,
  targetCurrency,
  liveCnyRates,
  pulseKey,
}: {
  rank: number;
  summary: BestValueSummary;
  locale: SiteLocale;
  targetCurrency: TargetCurrencyCode;
  liveCnyRates: Record<string, number>;
  pulseKey: number;
}) {
  const logoPath = logoForProvider(summary.provider);
  const winnerRegionName = displayRegionName(
    summary.winner.region.countryCode,
    summary.winner.region.country,
    locale,
  );
  const runnerUpRegionName = summary.runnerUp
    ? displayRegionName(
        summary.runnerUp.region.countryCode,
        summary.runnerUp.region.country,
        locale,
      )
    : null;
  const bestDisplayPrice = formatTargetMoney(
    summary.winner.region.convertedCNY,
    targetCurrency,
    summary.winner.region,
    liveCnyRates,
  );
  const runnerUpDisplayPrice = summary.runnerUp
    ? formatTargetMoney(
        summary.runnerUp.region.convertedCNY,
        targetCurrency,
        summary.runnerUp.region,
        liveCnyRates,
      )
    : null;
  const runnerUpDelta = summary.runnerUp
    ? summary.runnerUp.liveCny - summary.winner.liveCny
    : 0;
  const deltaVsRunnerUp = Math.abs(runnerUpDelta);
  const comparisonStat =
    deltaVsRunnerUp === 0
      ? {
          label: locale === "en" ? "Price Gap" : "价差对比",
          value: locale === "en" ? "Currently tied" : "当前并列",
        }
      : runnerUpDelta >= 0
        ? {
            label: locale === "en" ? "Savings Edge" : "价差优势",
            value:
              locale === "en"
                ? `Save ${formatCnyAsTargetMoney(deltaVsRunnerUp, targetCurrency, liveCnyRates)}`
                : `省 ${formatCnyAsTargetMoney(deltaVsRunnerUp, targetCurrency, liveCnyRates)}`,
          }
        : {
            label: locale === "en" ? "Plan Role" : "方案定位",
            value: locale === "en" ? "Higher-tier pick" : "高阶档位",
          };
  const runnerUpTitle =
    deltaVsRunnerUp === 0
      ? locale === "en"
        ? "Same-price alternative"
        : "同价备选"
      : runnerUpDelta >= 0
        ? locale === "en"
          ? "Runner-up option"
          : "次优选择"
        : locale === "en"
          ? "Cheaper alternative"
          : "更省钱的选择";

  return (
    <div className="rounded-[24px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(246,251,248,0.95))] p-4 shadow-[0_22px_56px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(10,15,14,0.97),rgba(11,18,16,0.93))]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            {logoPath ? (
              <Image
                src={logoPath}
                alt={`${summary.provider} logo`}
                width={24}
                height={24}
                className="rounded-[6px] object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {summary.provider}
              </div>
              <h3 className="truncate text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[1.12rem]">
                {summary.productName}
              </h3>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            TOP {rank}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            {locale === "en"
              ? `${summary.variantCount} tiers tracked`
              : `已收录 ${summary.variantCount} 档`}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-primary/14 bg-[linear-gradient(135deg,rgba(0,188,125,0.12),rgba(0,188,125,0.04))] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-background/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            most worth
          </span>
          <span className="text-[11px] text-muted-foreground">
            {locale === "en" ? "Best value plan type" : "最值得的会员类型"}
          </span>
        </div>

        <div className="mt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-foreground">
          {membershipLabelForPlan(summary.winner.plan)}
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-muted-foreground">
            {locale === "en" ? "Best landed price" : "最低到手价"}
          </div>
          <div className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.06em] text-primary sm:text-[2.45rem]">
            <LivePriceTick pulseKey={pulseKey}>{bestDisplayPrice}</LivePriceTick>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <BestValueStat
            label={locale === "en" ? "Region" : "对应地区"}
            value={winnerRegionName}
          />
          <BestValueStat
            label={locale === "en" ? "Billing" : "订阅周期"}
            value={formatBillingCycle(summary.winner.plan.billingCycle, locale)}
          />
          <BestValueStat
            label={locale === "en" ? "Local Price" : "本地价格"}
            value={`${summary.winner.region.currencyCode} ${formatLocalNumber(summary.winner.region.localPrice)}`}
          />
          <BestValueStat
            label={comparisonStat.label}
            value={comparisonStat.value}
          />
        </div>

        {summary.winner.plan.sourceUrl || summary.winner.plan.relatedArticleUrl ? (
          <div className="flex flex-wrap gap-2 pt-3">
            {summary.winner.plan.sourceUrl ? (
              <Link
                href={summary.winner.plan.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-background/82 px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {locale === "en" ? "Official Pricing" : "查看官方价格页"}
                <ChevronRightIcon className="size-3.5" />
              </Link>
            ) : null}
            {summary.winner.plan.relatedArticleUrl ? (
              <Link
                href={summary.winner.plan.relatedArticleUrl}
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/72 px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-primary/28 hover:text-primary"
              >
                {locale === "en"
                  ? "Read Full Guide"
                  : (summary.winner.plan.relatedArticleLabel ?? "查看详细攻略")}
                <ChevronRightIcon className="size-3.5" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {summary.runnerUp ? (
        <div className="mt-3 rounded-[18px] border border-border/70 bg-background/75 px-3.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-muted-foreground">{runnerUpTitle}</div>
              <div className="mt-1 truncate text-[13px] font-semibold text-foreground">
                {membershipLabelForPlan(summary.runnerUp.plan)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>{runnerUpRegionName}</span>
                <span className="text-border">/</span>
                <span>{formatBillingCycle(summary.runnerUp.plan.billingCycle, locale)}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                <LivePriceTick pulseKey={pulseKey}>{runnerUpDisplayPrice}</LivePriceTick>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {runnerUpDelta >= 0
                  ? locale === "en"
                    ? "Higher than winner by"
                    : "比当前贵"
                  : locale === "en"
                    ? "Lower than winner by"
                    : "比当前便宜"}{" "}
                {formatCnyAsTargetMoney(deltaVsRunnerUp, targetCurrency, liveCnyRates)}
              </div>
            </div>
          </div>

          {summary.runnerUp.plan.sourceUrl || summary.runnerUp.plan.relatedArticleUrl ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {summary.runnerUp.plan.sourceUrl ? (
                <Link
                  href={summary.runnerUp.plan.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary transition-colors hover:text-foreground"
                >
                  {locale === "en" ? "Runner-up Official Page" : "查看次优官方页"}
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              ) : null}
              {summary.runnerUp.plan.relatedArticleUrl ? (
                <Link
                  href={summary.runnerUp.plan.relatedArticleUrl}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {locale === "en"
                    ? "Read Full Guide"
                    : (summary.runnerUp.plan.relatedArticleLabel ?? "查看详细攻略")}
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BestValueStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/65 bg-background/84 px-2.5 py-1.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-semibold text-foreground">{value}</span>
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

function buildBestValueSummaries(
  plans: SubscriptionPlan[],
  liveCnyRates: Record<string, number>,
  mode: BestValueMode,
  locale: SiteLocale = defaultLocale,
) {
  const groups = new Map<string, SubscriptionPlan[]>();

  plans.forEach((plan) => {
    const key = `${plan.provider}::${plan.productName}`;
    const existing = groups.get(key) ?? [];
    existing.push(plan);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .map(([key, groupPlans]) => {
      const rankedByScore = groupPlans
        .map((plan) => {
          const region = buildCheapestRegionForPlan(
            plan,
            mode === "value" ? curatedBestValueWinnerRegion[plan.id] : undefined,
            locale,
          );
          const valueScore = bestValueScoreFor(plan, region, liveCnyRates);
          return {
            plan,
            region,
            liveCny: liveCnyValueFor(region, liveCnyRates),
            valueScore,
          };
        })
        .sort((left, right) =>
          mode === "value"
            ? left.valueScore - right.valueScore || left.liveCny - right.liveCny
            : left.liveCny - right.liveCny,
        );
      const featuredPlanId =
        mode === "value" ? curatedBestValueWinnerPlan[key] : undefined;
      const runnerUpPlanId =
        mode === "value" ? curatedBestValueRunnerUpPlan[key] : undefined;
      const ranked =
        featuredPlanId == null
          ? rankedByScore
          : [...rankedByScore].sort((left, right) => {
              const leftFeatured = left.plan.id === featuredPlanId ? 1 : 0;
              const rightFeatured = right.plan.id === featuredPlanId ? 1 : 0;
              const leftRunnerUp = left.plan.id === runnerUpPlanId ? 1 : 0;
              const rightRunnerUp = right.plan.id === runnerUpPlanId ? 1 : 0;

              return (
                rightFeatured - leftFeatured ||
                rightRunnerUp - leftRunnerUp ||
                left.valueScore - right.valueScore ||
                left.liveCny - right.liveCny
              );
            });
      const winner =
        featuredPlanId == null
          ? ranked[0]
          : ranked.find((item) => item.plan.id === featuredPlanId) ?? ranked[0];
      const runnerUp =
        runnerUpPlanId == null
          ? ranked.find((item) => item.plan.id !== winner?.plan.id)
          : ranked.find((item) => item.plan.id === runnerUpPlanId) ??
            ranked.find((item) => item.plan.id !== winner?.plan.id);

      return {
        key,
        provider: groupPlans[0]?.provider ?? "",
        productName: groupPlans[0]?.productName ?? "",
        bestValueScore: winner?.valueScore ?? Number.POSITIVE_INFINITY,
        winner,
        runnerUp,
        variantCount: groupPlans.length,
      } satisfies BestValueSummary;
    })
    .filter((item) => Boolean(item.winner))
    .sort((left, right) =>
      mode === "value"
        ? (curatedBestValueProductOrder[left.key] ?? 99) -
            (curatedBestValueProductOrder[right.key] ?? 99) ||
          left.bestValueScore - right.bestValueScore ||
          left.winner.liveCny - right.winner.liveCny
        : left.winner.liveCny - right.winner.liveCny,
    );
}

function buildCheapestRegionForPlan(
  plan: SubscriptionPlan,
  preferredCountryCode?: string,
  locale: SiteLocale = defaultLocale,
) {
  const matches = subscriptionRegionPrices.filter(
    (item) =>
      item.provider === plan.provider &&
      item.productName === plan.productName &&
      item.planName === plan.planName &&
      item.billingCycle === plan.billingCycle,
  );

  const preferredRegion =
    preferredCountryCode == null
      ? undefined
      : matches.find((item) => item.countryCode === preferredCountryCode);

  return (
    preferredRegion ??
    matches.sort((left, right) => left.convertedCNY - right.convertedCNY)[0] ??
    buildFallbackRegion(plan, locale)
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
      "google ai plus (200gb)-monthly": 9,
      "google ai pro (5 tb)-monthly": 10,
      "google ai plus (200gb)-yearly": 11,
      "google ai pro (5 tb)-yearly": 12,
      "github pro-monthly": 13,
      "copilot pro-monthly": 14,
      "copilot pro+-monthly": 15,
      "copilot max-monthly": 16,
      "individual-monthly": 17,
      "teams-monthly": 18,
    }[key] ?? 20
  );
}

function membershipLabelForPreset(preset: Preset) {
  if (preset.productName === "ChatGPT") {
    return preset.planName;
  }

  return preset.planName;
}

function membershipLabelForRow(item: SubscriptionRegionPrice) {
  if (item.productName === "ChatGPT") {
    return `${item.productName} ${item.planName}`;
  }

  return `${item.productName} ${item.planName}`;
}

function membershipLabelForPlan(plan: SubscriptionPlan) {
  if (plan.bestValueLabel) {
    return plan.bestValueLabel;
  }

  if (plan.productName === "ChatGPT") {
    return `${plan.productName} ${plan.planName}`;
  }

  return `${plan.productName} ${plan.planName}`;
}

function bestValueScoreFor(
  plan: SubscriptionPlan,
  region: SubscriptionRegionPrice,
  liveCnyRates: Record<string, number>,
) {
  const monthlyEquivalent =
    liveCnyValueFor(region, liveCnyRates) / (plan.billingCycle === "yearly" ? 12 : 1);
  const tags = new Set(plan.tags.map((item) => item.toLowerCase()));
  let multiplier = 1;

  if (tags.has("entry")) multiplier -= 0.12;
  if (tags.has("popular")) multiplier -= 0.08;
  if (tags.has("general")) multiplier -= 0.05;
  if (tags.has("official")) multiplier -= 0.03;
  if (tags.has("annual")) multiplier -= 0.02;
  if (tags.has("power-user")) multiplier += 0.16;
  if (tags.has("high-usage")) multiplier += 0.14;
  if (tags.has("max")) multiplier += 0.18;
  if (tags.has("app-tier")) multiplier += 0.08;

  return monthlyEquivalent * multiplier;
}

function logoForProvider(provider: string) {
  return providerLogoMap[provider as keyof typeof providerLogoMap];
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

function displayRegionName(
  countryCode: string,
  fallback: string,
  locale: SiteLocale = defaultLocale,
) {
  if (locale !== "en") {
    return fallback;
  }

  if (countryCode === "TW") {
    return "Taiwan";
  }

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function CountryFlag({ countryCode, className }: { countryCode: string; className?: string }) {
  if (countryCode === "TW") {
    return (
      <span
        aria-label="region"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[3px] border border-black/5 bg-muted text-[9px] font-semibold uppercase leading-none text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
          className,
        )}
      >
        --
      </span>
    );
  }

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

function planSummaryFor(
  plan: SubscriptionPlan,
  locale: SiteLocale = defaultLocale,
) {
  const key = `${plan.productName}-${plan.planName}-${plan.billingCycle}`.toLowerCase();

  if (locale === "en") {
    return (
      {
        "chatgpt-plus-monthly": "Best for everyday chat, writing, light analysis, and image generation.",
        "chatgpt-go-monthly": "A lighter entry tier for tighter budgets that still want smoother daily usage.",
        "chatgpt-pro 5x-monthly":
          "Built for higher-frequency users who need more headroom and steadier peak-hour access.",
        "chatgpt-pro 20x-monthly":
          "Designed for the heaviest workflows with parallel tasks, long chats, and dense daily usage.",
        "chatgpt-plus-yearly": "Useful for long-term subscribers who want an easier annual cost comparison by region.",
        "claude-pro-monthly":
          "Claude's main personal plan for writing, synthesis, knowledge work, and lighter coding.",
        "claude-max 5x-monthly":
          "A better fit for heavier Claude usage, especially longer chats and bigger document work.",
        "claude-max 20x-monthly":
          "For the most intensive Claude workloads, including long context and frequent deep reasoning.",
        "claude-pro-yearly":
          "Good for steady long-term Claude usage when annual billing helps reduce renewal overhead.",
        "gemini-google ai plus (200gb)-monthly":
          "A lighter Gemini + Google One entry tier for casual everyday use.",
        "gemini-google ai plus (200gb)-yearly":
          "A lower-cost annual option for steady but lighter Gemini usage.",
        "gemini-google ai pro (5 tb)-monthly":
          "A stronger Gemini tier for heavier model use plus broader Google ecosystem benefits.",
        "gemini-google ai pro (5 tb)-yearly":
          "A better fit for year-round heavy Gemini usage and annual budgeting.",
        "github-github pro-monthly":
          "More about developer account upgrades and platform-level benefits than coding assistance alone.",
        "github-copilot pro-monthly":
          "The core personal Copilot tier for everyday coding assistance and medium-intensity workflows.",
        "github-copilot pro+-monthly":
          "A better match for heavier advanced-model usage and more persistent agent workflows.",
        "github-copilot max-monthly":
          "The highest-intensity Copilot option for multi-repo work, long sessions, and heavier reviews.",
      }[key] ?? "Maintained with public pricing and review records."
    );
  }

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
      "claude-max 20x-monthly":
        "面向最重度的 Claude 使用场景，适合并行任务、超长上下文和高频深度推理。",
      "claude-pro-yearly":
        "适合长期稳定使用 Claude 的用户，年付常用于降低整体订阅成本并减少续费管理频次。",
      "gemini-google ai plus (200gb)-monthly":
        "适合入门体验 Gemini 与 Google One 生态，适配轻量日常使用场景。",
      "gemini-google ai plus (200gb)-yearly":
        "适合长期低预算订阅场景，按年计费常用于降低总成本。",
      "gemini-google ai pro (5 tb)-monthly":
        "适合 Gemini 深度使用者，兼顾模型能力与 Google One 生态权益。",
      "gemini-google ai pro (5 tb)-yearly":
        "适合长期重度使用 Gemini 的用户，年付更便于年度预算管理。",
      "github-github pro-monthly":
        "偏向开发者账号权益升级，适合需要更高平台能力和账号级扩展权益的用户。",
      "github-copilot pro-monthly":
        "适合日常编码辅助与中等强度 AI 编程场景，是 Copilot 的主力个人档位。",
      "github-copilot pro+-monthly":
        "适合高频使用高级模型与智能体流程的个人用户，面向更高额度的持续工作流。",
      "github-copilot max-monthly":
        "面向最高强度的 Copilot 使用场景，适合多仓并行、长会话与重度代码审查。",
    }[key] ?? plan.note ?? "按公开价格和复核记录持续维护。"
  );
}
