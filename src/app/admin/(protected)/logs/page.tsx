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
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getOperationLogs } from "@/lib/admin-store";
import {
  renderOperationStatusLabel,
  renderOperationTypeLabel,
} from "@/lib/admin-utils";

export default async function AdminLogsPage() {
  const logs = await getOperationLogs();

  return (
    <>
      <AdminPageHeader
        kicker="operation logs"
        title="操作日志"
        description="先把登录、退出、手动录入和抓取触发这些核心后台动作留痕，避免后面接真实数据后无从追查。"
      />

      <Card className="surface-card rounded-[14px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>最近日志</CardTitle>
          <CardDescription>当前只保留最近 300 条，本地开发阶段已经足够。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {logs.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>操作者</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>说明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdAt.replace("T", " ").slice(0, 16)}</TableCell>
                    <TableCell>{renderOperationTypeLabel(item.type)}</TableCell>
                    <TableCell className="font-medium text-foreground">{item.actor}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "failure" ? "outline" : "secondary"}>
                        {renderOperationStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[26rem] whitespace-normal text-muted-foreground">
                      {item.detail ? `${item.message} · ${item.detail}` : item.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="admin-pane text-sm text-muted-foreground">还没有操作日志。</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
