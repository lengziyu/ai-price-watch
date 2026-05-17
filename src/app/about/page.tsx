import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { siteConfig, trustBullets } from "@/lib/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "关于本站",
  description: "了解雷价通的定位、数据原则与维护方式。",
};

export default function AboutPage() {
  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note="定位说明 · 数据原则 · 维护方式"
        title={
          <>
            <div>
              <ScrambleText text="关于雷价通" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="把影响选择成本的信息" />
              <ScrambleText text="摆清楚" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            我们不追求花哨内容，而是把真正影响选择的信息组织清楚，
            <br />
            让你能更快判断订阅、Token 与活动是否值得。
          </>
        }
        primaryAction={{ href: "/pricing/subscriptions", label: "查看订阅比价" }}
        secondaryAction={{ href: "/deals", label: "查看优惠活动" }}
        rightSlot={<PageShowcase variant="about" />}
      />

      <section className="app-shell mt-4 sm:mt-8">
        <div className="flex flex-col gap-6 rounded-[12px] border border-transparent bg-transparent px-0 py-0 shadow-none sm:border-border sm:bg-background sm:px-5 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border lg:col-span-2">
            <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
              <CardTitle>{siteConfig.name}</CardTitle>
              <CardDescription>{siteConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-0 pb-0 text-sm leading-7 text-muted-foreground sm:px-6 sm:pb-6">
              <p>
                雷价通聚焦 AI 订阅、Token 成本、会员速率和优惠活动，把真正影响决策的信息收敛到同一套页面里。
              </p>
              <p>
                站内会持续维护公开价格、来源链接和复核时间，帮助你更快判断不同方案的成本差异。
              </p>
            </CardContent>
          </Card>

          <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border">
            <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
              <CardTitle>数据原则</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-0 pb-0 text-sm leading-7 text-muted-foreground sm:px-6 sm:pb-6">
              {trustBullets.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border">
          <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <Accordion>
              <AccordionItem value="static-data">
                <AccordionTrigger>站内数据是怎么维护的？</AccordionTrigger>
                <AccordionContent>
                  目前以公开价格页、帮助中心和人工复核整理为主，优先保证页面可读性、来源清晰度和更新节奏。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="accuracy">
                <AccordionTrigger>价格一定准确吗？</AccordionTrigger>
                <AccordionContent>
                  站内会尽量同步官方来源，但定价和汇率都会变化，所以页面会持续保留“请以官方页面为准”的提示。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gray-market">
                <AccordionTrigger>会收录灰产代充吗？</AccordionTrigger>
                <AccordionContent>
                  不会。首版只面向正规活动、免费额度、学生权益和明确地区差异，不鼓励违规购买路径。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        </div>
      </section>
    </div>
  );
}
