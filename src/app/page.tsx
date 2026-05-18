import Link from "next/link";
import { ArrowRightIcon, GiftIcon } from "lucide-react";

import { HomeContentOverview } from "@/components/home/home-content-overview";
import { subscriptionPlans } from "@/data/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { HeroMesh } from "@/components/shared/hero-mesh";
import { ScrambleText } from "@/components/shared/scramble-text";
import { HeroShowcase } from "@/components/shared/hero-showcase";
import { getDealArticles } from "@/lib/admin-store";

export default async function HomePage() {
  const articles = await getDealArticles();

  return (
    <div className="pb-8 sm:pb-16">
      <section className="hero-stage hero-mesh-stage hero-aura -mt-[84px] w-full bg-background pt-[96px] sm:-mt-[104px] sm:pt-[120px]">
        <HeroMesh />
        <div className="app-shell py-4 sm:py-6 lg:py-9">
          <div className="grid items-center gap-4 sm:gap-6 lg:grid-cols-[1fr_0.95fr]">
            <AnimeReveal
              selector=":scope > *"
              stagger={90}
              className="flex flex-col gap-4.5 sm:gap-5"
            >
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/75 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span>实时更新</span>
                <span>·</span>
                <span>会员速率</span>
                <span>·</span>
                <span>场景推荐</span>
                <span>·</span>
                <span>优惠文章</span>
              </div>

              <div className="max-w-[680px] text-[1.74rem] font-semibold leading-[0.97] tracking-[-0.038em] text-foreground sm:text-[2.58rem] lg:text-[3.28rem]">
                <div>
                  <ScrambleText text="AI 会员价格" />
                </div>
                <div className="inline-flex items-baseline gap-2">
                  <ScrambleText text="额度场景优惠" />
                  <ScrambleText
                    text="首页先看"
                    className="gradient-title"
                  />
                </div>
              </div>

              <p className="max-w-[580px] text-[12.5px] leading-[1.7] text-muted-foreground sm:text-[14px] sm:leading-[1.58]">
                首页集中看会员价格、额度、常用入口和最新活动，先完成第一轮筛选。
                <br />
                再进入你关心的厂商、套餐、工具页面，继续看详细对比。
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
                <Link
                  href="/pricing/subscriptions"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                  })}
                >
                  <span className="hero-gradient-text">开始对比</span>
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
                <Link
                  href="/deals"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                  })}
                >
                  <span className="hero-gradient-text">查看优惠活动</span>
                  <GiftIcon data-icon="inline-end" />
                </Link>
              </div>
            </AnimeReveal>

            <AnimeReveal className="hidden lg:block" distance={30} delay={160}>
              <HeroShowcase />
            </AnimeReveal>
          </div>
        </div>
      </section>

      <HomeContentOverview articles={articles} />

      <section className="app-shell mt-4 sm:mt-8">
        <SubscriptionExplorer
          plans={subscriptionPlans}
          embedded
          disableStickyTabs
          maxRows={10}
        />
        <div className="mt-4 flex justify-center sm:mt-5">
          <Link
            href="/pricing/subscriptions"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "min-w-[220px] rounded-[12px] border-primary/18 bg-primary/[0.04] px-6 text-primary hover:bg-primary/[0.08]",
            })}
          >
            查看完整会员订阅比价
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </section>
    </div>
  );
}
