import type { Metadata } from "next";
import { GiftIcon } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { subscriptionPlans } from "@/data/subscriptions";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return {
      title: "Subscription Pricing",
      description:
        "Compare ChatGPT, Claude, Gemini, Cursor, Windsurf, and other AI subscription pricing across regions.",
    };
  }

  return {
    title: "会员订阅比价",
    description:
      "对比 ChatGPT、Claude、Gemini、Cursor、Windsurf 等 AI 产品订阅价格与更新信息。",
  };
}

const allowedViews = ["subscription", "best", "region"] as const;
type SubscriptionPageView = (typeof allowedViews)[number];
const allowedViewSet = new Set<SubscriptionPageView>(allowedViews);

export default async function SubscriptionPricingPage(
  props: PageProps<"/pricing/subscriptions">,
) {
  const locale = await getRequestLocale();
  const isEnglish = locale === "en";
  const searchParams = await props.searchParams;
  const requestedView = searchParams.view;
  const initialViewMode: SubscriptionPageView =
    typeof requestedView === "string" && allowedViewSet.has(requestedView as SubscriptionPageView)
      ? (requestedView as SubscriptionPageView)
      : "subscription";

  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={isEnglish ? "Live FX · Official Pricing · Regional Comparison" : "实时更新 · 官方价格 · 人民币比价"}
        title={
          <>
            <div>
              <ScrambleText text={isEnglish ? "AI Subscriptions" : "AI 订阅会员"} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={isEnglish ? "Global Pricing" : "全球价格"} />
              <ScrambleText
                text={isEnglish ? "One View" : "一站对比"}
                className="gradient-title"
              />
            </div>
          </>
        }
        description={
          <>
            {isEnglish
              ? "Compare subscription pricing for ChatGPT, Claude, Gemini, Cursor, and other mainstream AI products,"
              : "聚合 ChatGPT、Claude、Gemini、Cursor 等主流 AI 产品订阅价格，"}
            <br />
            {isEnglish
              ? "with multi-currency and regional views to help you find the better-fit plan."
              : "支持多币种与地区对比，帮你找到最优方案，降低 AI 使用成本。"}
          </>
        }
        primaryAction={{
          href: "#subscriptions-board",
          label: isEnglish ? "Start Comparing" : "开始对比",
        }}
        secondaryAction={{
          href: addLocalePrefix("/deals", locale),
          label: isEnglish ? "View Deals" : "查看优惠活动",
          icon: <GiftIcon data-icon="inline-end" />,
        }}
        rightSlot={<PageShowcase variant="subscriptions" locale={locale} />}
      />

      <div
        id="subscriptions-board"
        className="mt-4 scroll-mt-24 sm:mt-8 sm:scroll-mt-32"
      >
        <SubscriptionExplorer
          key={initialViewMode}
          plans={subscriptionPlans}
          initialViewMode={initialViewMode}
          persistViewInUrl
        />
      </div>
    </div>
  );
}
