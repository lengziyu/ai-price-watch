import {
  ArrowRightIcon,
  BarChart3Icon,
  DatabaseZapIcon,
  FilePenLineIcon,
  Globe2Icon,
  ShieldCheckIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrawlSnapshot, getManualDeals, getOperationLogs } from "@/lib/admin-store";
import { summarizeCrawlSnapshot, renderOperationTypeLabel } from "@/lib/admin-utils";

function formatPercent(value: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export default async function AdminOverviewPage() {
  const [snapshot, manualDeals, operationLogs] = await Promise.all([
    getCrawlSnapshot(),
    getManualDeals(),
    getOperationLogs(),
  ]);
  const summary = summarizeCrawlSnapshot(snapshot);
  const latestLogs = operationLogs.slice(0, 4);
  const totalResults = snapshot.results.length;
  const chartTotal = Math.max(totalResults, 1);
  const clearSucceeded = Math.max(summary.succeeded - summary.reviewCount, 0);
  const statusSegments = [
    { label: "通过", value: clearSucceeded, color: "#00bc7d" },
    { label: "待复核", value: summary.reviewCount, color: "#f59e0b" },
    { label: "失败", value: summary.failed, color: "#ef4444" },
  ];
  const signalRows = snapshot.results
    .map((item) => ({
      label: item.vendor,
      value: item.extraction?.priceSignals?.length ?? 0,
      ok: item.ok,
    }))
    .toSorted((left, right) => right.value - left.value)
    .slice(0, 5);
  const maxSignalCount = Math.max(...signalRows.map((item) => item.value), 1);
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;

  return (
    <>
      <AdminPageHeader
        kicker="overview"
        title="后台总览"
        description="把自动抓取、人工复核、手动录入和操作日志压到一屏里，快速判断今天的数据维护状态。"
        actions={
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/jobs"
              className={buttonVariants({
                size: "lg",
                className: "h-12 rounded-full px-7 shadow-[0_18px_44px_rgba(0,188,125,0.2)]",
              })}
            >
              查看采集任务
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <Link
              href="/admin/manual"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "h-12 rounded-full px-7 shadow-[0_12px_34px_rgba(2,44,34,0.08)]",
              })}
            >
              录入 AI 优惠
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="数据源总数"
          value={snapshot.targets}
          detail="当前接入的公开抓取目标"
          icon={<Globe2Icon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="抓取成功"
          value={summary.succeeded}
          detail="本轮抓取成功返回公开页面"
          icon={<DatabaseZapIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="待复核"
          value={summary.reviewCount}
          detail="命中 review 置信度或结构变化"
          icon={<ShieldCheckIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="手动优惠"
          value={manualDeals.length}
          detail="已写入本地 JSON 的人工补录内容"
          icon={<FilePenLineIcon className="size-4 text-primary" />}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <Card className="surface-card rounded-[10px] border-border">
          <CardHeader className="px-4 py-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-4 text-primary" />
              抓取状态分布
            </CardTitle>
            <CardDescription className="text-[12px] leading-5">
              本轮 {totalResults} 个结果，成功率 {formatPercent(summary.succeeded, totalResults)}。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-4 pb-4 md:grid-cols-[12rem_1fr] md:items-center">
            <div className="relative mx-auto size-40">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r={donutRadius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
                {statusSegments.filter((item) => item.value > 0).map((item) => {
                  const dash = (item.value / chartTotal) * donutCircumference;
                  const element = (
                    <circle
                      key={item.label}
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="none"
                      stroke={item.color}
                      strokeDasharray={`${dash} ${donutCircumference - dash}`}
                      strokeDashoffset={-donutOffset}
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  );
                  donutOffset += dash;
                  return element;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[2rem] font-semibold leading-none tracking-[-0.06em]">
                  {summary.succeeded}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">成功源</div>
              </div>
            </div>
            <div className="grid gap-2">
              {statusSegments.map((item) => (
                <div key={item.label} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-[12px]">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="size-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-primary/8">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: formatPercent(item.value, chartTotal),
                        background: item.color,
                      }}
                    />
                  </span>
                  <span className="font-medium tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[10px] border-border">
          <CardHeader className="px-4 py-3">
            <CardTitle>价格信号排行</CardTitle>
            <CardDescription className="text-[12px] leading-5">
              按本次抓到的价格片段数量排序。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 pb-4">
            {signalRows.map((item) => (
              <div key={item.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-[12px]">
                <div className="truncate font-medium">{item.label}</div>
                <div className="h-8 overflow-hidden rounded-[10px] bg-primary/8">
                  <div
                    className="flex h-full items-center justify-end rounded-[10px] bg-primary/80 px-2 text-[11px] font-semibold text-primary-foreground"
                    style={{ width: `${Math.max((item.value / maxSignalCount) * 100, item.value ? 14 : 4)}%` }}
                  >
                    {item.value ? item.value : ""}
                  </div>
                </div>
                <Badge variant={item.ok ? "secondary" : "outline"}>{item.ok ? "成功" : "失败"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[0.85fr_0.95fr_1.2fr]">
        <Card className="surface-card rounded-[10px] border-border">
          <CardHeader className="px-4 py-3">
            <CardTitle className="flex items-center gap-2">
              <WorkflowIcon className="size-4 text-primary" />
              当前工作流
            </CardTitle>
            <CardDescription className="text-[12px] leading-5">入口压缩到维护频率最高的三个动作。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 px-4 pb-4">
            {[
              {
                title: "采集任务",
                description: "定时抓取与手动触发。",
                href: "/admin/jobs",
              },
              {
                title: "人工复核",
                description: "失败源和 review 结果。",
                href: "/admin/review",
              },
              {
                title: "手动录入",
                description: "补优惠、权益和地区价。",
                href: "/admin/manual",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="admin-pane group flex items-center justify-between gap-3 px-3 py-2.5">
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground">{item.description}</span>
                </span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[10px] border-border">
          <CardHeader className="px-4 py-3">
            <CardTitle>最近操作</CardTitle>
            <CardDescription className="text-[12px] leading-5">保留最近 4 条后台行为。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 px-4 pb-4">
            {latestLogs.length ? (
              latestLogs.map((item) => (
                <div key={item.id} className="admin-job-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{renderOperationTypeLabel(item.type)}</span>
                      <Badge variant={item.status === "failure" ? "outline" : "secondary"}>
                        {item.actor}
                      </Badge>
                    </div>
                    <div className="mt-1 line-clamp-1 text-[12px] leading-5 text-muted-foreground">
                      {item.message}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <div>{item.createdAt.slice(5, 10)}</div>
                    <div>{item.createdAt.slice(11, 16)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-pane px-3 py-2.5 text-sm text-muted-foreground">还没有操作日志。</div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[10px] border-border">
          <CardHeader className="px-4 py-3">
            <CardTitle>最近抓取快照</CardTitle>
            <CardDescription className="text-[12px] leading-5">
              最近一次抓取：{snapshot.generatedAt.replace("T", " ").slice(0, 16)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
            {snapshot.results.slice(0, 4).map((item) => (
              <div key={item.id} className="admin-source-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{item.vendor}</div>
                  <Badge variant={item.ok ? "secondary" : "outline"}>
                    {item.ok ? "成功" : "失败"}
                  </Badge>
                </div>
                <div className="mt-2 line-clamp-1 text-sm text-foreground">
                  {item.title || item.url}
                </div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {item.ok
                    ? `抓到 ${item.extraction?.priceSignals?.length ?? 0} 条价格信号`
                    : item.error || "抓取失败"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
