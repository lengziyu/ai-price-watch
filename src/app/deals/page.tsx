import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { DealArticlesSection } from "@/components/deals/deal-articles-section";
import { DealsExplorer } from "@/components/deals/deals-explorer";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiDeals } from "@/data/deals";
import { getDealArticles } from "@/lib/admin-store";

export const metadata: Metadata = {
  title: "AI 优惠活动",
  description:
    "收录 AI 工具的免费额度、学生权益、试用入口与正规优惠活动。",
};

export default async function DealsPage() {
  const articles = await getDealArticles();

  return (
    <div className="pb-8 sm:pb-16">
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
          href: "#content-switcher",
          label: "查看文章",
        }}
        secondaryAction={{
          href: "/tools",
          label: "浏览工具导航",
        }}
        rightSlot={<PageShowcase variant="deals" />}
      />

      <Tabs defaultValue="articles" className="mt-4 gap-3 sm:mt-6">
        <div id="content-switcher" className="app-shell">
          <div className={cn("page-tabs-sticky__surface p-0 sm:p-1.5")}>
            <TabsList variant="accent" className="w-full max-w-full sm:w-fit">
              <TabsTrigger value="articles" className="min-w-[116px]">
                优惠文章
              </TabsTrigger>
              <TabsTrigger value="deals" className="min-w-[116px]">
                免费优惠
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="articles">
          <DealArticlesSection articles={articles} />
        </TabsContent>

        <TabsContent value="deals">
          <div id="deals-board">
            <DealsExplorer deals={aiDeals} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
