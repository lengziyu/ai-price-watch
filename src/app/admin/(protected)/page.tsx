import {
  DatabaseZapIcon,
  FilePenLineIcon,
  Globe2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCrawlSnapshot, getManualDeals, getOperationLogs } from "@/lib/admin-store";
import { summarizeCrawlSnapshot, renderOperationTypeLabel } from "@/lib/admin-utils";

export default async function AdminOverviewPage() {
  const [snapshot, manualDeals, operationLogs] = await Promise.all([
    getCrawlSnapshot(),
    getManualDeals(),
    getOperationLogs(),
  ]);
  const summary = summarizeCrawlSnapshot(snapshot);
  const latestLogs = operationLogs.slice(0, 5);

  return (
    <>
      <AdminPageHeader
        kicker="overview"
        title="后台总览"
        description="把自动抓取、人工复核、手动录入和操作日志放到一套后台里，先保证能跑、能查、能追溯。"
        actions={
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/jobs" className={buttonVariants({ size: "sm" })}>
              查看采集任务
            </Link>
            <Link href="/admin/manual" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              录入 AI 优惠
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="数据源总数"
          value={String(snapshot.targets)}
          detail="当前接入的公开抓取目标"
          icon={<Globe2Icon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="抓取成功"
          value={String(summary.succeeded)}
          detail="本轮抓取成功返回公开页面"
          icon={<DatabaseZapIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="待复核"
          value={String(summary.reviewCount)}
          detail="命中 review 置信度或结构变化"
          icon={<ShieldCheckIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="手动优惠"
          value={String(manualDeals.length)}
          detail="已写入本地 JSON 的人工补录内容"
          icon={<FilePenLineIcon className="size-4 text-primary" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>当前工作流</CardTitle>
            <CardDescription>拆成独立页面后，后台更适合连续维护。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {[
              {
                title: "采集任务",
                description: "支持定时抓取和手动触发，输出统一快照文件。",
                href: "/admin/jobs",
              },
              {
                title: "人工复核",
                description: "集中看抓取失败与 review 置信度结果，减少漏看。",
                href: "/admin/review",
              },
              {
                title: "手动录入",
                description: "补时效性强的 AI 优惠、学生权益和地区价。",
                href: "/admin/manual",
              },
            ].map((item) => (
              <div key={item.title} className="admin-pane">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <p className="mt-1 text-[12px] leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    进入
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>最近操作</CardTitle>
            <CardDescription>先把最基础的后台行为留痕做好。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
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
                    <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      {item.message}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <div>{item.createdAt.slice(0, 10)}</div>
                    <div>{item.createdAt.slice(11, 16)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-pane text-sm text-muted-foreground">还没有操作日志。</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card rounded-[14px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>最近抓取快照</CardTitle>
          <CardDescription>最近一次抓取发生在 {snapshot.generatedAt.replace("T", " ").slice(0, 16)}。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.results.slice(0, 6).map((item) => (
            <div key={item.id} className="admin-source-card">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{item.vendor}</div>
                <Badge variant={item.ok ? "secondary" : "outline"}>
                  {item.ok ? "成功" : "失败"}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-foreground">
                {item.title || item.url}
              </div>
              <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                {item.ok
                  ? `抓到 ${item.extraction?.priceSignals?.length ?? 0} 条价格信号`
                  : item.error || "抓取失败"}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
