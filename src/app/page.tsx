import Link from "next/link";
import { ArrowRightIcon, GiftIcon } from "lucide-react";

import { HomeContentOverview } from "@/components/home/home-content-overview";
import { subscriptionPlans } from "@/data/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";
import { ScrambleText } from "@/components/shared/scramble-text";
import { HeroShowcase } from "@/components/shared/hero-showcase";
import { getDealArticles } from "@/lib/admin-store";

export default async function HomePage() {
  const articles = await getDealArticles();

  return (
    <div className="pb-8 sm:pb-16">
      <section className="hero-stage hero-grid hero-aura -mt-[84px] w-full bg-background pt-[96px] sm:-mt-[104px] sm:pt-[120px]">
        <div className="app-shell py-4 sm:py-6 lg:py-9">
          <div className="grid items-center gap-4 sm:gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="flex flex-col gap-3.5 sm:gap-4">
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

              <div className="max-w-[680px] text-[1.42rem] font-semibold leading-[0.99] tracking-[-0.034em] text-foreground sm:text-[2.58rem] lg:text-[3.28rem]">
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

              <p className="max-w-[580px] text-[12px] leading-[1.55] text-muted-foreground sm:text-[14px] sm:leading-[1.58]">
                不只是订阅比价，现在还把会员速率、使用场景、工具导航和优惠文章一起汇总到首页。
                <br />
                先看重点，再决定去哪个厂商、哪个套餐、哪个页面继续深挖。
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
