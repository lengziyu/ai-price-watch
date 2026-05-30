import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercentIcon,
  BookTextIcon,
  BotIcon,
  BriefcaseBusinessIcon,
  ChartNoAxesColumnIncreasingIcon,
  CompassIcon,
  CrownIcon,
  GiftIcon,
  Globe2Icon,
  Layers3Icon,
  SparklesIcon,
  TicketsIcon,
} from "lucide-react";

import type { SiteLocale } from "@/lib/i18n";

type ShowcaseVariant =
  | "subscriptions"
  | "tokens"
  | "rates"
  | "deals"
  | "use-cases"
  | "tools"
  | "about";

type ShowcaseConfig = {
  eyebrow: string;
  title: string;
  rows: Array<{ label: string; value: string }>;
  focusLabel: string;
  focusValue: string;
  focusIcon: LucideIcon;
  leftChip: {
    icon: LucideIcon;
    label: string;
  };
  rightChip: {
    icon: LucideIcon;
    label: string;
  };
  strip: string[];
  glow: string;
  secondaryGlow: string;
  focusStart: string;
  focusEnd: string;
  chipTint: string;
};

const showcaseMap: Record<ShowcaseVariant, ShowcaseConfig> = {
  subscriptions: {
    eyebrow: "global subscription board",
    title: "地区 / 币种 / 周期",
    rows: [
      { label: "ChatGPT Plus", value: "TR ¥76.11" },
      { label: "Claude Pro", value: "US $20" },
      { label: "Gemini AI Pro", value: "学生 1 年" },
    ],
    focusLabel: "最大价差",
    focusValue: "59%",
    focusIcon: CrownIcon,
    leftChip: { icon: Globe2Icon, label: "8+ 地区" },
    rightChip: { icon: BadgePercentIcon, label: "汇率折算" },
    strip: ["Plus", "Pro", "Team", "Max"],
    glow: "rgba(0, 188, 125, 0.24)",
    secondaryGlow: "rgba(34, 211, 238, 0.14)",
    focusStart: "#bbf7d0",
    focusEnd: "#00bc7d",
    chipTint: "rgba(0, 188, 125, 0.32)",
  },
  tokens: {
    eyebrow: "token cost snapshot",
    title: "输入 / 输出 / 缓存输入",
    rows: [
      { label: "GPT-5.4 mini", value: "$0.18 / $0.72" },
      { label: "Claude Sonnet", value: "$3 / $15" },
      { label: "Gemini Flash", value: "free / paid" },
    ],
    focusLabel: "1M 输入",
    focusValue: "$0.18",
    focusIcon: ChartNoAxesColumnIncreasingIcon,
    leftChip: { icon: Layers3Icon, label: "1M tokens" },
    rightChip: { icon: SparklesIcon, label: "cache -75%" },
    strip: ["input", "output", "cached", "vision"],
    glow: "rgba(20, 184, 166, 0.22)",
    secondaryGlow: "rgba(59, 130, 246, 0.16)",
    focusStart: "#d9f7ff",
    focusEnd: "#2dd4bf",
    chipTint: "rgba(34, 211, 238, 0.28)",
  },
  rates: {
    eyebrow: "official + community rates",
    title: "多厂商会员速率面板",
    rows: [
      { label: "OpenAI", value: "5h / weekly" },
      { label: "Claude", value: "fair use" },
      { label: "Cursor", value: "agent quota" },
    ],
    focusLabel: "多厂商",
    focusValue: "Tabs",
    focusIcon: SparklesIcon,
    leftChip: { icon: BookTextIcon, label: "官方口径" },
    rightChip: { icon: BotIcon, label: "社区体感" },
    strip: ["OpenAI", "Claude", "Gemini", "Cursor"],
    glow: "rgba(0, 188, 125, 0.22)",
    secondaryGlow: "rgba(96, 165, 250, 0.16)",
    focusStart: "#e2f8ef",
    focusEnd: "#34d399",
    chipTint: "rgba(52, 211, 153, 0.28)",
  },
  deals: {
    eyebrow: "verified promos",
    title: "试用 / 学生 / 免费额度",
    rows: [
      { label: "Google AI Pro", value: "1 年学生权益" },
      { label: "Cursor Hobby", value: "$0 / month" },
      { label: "Gemini API", value: "Free Tier" },
    ],
    focusLabel: "最值入口",
    focusValue: "Free",
    focusIcon: GiftIcon,
    leftChip: { icon: TicketsIcon, label: "官方活动" },
    rightChip: { icon: BadgePercentIcon, label: "低风险" },
    strip: ["trial", "student", "credit", "region"],
    glow: "rgba(251, 191, 36, 0.18)",
    secondaryGlow: "rgba(0, 188, 125, 0.12)",
    focusStart: "#fef3c7",
    focusEnd: "#fbbf24",
    chipTint: "rgba(245, 158, 11, 0.24)",
  },
  "use-cases": {
    eyebrow: "fit by workflow",
    title: "按任务选模型组合",
    rows: [
      { label: "写代码", value: "Cursor + GPT-5.5" },
      { label: "写作", value: "Claude 4.6 + GPT-5.4 mini" },
      { label: "学习", value: "NotebookLM + Gemini 3.1 Pro" },
    ],
    focusLabel: "场景优先",
    focusValue: "省预算",
    focusIcon: CompassIcon,
    leftChip: { icon: BriefcaseBusinessIcon, label: "办公" },
    rightChip: { icon: BookTextIcon, label: "学习" },
    strip: ["coding", "writing", "study", "media"],
    glow: "rgba(129, 140, 248, 0.18)",
    secondaryGlow: "rgba(0, 188, 125, 0.12)",
    focusStart: "#e9e5ff",
    focusEnd: "#a78bfa",
    chipTint: "rgba(129, 140, 248, 0.24)",
  },
  tools: {
    eyebrow: "tool directory",
    title: "先找方向再看价格",
    rows: [
      { label: "写作工具", value: "Claude / Notion AI" },
      { label: "编程工具", value: "Cursor / Windsurf" },
      { label: "研究工具", value: "NotebookLM / Perplexity" },
    ],
    focusLabel: "快速导航",
    focusValue: "Tools",
    focusIcon: Layers3Icon,
    leftChip: { icon: CompassIcon, label: "按场景" },
    rightChip: { icon: Globe2Icon, label: "按定位" },
    strip: ["coding", "writing", "research", "office"],
    glow: "rgba(0, 188, 125, 0.18)",
    secondaryGlow: "rgba(59, 130, 246, 0.12)",
    focusStart: "#dcfce7",
    focusEnd: "#4ade80",
    chipTint: "rgba(74, 222, 128, 0.24)",
  },
  about: {
    eyebrow: "product note",
    title: "数据原则 / 维护方式",
    rows: [
      { label: "只收官方源", value: "保留来源链接" },
      { label: "复核时间", value: "每条数据带日期" },
      { label: "维护方式", value: "公开来源 + 复核" },
    ],
    focusLabel: "核心原则",
    focusValue: "Trust",
    focusIcon: SparklesIcon,
    leftChip: { icon: BookTextIcon, label: "来源清楚" },
    rightChip: { icon: BadgePercentIcon, label: "不做灰产" },
    strip: ["source", "reviewed", "maintained", "trust"],
    glow: "rgba(0, 188, 125, 0.16)",
    secondaryGlow: "rgba(255, 255, 255, 0.12)",
    focusStart: "#d1fae5",
    focusEnd: "#10b981",
    chipTint: "rgba(16, 185, 129, 0.24)",
  },
};

