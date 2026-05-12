import {
  BadgePercentIcon,
  CompassIcon,
  CrownIcon,
  GaugeIcon,
  GiftIcon,
  ScanSearchIcon,
  SparklesIcon,
} from "lucide-react";

const codeLines = [
  "const plan = watch('ChatGPT Plus')",
  "compare.region('TR', 'US')",
  "notify.whenSaving('> 50%')",
];

export function HeroShowcase() {
  return (
    <div className="rspress-hero-visual">
      <div className="rspress-code-panel rspress-hero-layer" aria-hidden="true">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-[12px] font-medium text-foreground">
              price-watch.ts
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">live sync</span>
        </div>
        <div className="grid gap-3 px-4 py-4 font-mono text-[12px] leading-5">
          {codeLines.map((line, index) => (
            <div key={line} className="flex gap-3">
              <span className="w-4 text-muted-foreground">{index + 1}</span>
              <span>
                <span className="text-primary">{line.split("(")[0]}</span>
                <span className="text-muted-foreground">
                  ({line.split("(").slice(1).join("(")}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rspress-price-tile rspress-hero-layer">
        <div className="absolute inset-0 rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08))]" />
        <div className="relative flex size-16 items-center justify-center rounded-[14px] bg-white/15 backdrop-blur-sm">
          <CrownIcon className="size-8 fill-white text-white" />
        </div>
      </div>

      <div className="rspress-mini-card rspress-mini-card--left rspress-hero-layer">
        <BadgePercentIcon className="size-4 text-primary" />
        <span>省 59%</span>
      </div>

      <div className="rspress-mini-card rspress-mini-card--right rspress-hero-layer">
        <GaugeIcon className="size-4 text-primary" />
        <span>5h 额度</span>
      </div>

      <div className="rspress-command rspress-hero-layer">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
            plus
          </span>
          <span className="text-[12px] text-muted-foreground">pro</span>
          <span className="text-[12px] text-muted-foreground">team</span>
        </div>
        <div className="px-3 py-3 font-mono text-[12px]">
          <span className="text-primary">¥76.11</span>
          <span className="text-muted-foreground"> / month best region</span>
        </div>
      </div>
    </div>
  );
}

export const homeFeatureCards = [
  {
    title: "会员订阅比价",
    description: "把地区价格、汇率折算和套餐周期压到同一张可扫视的表里。",
    href: "/pricing/subscriptions",
    icon: CrownIcon,
    active: false,
  },
  {
    title: "Token 成本比价",
    description: "输入、输出、缓存输入分开看，适合开发者快速估算模型成本。",
    href: "/pricing/tokens",
    icon: ScanSearchIcon,
    active: false,
  },
  {
    title: "会员速率追踪",
    description: "合并官方额度和社区体感，判断 Plus、Pro、Business 是否够用。",
    href: "/membership-rates",
    icon: SparklesIcon,
    active: true,
  },
  {
    title: "AI 优惠活动",
    description: "收录官方试用、学生权益、免费额度和正规优惠入口。",
    href: "/deals",
    icon: GiftIcon,
    active: false,
  },
  {
    title: "使用场景推荐",
    description: "按写代码、写作、办公和学习场景快速找到合适组合。",
    href: "/use-cases",
    icon: CompassIcon,
    active: false,
  },
];
