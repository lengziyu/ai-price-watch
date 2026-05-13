import type { Metadata } from "next";
import { GiftIcon } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { subscriptionPlans } from "@/data/subscriptions";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";

export const metadata: Metadata = {
  title: "会员订阅比价",
  description:
    "对比 ChatGPT、Claude、Gemini、Cursor、Windsurf 等 AI 产品订阅价格与更新信息。",
};

export default function SubscriptionPricingPage() {
  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note="实时更新 · 官方价格 · 人民币比价"
        title={
          <>
            <div>
              <ScrambleText text="AI 订阅会员" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="全球价格" />
              <ScrambleText text="一站对比" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            聚合 ChatGPT、Claude、Gemini、Cursor 等主流 AI 产品订阅价格，
            <br />
            支持多币种与地区对比，帮你找到最优方案，降低 AI 使用成本。
          </>
        }
        primaryAction={{
          href: "#subscriptions-board",
          label: "开始对比",
        }}
        secondaryAction={{
          href: "/deals",
          label: "查看优惠活动",
          icon: <GiftIcon data-icon="inline-end" />,
        }}
        rightSlot={<PageShowcase variant="subscriptions" />}
      />

      <div id="subscriptions-board" className="mt-4 sm:mt-8">
        <SubscriptionExplorer plans={subscriptionPlans} />
      </div>
    </div>
  );
}
