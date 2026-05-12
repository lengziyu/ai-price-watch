import { TriangleAlertIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
import { getReviewQueue } from "@/lib/admin-utils";

export default async function AdminReviewPage() {
  const snapshot = await getCrawlSnapshot();
  const reviewQueue = getReviewQueue(snapshot);

  return (
    <>
      <AdminPageHeader
        kicker="review queue"
        title="人工复核"
        description="自动抓取只负责发现变化，不直接替代人工判断。这里集中看失败源、结构变化和 review 置信度内容。"
      />

      <Card className="surface-card rounded-[14px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>待处理队列</CardTitle>
          <CardDescription>按照最近更新时间排序，先处理失败源，再确认价格信号。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {reviewQueue.length ? (
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
                  <TableRow key={item.id}>
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
                    <TableCell>{item.updatedAt.replace("T", " ").slice(0, 16)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
