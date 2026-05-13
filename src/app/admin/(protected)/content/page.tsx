import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { membershipVendorBoards } from "@/data/membership-rates";
import type { CrawlSnapshotResult, SourceReview } from "@/lib/admin-store";
import {
  getCrawlSnapshot,
  getManualDeals,
  getMembershipRateReviews,
  getSourceReviews,
} from "@/lib/admin-store";
import {
  renderDealStatusLabel,
  renderDealTypeLabel,
  renderMembershipCaptureMethodLabel,
  renderMembershipReviewStatusLabel,
  renderRiskLevelLabel,
  renderSourceReviewStatusLabel,
  summarizeCrawlSnapshot,
} from "@/lib/admin-utils";
import { formatDate } from "@/lib/format";

export default async function AdminContentPage() {
  const [snapshot, manualDeals, membershipReviews, sourceReviews] = await Promise.all([
    getCrawlSnapshot(),
    getManualDeals(),
    getMembershipRateReviews(),
    getSourceReviews(),
  ]);
  const snapshotSummary = summarizeCrawlSnapshot(snapshot);
  const sourceReviewById = new Map<string, SourceReview>();
  sourceReviews.forEach((review) => {
    if (!sourceReviewById.has(review.sourceId)) {
      sourceReviewById.set(review.sourceId, review);
    }
  });
  const membershipResults = snapshot.results.filter(
    (item) => item.surface === "membership-rates" || item.category === "membership-rate",
  );
  const membershipVendors = membershipVendorBoards.map((vendor) => {
    const sources = membershipResults.filter((item) => item.vendorId === vendor.id);
    const reviews = membershipReviews.filter((item) => item.vendorId === vendor.id);
    const succeeded = sources.filter((item) => item.ok).length;
    const latestFetchedAt = sources
      .map((item) => item.fetchedAt)
      .toSorted((left, right) => right.localeCompare(left))[0];

    return {
      vendor,
      sources,
      reviews,
      succeeded,
      failed: sources.length - succeeded,
      latestFetchedAt,
      latestReview: reviews[0],
    };
  });

  return (
    <>
      <AdminPageHeader
        kicker="content data"
        title="内容数据"
        description="抓取快照、会员速率源和人工录入放在同一页维护，后面要接数据库或审核流时也更顺手。"
      />

      <section className="space-y-4">
        <SectionHeader
          kicker="抓取快照"
          description="公共抓取脚本的最新结果。这里先看整体健康度，再看每个源的成功、失败和提取信号。"
        />
        <Card className="surface-card motion-surface motion-surface--green rounded-[10px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>抓取快照</CardTitle>
            <CardDescription>当前采用本地 JSON 存储，抓取侧已经拆到可按厂商聚合查看。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="抓取目标" value={String(snapshot.targets)} detail="当前脚本内置的公开价格页数量" />
              <MetricCard
                label="成功抓取"
                value={String(snapshotSummary.succeeded)}
                detail="返回了公开 HTML 并提取到正文"
              />
              <MetricCard
                label="待人工确认"
                value={String(snapshotSummary.reviewCount)}
                detail="有价格或计划信号，建议人工二次复核"
              />
              <MetricCard
                label="最近生成"
                value={formatDate(snapshot.generatedAt)}
                detail="最新本地抓取快照时间"
              />
              <MetricCard
                label="来源复核"
                value={String(sourceReviews.length)}
                detail="后台已处理的抓取源结论"
              />
            </div>

            <div className="rounded-[10px] border border-border bg-background/70 px-4 py-3 text-[12px] leading-6 text-muted-foreground">
              {snapshot.crawlPolicy}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {snapshot.results.map((item) => (
                <SourceSnapshotCard
                  key={item.id}
                  item={item}
                  latestReview={sourceReviewById.get(item.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          kicker="会员速率"
          description="把前台会员速率页的厂商、后台抓取源和人工复核记录并排放在一起，方便判断下一步该自动抓还是人工补。"
        />
        <Card className="surface-card motion-surface motion-surface--blue rounded-[10px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>会员速率维护面板</CardTitle>
            <CardDescription>公开页可抓的继续自动化，强反爬或地区价先走后台人工复核。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="会员厂商"
                value={String(membershipVendorBoards.length)}
                detail="前台会员速率页当前接入的厂商数量"
              />
              <MetricCard
                label="会员抓取源"
                value={String(membershipResults.length)}
                detail="已经纳入公共抓取快照的官方或帮助页"
              />
              <MetricCard
                label="人工复核"
                value={String(membershipReviews.length)}
                detail="403 或结构模糊的会员页可以人工补录在这里"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {membershipVendors.map(
                ({ vendor, sources, reviews, succeeded, failed, latestFetchedAt, latestReview }) => (
                  <Card key={vendor.id} className="surface-card motion-surface motion-surface--cyan rounded-[10px] border-border">
                    <CardHeader className="gap-3 px-5 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-[1rem]">{vendor.label}</CardTitle>
                            <Badge variant="secondary">{vendor.title}</Badge>
                            <Badge variant="outline">
                              {renderMembershipCaptureMethodLabel(vendor.collectionMode)}
                            </Badge>
                          </div>
                          <CardDescription className="text-[13px] leading-6">
                            {vendor.priceLabel} · {vendor.officialRate}
                          </CardDescription>
                          <div className="rounded-[10px] border border-border bg-background/72 px-3 py-2 text-[12px] leading-6 text-muted-foreground">
                            {vendor.maintenanceTip}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge variant="outline">{vendor.plans.length} 个套餐</Badge>
                          <Badge variant="outline">{sources.length} 条抓取源</Badge>
                          <Badge variant="outline">{reviews.length} 条复核</Badge>
                          <Badge variant={failed ? "outline" : "secondary"}>
                            {failed ? `${failed} 条失败` : `${succeeded} 条成功`}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                        <Link
                          href={vendor.officialSource}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                        >
                          官方入口
                          <ArrowUpRightIcon className="size-3.5" />
                        </Link>
                        <span>最近抓取：{latestFetchedAt ? formatDate(latestFetchedAt) : "尚未抓取"}</span>
                        <span>
                          最近复核：{latestReview ? formatDate(latestReview.reviewedAt) : "暂无人工记录"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 px-5 pb-5">
                      {latestReview ? (
                        <div className="rounded-[10px] border border-primary/14 bg-primary/[0.045] px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold">
                              最近人工复核 · {latestReview.planName}
                            </div>
                            <Badge variant="secondary">
                              {renderMembershipReviewStatusLabel(latestReview.reviewStatus)}
                            </Badge>
                            <Badge variant="outline">
                              {renderMembershipCaptureMethodLabel(latestReview.captureMethod)}
                            </Badge>
                          </div>
                          <div className="mt-2 text-[12px] text-muted-foreground">
                            {latestReview.priceSummary}
                            {latestReview.regionScope ? ` · ${latestReview.regionScope}` : ""}
                          </div>
                          <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                            {latestReview.note}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{latestReview.actor}</span>
                            <Link
                              href={latestReview.sourceUrl}
                              target="_blank"
                              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                            >
                              复核来源
                              <ArrowUpRightIcon className="size-3.5" />
                            </Link>
                            {latestReview.evidenceUrl ? (
                              <Link
                                href={latestReview.evidenceUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                              >
                                证据链接
                                <ArrowUpRightIcon className="size-3.5" />
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {sources.length ? (
                        sources.map((item) => (
                          <SourceSnapshotCard
                            key={item.id}
                            item={item}
                            latestReview={sourceReviewById.get(item.id)}
                            compact
                          />
                        ))
                      ) : (
                        <div className="rounded-[10px] border border-dashed border-border bg-background/55 px-4 py-3 text-[12px] text-muted-foreground">
                          这个厂商已经在前台展示，但还没有接入抓取源。
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          kicker="手动优惠"
          description="保留人工补录的前台优惠数据，方便和抓取快照一起复核、对齐并准备发布。"
        />
        <Card className="surface-card motion-surface motion-surface--amber rounded-[10px] border-border">
          <CardHeader className="px-5 py-4">
            <CardTitle>手动优惠</CardTitle>
            <CardDescription>当前还没有真正接入数据库，所以这里先保留本地 JSON 的内容视图。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-2">
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
          </CardContent>
        </Card>
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
    <div className="rounded-[10px] border border-border bg-background/78 px-4 py-4">
      <div className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-2 text-[1.35rem] font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-[12px] leading-6 text-muted-foreground">{detail}</div>
    </div>
  );
}

function SourceSnapshotCard({
  item,
  latestReview,
  compact = false,
}: {
  item: CrawlSnapshotResult;
  latestReview?: SourceReview;
  compact?: boolean;
}) {
  const signalLabel = item.ok
    ? `价格信号 ${item.extraction?.priceSignals?.length ?? 0} 条，计划信号 ${item.extraction?.planSignals?.length ?? 0} 条`
    : item.error || "抓取失败";

  return (
    <div
      className={
        compact
          ? "rounded-[10px] border border-border bg-background/68 px-4 py-3"
          : "admin-source-card"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold">{item.vendor}</div>
            {item.sourceLabel ? <Badge variant="outline">{item.sourceLabel}</Badge> : null}
          </div>
          <div className="mt-2 line-clamp-2 text-sm text-foreground/88">
            {item.title || item.url}
          </div>
        </div>
        <Badge variant={item.ok ? "secondary" : "outline"}>{item.ok ? "成功" : "失败"}</Badge>
      </div>
      <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{signalLabel}</div>
      {latestReview ? (
        <div className="mt-3 rounded-[10px] border border-primary/14 bg-primary/[0.045] px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {renderSourceReviewStatusLabel(latestReview.reviewStatus)}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {latestReview.actor} · {formatDate(latestReview.reviewedAt)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
            {latestReview.note}
          </p>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span>{formatDate(item.fetchedAt)}</span>
        <Link
          href={item.url}
          target="_blank"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
        >
          源地址
          <ArrowUpRightIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
