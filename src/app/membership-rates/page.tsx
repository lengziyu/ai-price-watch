import type { Metadata } from "next";

import { MembershipRatesExplorer } from "@/components/membership/membership-rates-explorer";
import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";

export const metadata: Metadata = {
  title: "会员速率",
  description:
    "整理 OpenAI、Claude、Gemini、Cursor 等厂商的会员价格、官方速率口径与社区实测体感。",
};

type MembershipRatesPageProps = {
  searchParams?: Promise<{
    vendor?: string;
    tab?: string;
  }>;
};

export default async function MembershipRatesPage({
  searchParams,
}: MembershipRatesPageProps) {
  const params = (await searchParams) ?? {};
  const defaultTab = params.tab === "business" ? "business" : "consumer";

  return (
    <div className="pb-16">
      <PageHero
        note="会员价格 · 官方速率 · 社区体感"
        title={
          <>
            <div>
              <ScrambleText text="会员速率" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="多厂商口径 +" />
              <ScrambleText text="真实使用体感" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            这页把 OpenAI、Claude、Gemini、Cursor 等订阅体系放到一起看，
            <br />
            先看官方写法，再看社区对实际任务强度下的体感总结。
          </>
        }
        primaryAction={{ href: "#rates-board", label: "查看速率面板" }}
        secondaryAction={{ href: "/pricing/subscriptions", label: "看订阅价格" }}
        rightSlot={<PageShowcase variant="rates" />}
      />

      <div id="rates-board">
        <MembershipRatesExplorer
          defaultVendor={params.vendor}
          defaultOpenAITab={defaultTab}
        />
      </div>
    </div>
  );
}
