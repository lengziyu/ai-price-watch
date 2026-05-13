"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCaseGroups, useCases } from "@/data/use-cases";
import { formatCostBand, formatDifficulty } from "@/lib/format";
import { cn } from "@/lib/utils";

type UseCasesBoardProps = {
  defaultGroup?: string;
};

const cardTones = [
  "motion-surface--green",
  "motion-surface--blue",
  "motion-surface--cyan",
  "motion-surface--amber",
  "motion-surface--green",
  "motion-surface--cyan",
];

export function UseCasesBoard({ defaultGroup }: UseCasesBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initialGroup = useCaseGroups.some((item) => item.id === defaultGroup)
    ? defaultGroup!
    : "all";
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const {
    stickyRef,
    stickySentinelRef,
    stickyBoundaryRef,
    isSticky,
    scrollToStickyContent,
  } = useStickyTabs("use-cases");

  const currentGroup = useMemo(
    () => useCaseGroups.find((item) => item.id === activeGroup) ?? useCaseGroups[0],
    [activeGroup],
  );
  const visibleCases = useMemo(
    () =>
      activeGroup === "all"
        ? useCases
        : useCases.filter((item) => item.group === activeGroup),
    [activeGroup],
  );

  const handleGroupChange = (groupId: string) => {
    if (groupId === activeGroup) {
      return;
    }

    setActiveGroup(groupId);
    scrollToStickyContent();

    startTransition(() => {
      router.replace(groupId === "all" ? pathname : `${pathname}?group=${groupId}`, {
        scroll: false,
      });
    });
  };

  return (
    <section
      id="use-cases-board"
      ref={(node) => {
        stickyBoundaryRef.current = node;
      }}
      className="app-shell mt-4 sm:mt-8"
    >
      <div className="rounded-[12px] border border-border bg-background px-4 py-5 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
                use case tabs
              </div>
              <h2 className="mt-2 text-[1.52rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[1.9rem]">
                场景分类总览
              </h2>
              <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-muted-foreground sm:text-sm">
                {currentGroup.summary}
              </p>
            </div>
            <div className="rounded-[12px] border border-border bg-background/76 px-3 py-2 text-[12px] leading-6 text-muted-foreground">
              当前分类共 {visibleCases.length} 个场景，覆盖工具选择、预算提醒和落地入口。
            </div>
          </div>

          <div ref={stickySentinelRef} className="page-tabs-sentinel" />
          <div
            ref={stickyRef}
            className={cn("page-tabs-sticky", isSticky && "is-sticky")}
          >
            <div className="page-tabs-sticky__surface p-1.5">
              <Tabs value={activeGroup} onValueChange={handleGroupChange}>
                <TabsList
                  variant="accent"
                  className="w-full max-w-full justify-start overflow-x-auto sm:w-fit [&::-webkit-scrollbar]:hidden"
                >
                  {useCaseGroups.map((group) => (
                    <TabsTrigger
                      key={group.id}
                      value={group.id}
                      className="h-9 flex-none px-4"
                    >
                      {group.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {visibleCases.map((item, index) => (
              <Card
                key={item.id}
                className={cn(
                  "motion-surface rounded-[12px] border-border",
                  cardTones[index % cardTones.length],
                )}
              >
                <CardHeader className="gap-3 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-[1rem]">{item.title}</CardTitle>
                        <Badge variant="outline">{formatDifficulty(item.difficulty)}</Badge>
                        <Badge variant="secondary">{formatCostBand(item.estimatedCost)}</Badge>
                      </div>
                      <CardDescription className="mt-2 text-[12px] leading-6 sm:text-[13px]">
                        {item.description}
                      </CardDescription>
                    </div>

                    <Link
                      href={item.ctaHref}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {item.ctaLabel}
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                  <InfoBlock label="适合任务" items={item.bestFor} variant="secondary" />
                  <InfoBlock label="推荐工具" items={item.recommendedTools} variant="outline" />
                  <InfoBlock label="优先模型" items={item.recommendedModels} variant="outline" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoCard title="推荐工作流" detail={item.workflow} />
                    <InfoCard title="预算提醒" detail={item.budgetTip} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
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
      </div>
    </div>
  );
}

function InfoCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-background/78 px-3 py-3">
      <div className="text-[11px] font-semibold text-foreground">{title}</div>
      <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
        {detail}
      </p>
    </div>
  );
}
