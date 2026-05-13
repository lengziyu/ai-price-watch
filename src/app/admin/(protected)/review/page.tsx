import Link from "next/link";
import { ArrowUpRightIcon, TriangleAlertIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSourceReviewForm } from "@/components/admin/admin-source-review-form";
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
import { getCrawlSnapshot, getSourceReviews } from "@/lib/admin-store";
import { getReviewQueue, renderSourceReviewStatusLabel } from "@/lib/admin-utils";
import { formatDate } from "@/lib/format";

export default async function AdminReviewPage() {
  const [snapshot, sourceReviews] = await Promise.all([
    getCrawlSnapshot(),
    getSourceReviews(),
  ]);
  const reviewQueue = getReviewQueue(snapshot, sourceReviews);
  const failedCount = reviewQueue.filter((item) => item.status === "失败").length;
  const pendingCount = reviewQueue.length - failedCount;
  const latestReviews = sourceReviews.slice(0, 6);

  return (
    <>
      <AdminPageHeader
        kicker="review queue"
        title="人工复核"
        description="自动抓取只负责发现变化，不直接替代人工判断。这里集中看失败源、结构变化和 review 置信度内容。"
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="待处理" value={String(reviewQueue.length)} detail="失败源与低置信度来源" />
        <MetricCard label="抓取失败" value={String(failedCount)} detail="优先判断是否要改人工维护" />
        <MetricCard label="已留痕" value={String(sourceReviews.length)} detail="来源复核历史记录" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="surface-card motion-surface motion-surface--green rounded-[10px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>处理复核项</CardTitle>
            <CardDescription>
              选择一个来源，写入结论后会自动进入来源复核记录，并重新收敛待处理队列。
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <AdminSourceReviewForm queue={reviewQueue} />
          </CardContent>
        </Card>

        <Card className="surface-card motion-surface motion-surface--blue rounded-[10px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>最近处理</CardTitle>
            <CardDescription>
              保留最近 6 条来源复核结论，方便回看为什么某个源被确认、归档或继续跟进。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {latestReviews.length ? (
              latestReviews.map((review) => (
                <div key={review.id} className="admin-entry-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold">{review.vendor}</div>
                    <Badge variant="secondary">
                      {renderSourceReviewStatusLabel(review.reviewStatus)}
                    </Badge>
                    <Badge variant="outline">{review.category}</Badge>
                    <Badge variant="outline">{formatDate(review.reviewedAt)}</Badge>
                  </div>
                  <div className="mt-2 line-clamp-2 text-[13px] text-foreground/88">
                    {review.title}
                  </div>
                  <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                    {review.note}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{review.actor}</span>
                    <Link
                      href={review.sourceUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                    >
                      源地址
                      <ArrowUpRightIcon className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-pane text-sm text-muted-foreground">
                还没有来源复核记录。处理第一条之后，这里会展示最近结论。
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card motion-surface motion-surface--amber rounded-[10px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>待处理队列</CardTitle>
          <CardDescription>
            还剩 {reviewQueue.length} 条，其中 {pendingCount} 条待确认、{failedCount} 条抓取失败。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {reviewQueue.length ? (
            <div className="overflow-hidden rounded-[10px] border border-border bg-background/68">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状态</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>条目</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>更新时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewQueue.map((item) => (
                    <TableRow key={item.id} className="hover:bg-primary/[0.045]">
                      <TableCell>
                        <Badge variant={item.status === "失败" ? "outline" : "secondary"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.item}</TableCell>
                      <TableCell className="max-w-[28rem] whitespace-normal text-muted-foreground">
                        {item.reason}
                      </TableCell>
                      <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="admin-pane flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlertIcon className="size-4 text-primary" />
              当前没有待复核项。
            </div>
          )}
        </CardContent>
      </Card>
    </>
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
    <div className="surface-card motion-surface motion-surface--cyan rounded-[10px] border-border px-5 py-4">
      <div className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{detail}</div>
    </div>
  );
}
