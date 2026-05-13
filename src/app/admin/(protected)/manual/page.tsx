import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { AdminManualDealForm } from "@/components/admin/admin-manual-deal-form";
import { AdminMembershipRateReviewForm } from "@/components/admin/admin-membership-rate-review-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getManualDeals, getMembershipRateReviews } from "@/lib/admin-store";
import {
  renderDealStatusLabel,
  renderDealTypeLabel,
  renderMembershipCaptureMethodLabel,
  renderMembershipReviewStatusLabel,
  renderRiskLevelLabel,
} from "@/lib/admin-utils";
import { formatDate } from "@/lib/format";

export default async function AdminManualPage() {
  const [manualDeals, membershipReviews] = await Promise.all([
    getManualDeals(),
    getMembershipRateReviews(),
  ]);

  return (
    <>
      <AdminPageHeader
        kicker="manual entry"
        title="手动录入与人工复核"
        description="高时效优惠和强反爬的会员页都在这里维护。公开抓取拿不到的时候，先把可靠来源和复核结论补进来。"
      />

      <section className="space-y-4">
        <SectionHeader
          kicker="AI 优惠"
          description="录入前台要展示的优惠、免费额度、学生权益和地区价。"
        />
        <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
          <Card className="surface-card motion-surface motion-surface--green rounded-[10px] border-border">
            <CardHeader className="px-5 py-4">
              <CardTitle>新建录入</CardTitle>
              <CardDescription>提交后写入本地 JSON，并自动写一条操作日志。</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AdminManualDealForm />
            </CardContent>
          </Card>

          <Card className="surface-card motion-surface motion-surface--blue rounded-[10px] border-border">
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
      </section>

      <section className="space-y-4">
        <SectionHeader
          kicker="会员速率复核"
          description="针对公开页 403、帮助中心文案模糊、地区化价格或套餐差异需要人工确认的场景。"
        />
        <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
          <Card className="surface-card motion-surface motion-surface--cyan rounded-[10px] border-border">
            <CardHeader className="px-5 py-4">
              <CardTitle>补录会员速率</CardTitle>
              <CardDescription>
                适合公开页 403、地区化价格、帮助中心写法模糊，或者需要人工确认套餐差异的情况。
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AdminMembershipRateReviewForm />
            </CardContent>
          </Card>

          <Card className="surface-card motion-surface motion-surface--amber rounded-[10px] border-border">
            <CardHeader className="px-5 py-4">
              <CardTitle>最近复核</CardTitle>
              <CardDescription>
                这里保留最近的人肉确认结果，内容页会把它们挂到对应厂商卡片上。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              {membershipReviews.length ? (
                membershipReviews.slice(0, 8).map((review) => (
                  <div key={review.id} className="admin-entry-card">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">
                        {review.vendorLabel} · {review.planName}
                      </div>
                      <Badge variant="secondary">
                        {renderMembershipReviewStatusLabel(review.reviewStatus)}
                      </Badge>
                      <Badge variant="outline">
                        {renderMembershipCaptureMethodLabel(review.captureMethod)}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[12px] text-muted-foreground">
                      {review.priceSummary}
                      {review.regionScope ? ` · ${review.regionScope}` : ""}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.note}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formatDate(review.reviewedAt)}</Badge>
                      <Badge variant="outline">{review.actor}</Badge>
                      <Link
                        href={review.sourceUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[12px] font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                      >
                        官方来源
                        <ArrowUpRightIcon className="size-3.5" />
                      </Link>
                      {review.evidenceUrl ? (
                        <Link
                          href={review.evidenceUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[12px] font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                        >
                          复核证据
                          <ArrowUpRightIcon className="size-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-pane text-sm text-muted-foreground">
                  还没有会员速率复核记录。遇到 403 或地区化价格时，可以先在这里补第一条。
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  kicker,
  description,
}: {
  kicker: string;
  description: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-background/72 px-4 py-3">
      <div className="text-sm font-semibold text-foreground">{kicker}</div>
      <div className="mt-1 text-[12px] leading-6 text-muted-foreground">{description}</div>
    </div>
  );
}
