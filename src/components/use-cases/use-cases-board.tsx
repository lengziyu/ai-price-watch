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
import { addLocalePrefix, type SiteLocale } from "@/lib/i18n";
import { getUICopy } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";

type UseCasesBoardProps = {
  defaultGroup?: string;
  locale?: SiteLocale;
};

const cardTones = ["tone-green", "tone-blue", "tone-cyan", "tone-amber"];

export function UseCasesBoard({ defaultGroup, locale = "zh-CN" }: UseCasesBoardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const uiCopy = getUICopy(locale);
  const isEnglish = locale === "en";
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
      <div className="rounded-[12px] border border-transparent bg-transparent px-0 py-0 shadow-none sm:border-border sm:bg-background sm:px-5 lg:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
                {uiCopy.useCasesPage.boardKicker}
              </div>
              <AnimatedSectionTitle className="mt-2.5">
                {uiCopy.useCasesPage.boardTitle}
              </AnimatedSectionTitle>
              <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-muted-foreground sm:text-sm">
                {getLocalizedGroupSummary(currentGroup.id, currentGroup.summary, locale)}
              </p>
            </div>
            <div className="rounded-[12px] border border-transparent bg-transparent px-0 py-0 text-[12px] leading-6 text-muted-foreground sm:border-border sm:bg-background/76 sm:px-3 sm:py-2">
              {uiCopy.useCasesPage.boardCountPrefix} {visibleCases.length} {uiCopy.useCasesPage.boardCountSuffix}
            </div>
          </div>

          <div ref={stickySentinelRef} className="page-tabs-sentinel" />
          <div
            ref={stickyRef}
            className={cn("page-tabs-sticky", isSticky && "is-sticky")}
          >
            <div className="page-tabs-sticky__surface p-0 sm:p-1.5">
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
                      {uiCopy.useCasesPage.groupLabelMap[group.id]}
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
                              {formatDifficulty(item.difficulty, locale)}
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
                          href={localizeInternalHref(item.ctaHref, locale)}
                          className="use-case-cta inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium"
                        >
                          {isEnglish ? translateUseCaseCtaLabel(item.ctaLabel) : item.ctaLabel}
                          <ArrowRightIcon className="size-3.5" />
                        </Link>
                      </div>

                      <CardDescription className="use-case-card__desc text-[12px] leading-6 sm:text-[13px]">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                    <InfoBlock label={uiCopy.useCasesPage.infoLabels.bestFor} items={item.bestFor} tone="task" />
                    <InfoBlock label={uiCopy.useCasesPage.infoLabels.tools} items={item.recommendedTools} tone="tool" />
                    <InfoBlock label={uiCopy.useCasesPage.infoLabels.models} items={item.recommendedModels} tone="model" />
                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoCard title={uiCopy.useCasesPage.infoLabels.workflow} detail={item.workflow} />
                      <InfoCard title={uiCopy.useCasesPage.infoLabels.budgetTip} detail={item.budgetTip} />
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

function getLocalizedGroupSummary(groupId: string, fallback: string, locale: SiteLocale) {
  if (locale !== "en") {
    return fallback;
  }

  const map: Record<string, string> = {
    all: "Start from the full map, then decide where your primary budget should go.",
    dev: "Great for coding, debugging, repo reading, code review, and agent workflows.",
    work: "Focused on writing, slides, email, meeting notes, and daily information workflows.",
    research: "Suitable for research, interview prep, long-form understanding, and knowledge capture.",
    automation: "Best for batch processing, spreadsheet scripts, SOP design, and workflow acceleration.",
    creative: "For images, video, brand assets, scripts, and multimodal expression.",
  };

  return map[groupId] ?? fallback;
}

function translateUseCaseCtaLabel(label: string) {
  const map: Record<string, string> = {
    "看会员速率": "View Membership Rates",
    "看 Token 成本": "View Token Costs",
    "看订阅组合": "View Subscription Mix",
    "看工具导航": "Browse Tool Directory",
    "看低成本入口": "View Low-cost Entries",
    "看学习向订阅": "View Study-focused Plans",
    "看研究向厂商": "View Research Vendors",
    "看便宜模型": "View Low-cost Models",
    "看低成本输入价": "View Low Input Cost",
    "看优惠活动": "View Deals",
    "看创意场景": "View Creative Cases",
    "看运营工具": "View Ops Tools",
  };

  return map[label] ?? label;
}

function localizeInternalHref(href: string, locale: SiteLocale) {
  if (!href.startsWith("/")) {
    return href;
  }

  const [pathname, hashPart] = href.split("#", 2);
  const [basePath, searchPart] = pathname.split("?", 2);
  const localizedPath = addLocalePrefix(basePath || "/", locale);
  const withQuery = searchPart ? `${localizedPath}?${searchPart}` : localizedPath;

  return hashPart ? `${withQuery}#${hashPart}` : withQuery;
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
