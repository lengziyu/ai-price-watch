import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { TokenPriceExplorer } from "@/components/pricing/token-price-explorer";
import { ScrambleText } from "@/components/shared/scramble-text";
import { tokenPrices } from "@/data/token-prices";

export const metadata: Metadata = {
  title: "API Token 比价",
  description:
    "查看 OpenAI、Anthropic、Gemini、DeepSeek 等模型的 API Token 输入与输出价格。",
};

export default function TokenPricingPage() {
  return (
    <div className="pb-16">
      <PageHero
        note="输入 / 输出单价 · 官方来源位 · 成本感知"
        title={
          <>
            <div>
              <ScrambleText text="API Token 价格" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="统一口径" />
              <ScrambleText text="快速比较" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            按供应商、平台、模型类别和单价筛选，先做模型初筛与成本估算。
            <br />
            价格可能随时间变化，请以官方页面为准。
          </>
        }
        primaryAction={{
          href: "#token-board",
          label: "查看价格表",
        }}
        secondaryAction={{
          href: "/pricing/subscriptions",
          label: "看订阅价格",
        }}
        rightSlot={<PageShowcase variant="tokens" />}
      />

      <div id="token-board" className="mt-8">
        <TokenPriceExplorer prices={tokenPrices} />
      </div>
    </div>
  );
}
