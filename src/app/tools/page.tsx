import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { toolsDirectory } from "@/data/tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "AI 工具导航",
  description: "按使用场景快速浏览常见 AI 工具与产品定位。",
};

export default function ToolsPage() {
  return (
    <div className="pb-16">
      <PageHero
        note="场景分类 · 轻导航 · 快速选型"
        title={
          <>
            <div>
              <ScrambleText text="AI 工具导航" />
            </div>
            <div className="inline-flex items-baseline gap-2">
              <ScrambleText text="先找方向" />
              <ScrambleText text="再做选择" className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            这里只做轻量导航，不喧宾夺主，帮助你先找到适合自己的工具轨道，
            <br />
            再回到订阅与 Token 页做具体价格比较。
          </>
        }
        primaryAction={{ href: "/pricing/subscriptions", label: "去看订阅比价" }}
        secondaryAction={{ href: "/pricing/tokens", label: "去看 Token 价格" }}
        rightSlot={<PageShowcase variant="tools" />}
      />

      <section className="app-shell mt-8">
        <div className="grid gap-4 rounded-[12px] border border-border bg-background px-4 py-6 md:grid-cols-2 sm:px-5 lg:px-6 xl:grid-cols-3">
          {toolsDirectory.map((tool) => (
            <Card key={tool.id} className="surface-card rounded-xl">
              <CardHeader className="gap-3 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.category}</CardDescription>
                  </div>
                  <Badge variant="outline">{tool.pricing}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  {tool.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={tool.url}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
                >
                  访问官网
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
