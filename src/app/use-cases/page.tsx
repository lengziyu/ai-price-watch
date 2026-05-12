import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { useCases } from "@/data/use-cases";
import {
  formatCostBand,
  formatDifficulty,
} from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI 使用场景推荐",
  description: "按写代码、写作、学习、办公等场景查看推荐工具与模型组合。",
};

const cardLayouts = [
  "xl:col-span-7",
  "xl:col-span-5",
  "xl:col-span-4",
  "xl:col-span-4",
  "xl:col-span-4",
  "xl:col-span-12",
];

const cardTones = [
  "motion-surface--green",
  "motion-surface--blue",
  "motion-surface--purple",
  "motion-surface--amber",
  "motion-surface--green",
  "motion-surface--cyan",
];

const scenarioRoutes: Record<string, string> = {
  coding: "/pricing/subscriptions",
  writing: "/deals",
  ppt: "/pricing/subscriptions",
  study: "/membership-rates",
  automation: "/tools",
  "image-video": "/deals",
};

export default function UseCasesPage() {
  return (
    <div className="pb-16">
      <PageHero
        note="写作 · 编程 · 学习 · 办公"
        title={
          <>
            <div>
              <ScrambleText text="AI 使用场景" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="按任务选择" />
              <ScrambleText text="更省预算" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            模块保持轻量，只给方向感，帮助你用更合适的预算找到更匹配的工具组合。
            <br />
            先看场景，再回到价格页做更细的订阅或 API 选择。
          </>
        }
        primaryAction={{ href: "/pricing/subscriptions", label: "去看订阅页" }}
        secondaryAction={{ href: "/tools", label: "浏览工具导航" }}
        rightSlot={<PageShowcase variant="use-cases" />}
      />

      <section className="app-shell mt-8">
        <div className="grid gap-3 rounded-[12px] border border-border bg-background px-4 py-4 sm:px-5 lg:px-6 xl:grid-cols-12">
          {useCases.map((item, index) => {
            const toolsPreview = item.recommendedTools.slice(0, 2);
            const modelsPreview = item.recommendedModels.slice(0, 2);
            const extraTools = item.recommendedTools.length - toolsPreview.length;
            const extraModels = item.recommendedModels.length - modelsPreview.length;

            return (
              <Card
                key={item.id}
                size="sm"
                className={[
                  "rounded-[12px] border-border",
                  "motion-surface",
                  cardLayouts[index] ?? "xl:col-span-4",
                  cardTones[index] ?? cardTones[0],
                ].join(" ")}
              >
                <CardHeader className="gap-3 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex max-w-xl flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-[1rem]">{item.title}</CardTitle>
                        <Badge variant="outline">{formatDifficulty(item.difficulty)}</Badge>
                        <Badge variant="secondary">{formatCostBand(item.estimatedCost)}</Badge>
                      </div>
                      <CardDescription className="text-[12px] leading-6 sm:text-[13px]">
                        {item.description}
                      </CardDescription>
                    </div>

                    <Link
                      href={scenarioRoutes[item.id] ?? "/pricing/subscriptions"}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      查看入口
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-2.5 px-4 pb-4">
                  <CompactTrack
                    label="推荐工具"
                    items={toolsPreview}
                    extra={extraTools}
                    variant="outline"
                  />
                  <CompactTrack
                    label="优先模型"
                    items={modelsPreview}
                    extra={extraModels}
                    variant="secondary"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CompactTrack({
  label,
  items,
  extra,
  variant,
}: {
  label: string;
  items: string[];
  extra: number;
  variant: "outline" | "secondary";
}) {
  return (
    <div className="rounded-[10px] border border-border bg-background/75 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
        {extra > 0 ? <Badge variant="outline">+{extra}</Badge> : null}
      </div>
    </div>
  );
}
