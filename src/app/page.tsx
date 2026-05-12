import Link from "next/link";
import { ArrowRightIcon, GiftIcon } from "lucide-react";

import { subscriptionPlans } from "@/data/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import { ScrambleText } from "@/components/shared/scramble-text";
import {
  HeroShowcase,
  homeFeatureCards,
} from "@/components/shared/hero-showcase";

export default function HomePage() {
  return (
    <div className="pb-16">
      <section className="hero-stage hero-grid hero-aura -mt-[104px] w-full bg-background pt-[120px]">
        <div className="app-shell py-6 lg:py-9">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/75 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span>实时更新</span>
                <span>·</span>
                <span>官方价格</span>
                <span>·</span>
                <span>人民币比价</span>
              </div>

              <div className="max-w-[680px] text-[1.74rem] font-semibold leading-[0.97] tracking-[-0.034em] text-foreground sm:text-[2.58rem] lg:text-[3.28rem]">
                <div>
                  <ScrambleText text="AI 订阅会员" />
                </div>
                <div className="inline-flex items-baseline gap-2">
                  <ScrambleText text="全球价格" />
                  <ScrambleText
                    text="一站对比"
                    className="gradient-title"
                  />
                </div>
              </div>

              <p className="max-w-[580px] text-[13px] leading-6 text-muted-foreground sm:text-[14px] sm:leading-[1.58]">
                聚合 ChatGPT、Claude、Gemini、Cursor 等主流 AI 产品订阅价格，
                <br />
                支持多币种与地区对比，帮你找到最优方案，降低 AI 使用成本。
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pricing/subscriptions"
                  className={buttonVariants({
                    size: "lg",
                    className: "px-6",
                  })}
                >
                  开始对比
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
                <Link
                  href="/deals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "px-6",
                  })}
                >
                  查看优惠活动
                  <GiftIcon data-icon="inline-end" />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell mt-8">
        <div className="mb-4">
          <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
            product map
          </div>
          <AnimatedSectionTitle className="mt-2">
            主要页面入口
          </AnimatedSectionTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            首页先给出站内核心能力：订阅比价、Token 成本、会员速率、优惠活动和使用场景。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {homeFeatureCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={[
                  item.active ? "rspress-feature-card is-active" : "rspress-feature-card",
                  index > 2 ? "lg:col-span-3" : "lg:col-span-2",
                ].join(" ")}
              >
                <span className="rspress-feature-card__icon">
                  <Icon className="size-5" />
                </span>
                <span className="rspress-feature-card__title">
                  {item.title}
                </span>
                <span className="rspress-feature-card__detail">
                  {item.description}
                </span>
                <span className="rspress-feature-card__action">
                  进入页面
                  <ArrowRightIcon className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="app-shell mt-8">
        <SubscriptionExplorer
          plans={subscriptionPlans}
          embedded
          maxRows={4}
        />
      </section>
    </div>
  );
}