function localizeShowcaseConfig(
  variant: ShowcaseVariant,
  locale: SiteLocale,
  config: ShowcaseConfig,
) {
  if (locale !== "en") {
    return config;
  }

  if (variant === "subscriptions") {
    return {
      ...config,
      title: "Region / FX / Billing",
      rows: [
        { label: "ChatGPT Plus", value: "TR ¥76.11" },
        { label: "Claude Pro", value: "US $20" },
        { label: "Gemini AI Pro", value: "1Y student" },
      ],
      focusLabel: "Max Gap",
      leftChip: { ...config.leftChip, label: "8+ regions" },
      rightChip: { ...config.rightChip, label: "FX-normalized" },
    };
  }

  if (variant === "rates") {
    return {
      ...config,
      title: "Cross-vendor rate board",
      rows: [
        { label: "OpenAI", value: "5h / weekly" },
        { label: "Claude", value: "usage tiers" },
        { label: "Cursor", value: "agent quota" },
      ],
      focusLabel: "Vendors",
      leftChip: { ...config.leftChip, label: "Official framing" },
      rightChip: { ...config.rightChip, label: "Community signal" },
    };
  }

  return config;
}

export function PageShowcase({
  variant,
  locale = "zh-CN",
}: {
  variant: ShowcaseVariant;
  locale?: SiteLocale;
}) {
  const config = localizeShowcaseConfig(variant, locale, showcaseMap[variant]);
  const FocusIcon = config.focusIcon;
  const LeftIcon = config.leftChip.icon;
  const RightIcon = config.rightChip.icon;

  const showcaseStyle = {
    "--showcase-glow": config.glow,
    "--showcase-secondary-glow": config.secondaryGlow,
    "--showcase-focus-start": config.focusStart,
    "--showcase-focus-end": config.focusEnd,
    "--showcase-chip-tint": config.chipTint,
  } as CSSProperties;

  return (
    <div
      className={`page-showcase page-showcase--${variant}`}
      style={showcaseStyle}
    >
      <div className="page-showcase__panel showcase-layer">
        <div className="page-showcase__window-bar">
          <div className="flex items-center gap-1.5">
            <span className="page-showcase__window-dot" />
            <span className="page-showcase__window-dot page-showcase__window-dot--muted" />
            <span className="page-showcase__window-dot page-showcase__window-dot--faint" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {config.eyebrow}
          </span>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">
            {config.title}
          </div>

          <div className="flex flex-col gap-2.5">
            {config.rows.map((row) => (
              <div key={row.label} className="page-showcase__row">
                <span>{row.label}</span>
                <span className="text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-showcase__focus showcase-layer">
        <div className="page-showcase__focus-inner">
          <FocusIcon className="size-8 text-white" />
          <div className="page-showcase__focus-label">{config.focusLabel}</div>
          <div className="page-showcase__focus-value">{config.focusValue}</div>
        </div>
      </div>

      <div className="page-showcase__chip page-showcase__chip--left showcase-layer">
        <LeftIcon className="size-4 text-primary" />
        <span>{config.leftChip.label}</span>
      </div>

      <div className="page-showcase__chip page-showcase__chip--right showcase-layer">
        <RightIcon className="size-4 text-primary" />
        <span>{config.rightChip.label}</span>
      </div>

      <div className="page-showcase__strip showcase-layer">
        {config.strip.map((item) => (
          <span key={item} className="page-showcase__strip-pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
