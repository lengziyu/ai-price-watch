import type { AIDeal } from "@/types";

import type { AdminOperationLog, CrawlSnapshot } from "@/lib/admin-store";

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

export function getReviewQueue(snapshot: CrawlSnapshot) {
  return snapshot.results
    .filter((item) => !item.ok || item.extraction?.confidence === "review")
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
