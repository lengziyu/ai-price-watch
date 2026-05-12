import { Clock3Icon, DatabaseZapIcon, RefreshCcwIcon, ShieldCheckIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTriggerCrawlForm } from "@/components/admin/admin-trigger-crawl-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCrawlSnapshot } from "@/lib/admin-store";
import { summarizeCrawlSnapshot } from "@/lib/admin-utils";

const collectionJobs = [
  {
    name: "订阅价格抓取",
    cadence: "每 6 小时",
    source: "OpenAI / Anthropic / Google / Cursor",
    status: "运行中",
    nextRun: "06:30",
  },
  {
    name: "会员速率复核",
    cadence: "每日 1 次",
    source: "官方文档 + 社区体感",
    status: "人工确认",
    nextRun: "09:00",
  },
  {
    name: "AI 优惠巡检",
    cadence: "每 12 小时",
    source: "公开活动页",
    status: "待补录",
    nextRun: "12:00",
  },
];

export default async function AdminJobsPage() {
  const snapshot = await getCrawlSnapshot();
  const summary = summarizeCrawlSnapshot(snapshot);

  return (
    <>
      <AdminPageHeader
        kicker="crawl jobs"
        title="采集任务"
        description="先用最小可用策略跑公开价格页，手动触发补充及时性，再把异常源打回人工复核。"
        actions={<AdminTriggerCrawlForm />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="最近抓取时间"
          value={snapshot.generatedAt.slice(11, 16)}
          detail={snapshot.generatedAt.slice(0, 10)}
          icon={<Clock3Icon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="成功源"
          value={String(summary.succeeded)}
          detail="公开页抓取成功"
          icon={<DatabaseZapIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="待复核"
          value={String(summary.reviewCount)}
          detail="价格信号需人工确认"
          icon={<ShieldCheckIcon className="size-4 text-primary" />}
        />
        <AdminStatCard
          label="失败源"
          value={String(summary.failed)}
          detail="403 或结构变化"
          icon={<RefreshCcwIcon className="size-4 text-primary" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>任务面板</CardTitle>
            <CardDescription>先把定时策略、目标源和下次运行时点明确写死。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {collectionJobs.map((job) => (
              <div key={job.name} className="admin-job-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{job.name}</span>
                    <Badge variant={job.status === "运行中" ? "secondary" : "outline"}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                    {job.source}
                  </div>
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <div>{job.cadence}</div>
                  <div>下次 {job.nextRun}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>最近一次抓取结果</CardTitle>
            <CardDescription>直接看每个源抓取是否成功、抓到多少信号以及是否需要复核。</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>厂商</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>价格信号</TableHead>
                  <TableHead>来源</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshot.results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{item.vendor}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Badge variant={item.ok ? "secondary" : "outline"}>
                        {item.ok ? "成功" : "失败"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.extraction?.priceSignals?.length ?? 0}</TableCell>
                    <TableCell className="max-w-[20rem] whitespace-normal text-muted-foreground">
                      {item.title || item.url}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
