"use client";

import { useDeferredValue, useState } from "react";
import {
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { buildEvidenceSummary } from "@/lib/evidence";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TokenPrice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
import { EvidenceBadgeGroup } from "@/components/shared/evidence-badge";
import { useStickyTabs } from "@/components/shared/use-sticky-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  prices: TokenPrice[];
};

export function TokenPriceExplorer({ prices }: Props) {
  const [provider, setProvider] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("input");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const {
    stickyRef,
    stickySentinelRef,
    stickyBoundaryRef,
    isSticky,
    scrollToStickyContent,
  } = useStickyTabs("token-pricing");

  const providers = [...new Set(prices.map((item) => item.provider))];
  const platforms = [...new Set(prices.map((item) => item.platform))];

  const filteredPrices = prices
    .filter((item) => provider === "all" || item.provider === provider)
    .filter((item) => platform === "all" || item.platform === platform)
    .filter((item) => category === "all" || item.category === category)
    .filter((item) => {
      const keyword = deferredQuery.trim().toLowerCase();
      if (!keyword) {
        return true;
      }

      return `${item.modelName} ${item.provider} ${item.platform}`
        .toLowerCase()
        .includes(keyword);
    })
    .sort((left, right) => {
      if (sortBy === "output") {
        return left.outputPricePer1M - right.outputPricePer1M;
      }

      if (sortBy === "updated") {
        return right.updatedAt.localeCompare(left.updatedAt);
      }

      return left.inputPricePer1M - right.inputPricePer1M;
    });
  const cheapestInput = filteredPrices.length
    ? Math.min(...filteredPrices.map((item) => item.inputPricePer1M))
    : null;
  const cheapestOutput = filteredPrices.length
    ? Math.min(...filteredPrices.map((item) => item.outputPricePer1M))
    : null;
  const trustedCount = filteredPrices.filter(
    (item) => buildEvidenceSummary(item).confidence === "verified",
  ).length;

  const searchInput = (
    <div className="relative w-full md:max-w-[320px]">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索模型或平台"
        className="w-full pl-9"
      />
    </div>
  );

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    scrollToStickyContent();
  };

  const categoryTabs = (
    <Tabs value={category} onValueChange={handleCategoryChange}>
      <TabsList
        variant="accent"
        className="w-full max-w-full justify-start overflow-x-auto sm:w-fit [&::-webkit-scrollbar]:hidden"
      >
        {["all", "reasoning", "text", "vision", "embedding", "audio"].map(
          (item) => (
            <TabsTrigger
              key={item}
              value={item}
              className="h-9 flex-none min-w-[4.4rem] px-4"
            >
              {renderCategoryLabel(item)}
            </TabsTrigger>
          ),
        )}
      </TabsList>
    </Tabs>
  );

  const filterControls = (
    <div className="grid gap-3 sm:grid-cols-3">
      <TokenFilterSelect
        label="供应商"
        value={provider}
        onValueChange={setProvider}
        items={["all", ...providers]}
        renderLabel={renderProviderLabel}
      />
      <TokenFilterSelect
        label="平台"
        value={platform}
        onValueChange={setPlatform}
        items={["all", ...platforms]}
        renderLabel={renderPlatformLabel}
      />
      <TokenFilterSelect
        label="排序"
        value={sortBy}
        onValueChange={setSortBy}
        items={["input", "output", "updated"]}
        renderLabel={renderSortLabel}
      />
    </div>
  );

  const mobileFilters = (
    <div className="flex flex-col gap-4">
      <div className="md:hidden">{searchInput}</div>
      {categoryTabs}
      {filterControls}
    </div>
  );

  return (
    <section
      ref={(node) => {
        stickyBoundaryRef.current = node;
      }}
      className="app-shell flex flex-col gap-3.5 rounded-[12px] border border-border bg-background px-4 py-4 sm:px-5 sm:py-4.5 lg:px-6"
    >
      <Card className="rounded-xl border-border bg-card/90">
        <CardHeader className="gap-2.5 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
                token pricing
              </div>
              <AnimatedSectionTitle>API Token 比价</AnimatedSectionTitle>
              <CardDescription className="text-[12px] leading-5 sm:text-[13px]">
                当前数据优先取官方价格页，适合先做成本感知与模型初筛。
              </CardDescription>
            </div>

            <div className="hidden md:block">{searchInput}</div>

            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "md:hidden")}>
                <SlidersHorizontalIcon data-icon="inline-start" />
                筛选
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Token 筛选</SheetTitle>
                  <SheetDescription>按供应商、平台、分类和价格排序。</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">{mobileFilters}</div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

      </Card>

      <div ref={stickySentinelRef} className="page-tabs-sentinel" />
      <div
        ref={stickyRef}
        className={cn("page-tabs-sticky", isSticky && "is-sticky")}
      >
        <div className="page-tabs-sticky__surface p-1.5">
          {categoryTabs}
        </div>
      </div>

      <div className="hidden rounded-[12px] border border-border bg-card/82 p-4 md:block">
        {filterControls}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="当前模型数"
          value={String(filteredPrices.length)}
          detail="已按筛选条件收敛结果"
        />
        <MetricCard
          label="已复核来源"
          value={`${trustedCount}/${filteredPrices.length}`}
          detail="同时具备来源、更新时间和可信度标签"
        />
        <MetricCard
          label="最低输入价格"
          value={
            filteredPrices[0]
              ? formatMoney(
                  Math.min(...filteredPrices.map((item) => item.inputPricePer1M)),
                  filteredPrices[0].currency,
                )
              : "-"
          }
          detail="按当前筛选结果自动计算"
        />
        <MetricCard
          label="最低输出价格"
          value={
            filteredPrices[0]
              ? formatMoney(
                  Math.min(...filteredPrices.map((item) => item.outputPricePer1M)),
                  filteredPrices[0].currency,
                )
              : "-"
          }
          detail="更适合先做预算上限预估"
        />
      </div>

      {filteredPrices.length === 0 ? (
        <Card className="surface-card rounded-[12px] border-border">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary/8">
              <SearchXIcon className="size-6 text-primary" />
            </div>
            <div className="text-lg font-semibold">没找到匹配结果</div>
            <p className="max-w-[36rem] text-sm leading-6 text-muted-foreground">
              当前筛选条件下没有可显示的模型。你可以放宽分类、切换供应商平台，或者清空关键词后再看一遍。
            </p>
            <button
              type="button"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
              onClick={() => {
                setProvider("all");
                setPlatform("all");
                setCategory("all");
                setSortBy("input");
                setQuery("");
              }}
            >
              重置筛选
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[12px] border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模型</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>输入 / 1M</TableHead>
                  <TableHead>输出 / 1M</TableHead>
                  <TableHead>上下文</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>可信度</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrices.map((item) => {
                  const evidence = buildEvidenceSummary(item);

                  return (
                    <TableRow key={item.id} className="hover:bg-accent/60">
                      <TableCell className="whitespace-normal">
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold">{item.modelName}</div>
                          <div className="text-xs text-muted-foreground">{item.provider}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.platform}</TableCell>
                      <TableCell>{formatMoney(item.inputPricePer1M, item.currency)}</TableCell>
                      <TableCell>{formatMoney(item.outputPricePer1M, item.currency)}</TableCell>
                      <TableCell>{item.contextWindow ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{renderCategoryLabel(item.category)}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[14rem]">
                        <EvidenceBadgeGroup
                          summary={evidence}
                          sourceUrl={item.sourceUrl}
                          compact
                        />
                      </TableCell>
                      <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredPrices.map((item) => {
              const evidence = buildEvidenceSummary(item);

              return (
                <Card key={item.id} className="motion-surface motion-surface--green rounded-[12px] border-border">
                  <CardHeader className="gap-3 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-[0.98rem]">{item.modelName}</CardTitle>
                        <CardDescription className="mt-1 text-[12px]">
                          {item.provider} · {item.platform}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {renderCategoryLabel(item.category)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 px-4 pb-4">
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                      <InfoPill
                        label="输入 / 1M"
                        value={formatMoney(item.inputPricePer1M, item.currency)}
                        active={cheapestInput === item.inputPricePer1M}
                      />
                      <InfoPill
                        label="输出 / 1M"
                        value={formatMoney(item.outputPricePer1M, item.currency)}
                        active={cheapestOutput === item.outputPricePer1M}
                      />
                      <InfoPill label="上下文" value={item.contextWindow ?? "-"} />
                      <InfoPill label="更新" value={formatDate(item.updatedAt)} />
                    </div>
                    <p className="rounded-[10px] border border-border bg-background/70 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
                      {item.note}
                    </p>
                    <EvidenceBadgeGroup
                      summary={evidence}
                      sourceUrl={item.sourceUrl}
                      compact
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card motion-surface motion-surface--cyan rounded-[12px] px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="text-[12px] text-muted-foreground sm:text-sm">{label}</div>
      <div className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-foreground sm:mt-2 sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-[12px] leading-5 text-muted-foreground sm:text-sm">{detail}</div>
    </div>
  );
}

function TokenFilterSelect({
  label,
  value,
  onValueChange,
  items,
  renderLabel,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: string[];
  renderLabel: (value: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>{renderLabel(value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {renderLabel(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function InfoPill({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[4.1rem] flex-col justify-between gap-1 rounded-[10px] border bg-background/70 p-3",
        active ? "border-primary/25 bg-primary/7" : "border-border",
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("font-medium", active && "text-primary")}>{value}</span>
    </div>
  );
}

function renderProviderLabel(value: string) {
  if (value === "all") return "全部供应商";
  return value;
}

function renderPlatformLabel(value: string) {
  if (value === "all") return "全部平台";
  return value;
}

function renderSortLabel(value: string) {
  if (value === "input") return "按输入价";
  if (value === "output") return "按输出价";
  if (value === "updated") return "按最近更新时间";

  return value === "all" ? "默认排序" : value;
}

function renderCategoryLabel(value: string) {
  const map: Record<string, string> = {
    all: "全部分类",
    text: "文本",
    vision: "视觉",
    audio: "音频",
    embedding: "Embedding",
    reasoning: "推理",
  };

  return map[value] ?? value;
}
