const USD_TO_CNY_RATE = 6.83;

export function formatMoney(
  value: number,
  currency: "USD" | "CNY" = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function estimateCnyFromUsd(value?: number) {
  if (!value) {
    return undefined;
  }

  return Math.round(value * USD_TO_CNY_RATE);
}

export function formatBadgeLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function formatBillingCycle(value: "monthly" | "yearly") {
  return value === "monthly" ? "月付" : "年付";
}

export function formatRiskLevel(value: "low" | "medium" | "high") {
  return {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
  }[value];
}

export function formatDealStatus(value: "active" | "expired" | "unknown") {
  return {
    active: "进行中",
    expired: "已结束",
    unknown: "待确认",
  }[value];
}

export function formatDealArticleStatus(value: "not_started" | "in_progress" | "ended") {
  return {
    not_started: "未开始",
    in_progress: "进行中",
    ended: "已结束",
  }[value];
}

export function formatDifficulty(value: "easy" | "medium" | "advanced") {
  return {
    easy: "容易上手",
    medium: "中等",
    advanced: "进阶",
  }[value];
}

export function formatCostBand(value: "free" | "low" | "medium" | "high") {
  return {
    free: "Free",
    low: "Low",
    medium: "Medium",
    high: "High",
  }[value];
}

export const fxReference = {
  source: "XE USD/CNY mid-market snapshot",
  reviewedAt: "2026-05-11",
  rate: USD_TO_CNY_RATE,
};
