import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCrawlSnapshot, getManualDeals } from "@/lib/admin-store";
import {
  renderDealStatusLabel,
  renderDealTypeLabel,
  renderRiskLevelLabel,
} from "@/lib/admin-utils";

export default async function AdminContentPage() {
  const [snapshot, manualDeals] = await Promise.all([getCrawlSnapshot(), getManualDeals()]);

  return (
    <>
      <AdminPageHeader
        kicker="content data"
        title="内容数据"
        description="抓取快照和人工录入先并排放在一起，方便后续做合并发布或接入真实数据库。"
      />

      <Card className="surface-card rounded-[14px] border-border">
        <CardHeader className="px-5 py-4">
          <CardTitle>数据面板</CardTitle>
          <CardDescription>当前采用本地 JSON 存储，后续可以平滑替换为 DB。</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Tabs defaultValue="snapshot" className="gap-4">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="snapshot">抓取快照</TabsTrigger>
              <TabsTrigger value="manual">手动优惠</TabsTrigger>
            </TabsList>

            <TabsContent value="snapshot" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {snapshot.results.map((item) => (
                <div key={item.id} className="admin-source-card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{item.vendor}</div>
                    <Badge variant={item.ok ? "secondary" : "outline"}>
                      {item.ok ? "成功" : "失败"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">{item.title || item.url}</div>
                  <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                    {item.ok
                      ? `价格信号 ${item.extraction?.priceSignals?.length ?? 0} 条，计划信号 ${item.extraction?.planSignals?.length ?? 0} 条`
                      : item.error || "抓取失败"}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="manual" className="grid gap-3 md:grid-cols-2">
              {manualDeals.length ? (
                manualDeals.map((deal) => (
                  <div key={deal.id} className="admin-entry-card">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">{deal.title}</div>
                      <Badge variant="secondary">{renderDealStatusLabel(deal.status)}</Badge>
                      <Badge variant="outline">{renderRiskLevelLabel(deal.riskLevel)}</Badge>
                    </div>
                    <div className="mt-2 text-[12px] text-muted-foreground">{deal.provider}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{deal.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{renderDealTypeLabel(deal.dealType)}</Badge>
                      {deal.value ? <Badge variant="outline">{deal.value}</Badge> : null}
                      {deal.deadline ? <Badge variant="outline">截止 {deal.deadline}</Badge> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-pane text-sm text-muted-foreground">还没有手动优惠数据。</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
