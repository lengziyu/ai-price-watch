"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ArrowUpRightIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TokenPrice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedSectionTitle } from "@/components/shared/animated-section-title";
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

  const filters = (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索模型或平台"
          className="w-full pl-9"
        />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {["all", "reasoning", "text", "vision", "embedding", "audio"].map(
            (item) => (
              <TabsTrigger key={item} value={item}>
                {renderCategoryLabel(item)}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-3">
        <TokenFilterSelect
          label="供应商"
          value={provider}
          onValueChange={setProvider}
          items={["all", ...providers]}
        />
        <TokenFilterSelect
          label="平台"
          value={platform}
          onValueChange={setPlatform}
          items={["all", ...platforms]}
        />
        <TokenFilterSelect
          label="排序"
          value={sortBy}
          onValueChange={setSortBy}
          items={["input", "output", "updated"]}
        />
      </div>
    </div>
  );

  return (
    <section className="app-shell flex flex-col gap-5 rounded-[12px] border border-border bg-background px-4 py-6 sm:px-5 sm:py-6 lg:px-6">
      <Card className="rounded-xl border-border bg-card/90">
        <CardHeader className="gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="mono-kicker text-[12px] uppercase text-muted-foreground">
                token pricing
              </div>
              <AnimatedSectionTitle>API Token 比价</AnimatedSectionTitle>
              <CardDescription>
                当前数据优先取官方价格页，适合先做成本感知与模型初筛。
              </CardDescription>
            </div>

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
                <div className="px-4 pb-6">{filters}</div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:block">{filters}</div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="当前模型数"
          value={String(filteredPrices.length)}
          detail="已按筛选条件收敛结果"
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
              <TableHead>更新时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.map((item) => (
              <TableRow key={item.id} className="hover:bg-accent/60">
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{item.modelName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.provider}</span>
                      {item.sourceUrl ? (
                        <Link
                          href={item.sourceUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-foreground hover:underline"
                        >
                          来源
                          <ArrowUpRightIcon className="size-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.platform}</TableCell>
                <TableCell>{formatMoney(item.inputPricePer1M, item.currency)}</TableCell>
                <TableCell>{formatMoney(item.outputPricePer1M, item.currency)}</TableCell>
                <TableCell>{item.contextWindow ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{renderCategoryLabel(item.category)}</Badge>
                </TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {filteredPrices.map((item) => (
          <Card key={item.id} className="surface-card rounded-xl">
            <CardHeader className="gap-3 px-5 py-5">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">{item.modelName}</CardTitle>
                <CardDescription>{item.provider}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoPill label="输入" value={formatMoney(item.inputPricePer1M, item.currency)} />
                <InfoPill label="输出" value={formatMoney(item.outputPricePer1M, item.currency)} />
                <InfoPill label="分类" value={renderCategoryLabel(item.category)} />
                <InfoPill label="上下文" value={item.contextWindow ?? "-"} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{item.note}</p>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{formatDate(item.updatedAt)}</span>
                {item.sourceUrl ? (
                  <Link
                    href={item.sourceUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-medium text-foreground"
                  >
                    查看来源
                    <ArrowUpRightIcon className="size-3.5" />
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
    <div className="surface-card rounded-[12px] px-5 py-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}

function TokenFilterSelect({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: string[];
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
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {renderSelectLabel(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-border bg-background/70 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function renderSelectLabel(value: string) {
  if (value === "all") return "全部";
  if (value === "input") return "按输入价";
  if (value === "output") return "按输出价";
  if (value === "updated") return "按最近更新时间";

  return value;
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
