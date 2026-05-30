import type { Metadata } from "next";

import { MembershipRatesExplorer } from "@/components/membership/membership-rates-explorer";
import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return {
      title: "Membership Rates",
      description:
        "Track OpenAI, Claude, Gemini, Cursor, and other vendor plan framing, rate notes, and community usage signal.",
    };
  }

  return {
    title: "会员速率",
    description:
      "整理 OpenAI、Claude、Gemini、Cursor 等厂商的会员价格、官方速率口径与社区实测体感。",
  };
}

type MembershipRatesPageProps = {
  searchParams?: Promise<{
    vendor?: string;
    tab?: string;
  }>;
};

export default async function MembershipRatesPage({
  searchParams,
}: MembershipRatesPageProps) {
  const locale = await getRequestLocale();
  const isEnglish = locale === "en";
  const params = (await searchParams) ?? {};
  const defaultTab = params.tab === "business" ? "business" : "consumer";

  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={isEnglish ? "Plan Framing · Official Rates · Community Signal" : "会员价格 · 官方速率 · 社区体感"}
        title={
          <>
            <div>
              <ScrambleText text={isEnglish ? "Membership Rates" : "会员速率"} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={isEnglish ? "Vendor Framing" : "多厂商口径"} />
              <ScrambleText
                text={isEnglish ? "Real Usage Feel" : "真实使用体感"}
                className="gradient-title"
              />
            </div>
          </>
        }
        description={
          <>
            {isEnglish
              ? "This page puts OpenAI, Claude, Gemini, Cursor, and other plan systems side by side,"
              : "这页把 OpenAI、Claude、Gemini、Cursor 等订阅体系放到一起看，"}
            <br />
            {isEnglish
              ? "so you can read the official framing first and then layer in community signal for real workload intensity."
              : "先看官方写法，再看社区对实际任务强度下的体感总结。"}
          </>
        }
        primaryAction={{
          href: "#rates-board",
          label: isEnglish ? "Open Rate Board" : "查看速率面板",
        }}
        secondaryAction={{
          href: addLocalePrefix("/pricing/subscriptions", locale),
          label: isEnglish ? "See Plan Pricing" : "看订阅价格",
        }}
        rightSlot={<PageShowcase variant="rates" locale={locale} />}
      />

      <div id="rates-board">
        <MembershipRatesExplorer
          key={`${params.vendor ?? "openai"}-${defaultTab}`}
          defaultVendor={params.vendor}
          defaultOpenAITab={defaultTab}
          locale={locale}
        />
      </div>
    </div>
  );
}
