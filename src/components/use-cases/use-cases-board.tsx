"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AnimeHoverCard } from "@/components/shared/anime-hover-card";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCaseGroups, useCases } from "@/data/use-cases";
import { formatCostBand, formatDifficulty } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";

type UseCasesBoardProps = {
  defaultGroup?: string;
};

const cardTones = ["tone-green", "tone-blue", "tone-cyan", "tone-amber"];

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
              <AnimatedSectionTitle className="mt-2.5">
                场景分类总览
              </AnimatedSectionTitle>
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

          <AnimeReveal
            key={activeGroup}
            selector=":scope > *"
            stagger={90}
            className="grid gap-3 xl:grid-cols-2"
          >
            {visibleCases.map((item, index) => (
              <AnimeHoverCard key={item.id} className="h-full" lift={4} scale={1.008}>
                <Card
                  className={cn(
                    "use-case-card h-full rounded-[12px] border-border",
                    cardTones[index % cardTones.length],
                  )}
                >
                  <CardHeader className="use-case-card__header gap-3 px-4 py-4 sm:px-5">
                    <div className="grid gap-2.5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="use-case-card__title text-[1rem]">
                              {item.title}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="use-case-meta-badge use-case-meta-badge--difficulty"
                            >
                              {formatDifficulty(item.difficulty)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="use-case-meta-badge use-case-meta-badge--cost"
                            >
                              {formatCostBand(item.estimatedCost)}
                            </Badge>
                          </div>
                        </div>

                        <Link
                          href={item.ctaHref}
                          className="use-case-cta inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium"
                        >
                          {item.ctaLabel}
                          <ArrowRightIcon className="size-3.5" />
                        </Link>
                      </div>

                      <CardDescription className="use-case-card__desc text-[12px] leading-6 sm:text-[13px]">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                    <InfoBlock label="适合任务" items={item.bestFor} tone="task" />
                    <InfoBlock label="推荐工具" items={item.recommendedTools} tone="tool" />
                    <InfoBlock label="优先模型" items={item.recommendedModels} tone="model" />
                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoCard title="推荐工作流" detail={item.workflow} />
                      <InfoCard title="预算提醒" detail={item.budgetTip} />
                    </div>
                  </CardContent>
                </Card>
              </AnimeHoverCard>
            ))}
          </AnimeReveal>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "task" | "tool" | "model";
}) {
  return (
    <div className={cn("use-case-info-block rounded-[10px] border px-3 py-2.5", `is-${tone}`)}>
      <div className="use-case-info-block__label text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) =>
          tone === "tool" ? (
            <ToolTag key={item} name={item} />
          ) : (
            <Badge
              key={item}
              variant="outline"
              className={cn("use-case-tag h-auto rounded-full px-3 py-1 text-[11px]", tagStyleClass(item, tone))}
            >
              {item}
            </Badge>
          ),
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="use-case-info-card rounded-[10px] border border-border px-3 py-3">
      <div className="text-[11px] font-semibold text-foreground">{title}</div>
      <p className="mt-1.5 text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
        {detail}
      </p>
    </div>
  );
}

function tagStyleClass(value: string, tone: "task" | "tool" | "model") {
  const palettes = {
    task: [
      "tag-pill--mint",
      "tag-pill--teal",
      "tag-pill--sky",
      "tag-pill--violet",
    ],
    tool: [
      "tag-pill--amber",
      "tag-pill--orange",
      "tag-pill--rose",
      "tag-pill--cyan",
    ],
    model: [
      "tag-pill--slate",
      "tag-pill--lime",
      "tag-pill--indigo",
      "tag-pill--emerald",
    ],
  } as const;

  const key = `${tone}-${value}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  const bucket = Math.abs(hash) % palettes[tone].length;
  return palettes[tone][bucket];
}

function ToolTag({ name }: { name: string }) {
  const logo = getToolLogo(name);
  const iconSize = getToolLogoSize(name);

  return (
    <Badge
      variant="outline"
      className="use-case-tag use-case-tag--tool h-auto rounded-full px-3 py-1 text-[11px]"
    >
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={iconSize}
          height={iconSize}
          className="rounded-[6px] object-contain"
        />
      ) : (
        <span className="use-case-tool-fallback">{name.slice(0, 1)}</span>
      )}
      <span>{name}</span>
    </Badge>
  );
}

function getToolLogo(name: string) {
  const key = name.toLowerCase();
  if (key.includes("chatgpt")) return "/vendor-logos/openai.png";
  if (key.includes("claude")) return "/vendor-logos/anthropic.png";
  if (key.includes("gemini") || key.includes("notebooklm")) return "/vendor-logos/google.png";
  if (key.includes("cursor")) return "/vendor-logos/cursor.png";
  if (key.includes("copilot") || key.includes("github")) return "/vendor-logos/github.png";
  if (key.includes("perplexity")) return "/vendor-logos/perplexity.png";
  if (key.includes("grok")) return "/vendor-logos/grok.png";
  return null;
}

function getToolLogoSize(name: string) {
  const key = name.toLowerCase();
  if (key.includes("perplexity")) return 20;
  if (key.includes("copilot") || key.includes("github")) return 20;
  if (key.includes("cursor")) return 20;
  return 24;
}
