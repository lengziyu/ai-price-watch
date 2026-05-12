import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { DealsExplorer } from "@/components/deals/deals-explorer";
import { aiDeals } from "@/data/deals";

export const metadata: Metadata = {
  title: "AI 优惠活动",
  description:
    "收录 AI 工具的免费额度、学生权益、试用入口与正规优惠活动。",
};

export default function DealsPage() {
  return (
    <div className="pb-16">
      <PageHero
        note="官方活动 · 免费额度 · 学生权益"
        title={
          <>
            <div>
              <ScrambleText text="AI 优惠活动" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="正规渠道" />
              <ScrambleText text="一页看全" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            优先收录官方免费层、教育权益、地区价格差异与新用户福利，
            <br />
            不引导灰产代充，只保留可公开验证的入口。
          </>
        }
        primaryAction={{
          href: "#deals-board",
          label: "查看活动",
        }}
        secondaryAction={{
          href: "/tools",
          label: "浏览工具导航",
        }}
        rightSlot={<PageShowcase variant="deals" />}
      />

      <div id="deals-board" className="mt-8">
        <DealsExplorer deals={aiDeals} />
      </div>
    </div>
  );
}
