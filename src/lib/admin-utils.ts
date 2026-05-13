import type { AIDeal } from "@/types";

import type { AdminOperationLog, CrawlSnapshot, SourceReview } from "@/lib/admin-store";

export function summarizeCrawlSnapshot(snapshot: CrawlSnapshot) {
  const succeeded = snapshot.results.filter((item) => item.ok).length;
  const failed = snapshot.results.length - succeeded;
  const reviewCount = snapshot.results.filter(
    (item) => item.ok && item.extraction?.confidence === "review",
  ).length;

  return {
    succeeded,
    failed,
    reviewCount,
  };
}

export function getReviewQueue(snapshot: CrawlSnapshot, sourceReviews: SourceReview[] = []) {
  const latestReviewBySource = new Map<string, SourceReview>();

  sourceReviews.forEach((review) => {
    if (!latestReviewBySource.has(review.sourceId)) {
      latestReviewBySource.set(review.sourceId, review);
    }
  });

  return snapshot.results
    .filter((item) => !item.ok || item.extraction?.confidence === "review")
    .filter((item) => {
      const latestReview = latestReviewBySource.get(item.id);

      if (!latestReview) {
        return true;
      }

      return latestReview.reviewStatus === "needs_update";
    })
    .map((item) => ({
      id: item.id,
      type: item.category,
      item: item.title || item.vendor,
      reason: item.ok
        ? "抓到价格信号但置信度仍需人工确认。"
        : item.error || "抓取失败，需要人工排查。",
      updatedAt: item.fetchedAt,
      sourceUrl: item.url,
      status: item.ok ? "待确认" : "失败",
      vendor: item.vendor,
      ok: item.ok,
    }));
}

export function renderDealTypeLabel(value: AIDeal["dealType"]) {
  switch (value) {
    case "free_credit":
      return "免费额度";
    case "discount":
      return "折扣优惠";
    case "trial":
      return "试用活动";
    case "student":
      return "学生权益";
    case "region_price":
      return "地区价";
    default:
      return "其他";
  }
}

export function renderRiskLevelLabel(value: AIDeal["riskLevel"]) {
  switch (value) {
    case "low":
      return "低风险";
    case "medium":
      return "中风险";
    case "high":
      return "高风险";
  }
}

export function renderDealStatusLabel(value: AIDeal["status"]) {
  switch (value) {
    case "active":
      return "进行中";
    case "expired":
      return "已结束";
    case "unknown":
      return "待确认";
  }
}

export function renderOperationTypeLabel(value: AdminOperationLog["type"]) {
  switch (value) {
    case "login_success":
      return "登录成功";
    case "login_failure":
      return "登录失败";
    case "logout":
      return "退出登录";
    case "manual_deal_create":
      return "手动录入";
    case "membership_rate_review_create":
      return "会员速率复核";
    case "source_review_create":
      return "来源复核";
    case "crawl_trigger":
      return "触发抓取";
  }
}

export function renderOperationStatusLabel(value: AdminOperationLog["status"]) {
  switch (value) {
    case "success":
      return "成功";
    case "failure":
      return "失败";
    case "info":
      return "信息";
  }
}

export function renderMembershipCaptureMethodLabel(
  value: "public_html" | "browser_assisted" | "manual_review",
) {
  switch (value) {
    case "public_html":
      return "公开页抓取";
    case "browser_assisted":
      return "浏览器辅助";
    case "manual_review":
      return "人工复核";
  }
}

export function renderMembershipReviewStatusLabel(
  value: "verified" | "blocked" | "needs_update",
) {
  switch (value) {
    case "verified":
      return "已确认";
    case "blocked":
      return "受限";
    case "needs_update":
      return "待更新";
  }
}

export function renderSourceReviewStatusLabel(
  value: "verified" | "needs_update" | "blocked" | "ignored",
) {
  switch (value) {
    case "verified":
      return "已确认";
    case "needs_update":
      return "仍需更新";
    case "blocked":
      return "受限归档";
    case "ignored":
      return "已忽略";
  }
}
