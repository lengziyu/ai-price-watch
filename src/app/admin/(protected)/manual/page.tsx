import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminManualDealForm } from "@/components/admin/admin-manual-deal-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getManualDeals } from "@/lib/admin-store";
import {
  renderDealStatusLabel,
  renderDealTypeLabel,
  renderRiskLevelLabel,
} from "@/lib/admin-utils";

export default async function AdminManualPage() {
  const manualDeals = await getManualDeals();

  return (
    <>
      <AdminPageHeader
        kicker="manual entry"
        title="手动录入 AI 优惠"
        description="先录入来源明确、时效性强的优惠和免费额度，避免把噪声信息直接混进前台。"
      />

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>新建录入</CardTitle>
            <CardDescription>提交后写入本地 JSON，并自动写一条操作日志。</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <AdminManualDealForm />
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[14px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>最近录入</CardTitle>
            <CardDescription>优先关注最新补录内容，方便继续复核和后续接前台。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {manualDeals.length ? (
              manualDeals.slice(0, 8).map((deal) => (
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
                    {deal.suitableFor.slice(0, 3).map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-pane text-sm text-muted-foreground">
                还没有手动录入内容，先从第一条 AI 优惠开始。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
