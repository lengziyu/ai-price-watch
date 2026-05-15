import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildDealArticleBody,
  createDealArticleSlug,
  detectDealArticleSourcePlatform,
  defaultDealArticleCoverImageUrl,
  inferDealArticleSummary,
  inferDealArticleTitle,
} from "@/lib/deal-articles";
import type { AIDeal, DealArticle } from "@/types";

const adminDataDir = path.join(process.cwd(), "data", "admin");
const publicDir = path.join(process.cwd(), "public");
const uploadedDealArticleCoverDir = path.join(publicDir, "uploads", "deal-articles");
const crawlDataFile = path.join(process.cwd(), "data", "crawl", "price-snapshot.json");
const manualDealsFile = path.join(adminDataDir, "manual-deals.json");
const dealArticlesFile = path.join(adminDataDir, "deal-articles.json");
const membershipRateReviewsFile = path.join(adminDataDir, "membership-rate-reviews.json");
const sourceReviewsFile = path.join(adminDataDir, "source-reviews.json");
const operationLogsFile = path.join(adminDataDir, "operation-logs.json");

export type CrawlSnapshotResult = {
  id: string;
  vendor: string;
  vendorId?: string;
  category: string;
  surface?: string;
  sourceLabel?: string;
  url: string;
  ok: boolean;
  fetchedAt: string;
  title?: string;
  description?: string;
  status?: number;
  byteLength?: number;
  error?: string;
  extraction?: {
    confidence?: string;
    priceSignals?: Array<{ value: string; context: string }>;
    planSignals?: Array<{ value: string; context: string }>;
  };
};

export type CrawlSnapshot = {
  generatedAt: string;
  crawlPolicy: string;
  targets: number;
  results: CrawlSnapshotResult[];
};

export type AdminOperationLog = {
  id: string;
  type:
    | "login_success"
    | "login_failure"
    | "logout"
    | "manual_deal_create"
    | "deal_article_publish"
    | "deal_article_update"
    | "deal_article_delete"
    | "membership_rate_review_create"
    | "source_review_create"
    | "crawl_trigger";
  actor: string;
  status: "success" | "failure" | "info";
  message: string;
  detail?: string;
  createdAt: string;
};

export type ManualDealInput = {
  title: string;
  provider: string;
  summary: string;
  dealType: AIDeal["dealType"];
  value?: string;
  deadline?: string;
  sourceUrl: string;
  howToGet: string;
  suitableFor: string[];
  riskLevel: AIDeal["riskLevel"];
  status: AIDeal["status"];
};

export type MembershipRateReview = {
  id: string;
  vendorId: string;
  vendorLabel: string;
  planName: string;
  priceSummary: string;
  regionScope?: string;
  sourceUrl: string;
  evidenceUrl?: string;
  captureMethod: "public_html" | "browser_assisted" | "manual_review";
  reviewStatus: "verified" | "blocked" | "needs_update";
  note: string;
  actor: string;
  reviewedAt: string;
};

export type DealArticleInput = {
  title: string;
  summary: string;
  rawContent: string;
  coverImage?: File;
  uploadedCoverImageUrl?: string;
  resetCoverImage?: boolean;
  sourcePlatform: DealArticle["sourcePlatform"];
  sourceUrl?: string;
  status: DealArticle["status"];
  tags: string[];
};

export type MembershipRateReviewInput = Omit<
  MembershipRateReview,
  "id" | "vendorLabel" | "actor" | "reviewedAt"
> & {
  vendorLabel: string;
};

export type SourceReview = {
  id: string;
  sourceId: string;
  vendor: string;
  category: string;
  title: string;
  sourceUrl: string;
  resultStatus: "ok" | "failed";
  reviewStatus: "verified" | "needs_update" | "blocked" | "ignored";
  note: string;
  actor: string;
  reviewedAt: string;
};

export type SourceReviewInput = Omit<SourceReview, "id" | "actor" | "reviewedAt">;

async function ensureAdminDataDir() {
  await mkdir(adminDataDir, { recursive: true });
}

async function ensureUploadedDealArticleCoverDir() {
  await mkdir(uploadedDealArticleCoverDir, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureAdminDataDir();
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function getManualDeals() {
  const deals = await readJsonFile<AIDeal[]>(manualDealsFile, []);
  return deals.toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getDealArticles() {
  const articles = await readJsonFile<DealArticle[]>(dealArticlesFile, []);
  return articles
    .map((article) => normalizeDealArticle(article))
    .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export async function getDealArticleTagOptions() {
  const articles = await getDealArticles();
  const tags = new Set<string>();

  for (const article of articles) {
    for (const tag of article.tags) {
      const normalized = tag.trim();
      if (normalized) {
        tags.add(normalized);
      }
    }
  }

  return [...tags].sort((left, right) => left.localeCompare(right, "zh-CN"));
}

export async function getDealArticleBySlug(slug: string) {
  const articles = await getDealArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getDealArticleById(id: string) {
  const articles = await getDealArticles();
  return articles.find((article) => article.id === id);
}

export async function getMembershipRateReviews() {
  const reviews = await readJsonFile<MembershipRateReview[]>(membershipRateReviewsFile, []);
  return reviews.toSorted((left, right) => right.reviewedAt.localeCompare(left.reviewedAt));
}

export async function getSourceReviews() {
  const reviews = await readJsonFile<SourceReview[]>(sourceReviewsFile, []);
  return reviews.toSorted((left, right) => right.reviewedAt.localeCompare(left.reviewedAt));
}

export async function getOperationLogs() {
  const logs = await readJsonFile<AdminOperationLog[]>(operationLogsFile, []);
  return logs.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getCrawlSnapshot() {
  return readJsonFile<CrawlSnapshot>(crawlDataFile, {
    generatedAt: new Date(0).toISOString(),
    crawlPolicy: "No crawl snapshot yet.",
    targets: 0,
    results: [],
  });
}

export async function appendOperationLog(
  input: Omit<AdminOperationLog, "id" | "createdAt">,
) {
  const logs = await getOperationLogs();
  const nextEntry: AdminOperationLog = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  await writeJsonFile(operationLogsFile, [nextEntry, ...logs].slice(0, 300));
  return nextEntry;
}

export async function createManualDeal(input: ManualDealInput, actor: string) {
  const deals = await getManualDeals();
  const nextDeal: AIDeal = {
    id: `manual-${randomUUID()}`,
    title: input.title,
    provider: input.provider,
    summary: input.summary,
    dealType: input.dealType,
    value: input.value,
    deadline: input.deadline,
    sourceUrl: input.sourceUrl,
    howToGet: input.howToGet,
    suitableFor: input.suitableFor,
    riskLevel: input.riskLevel,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  await writeJsonFile(manualDealsFile, [nextDeal, ...deals]);
  await appendOperationLog({
    actor,
    type: "manual_deal_create",
    status: "success",
    message: `手动录入 AI 优惠：${nextDeal.title}`,
    detail: `${nextDeal.provider} · ${nextDeal.dealType}`,
  });

  return nextDeal;
}

export async function createDealArticle(input: DealArticleInput, actor: string) {
  const articles = await getDealArticles();
  const title = inferDealArticleTitle(input.title, input.rawContent);
  const body = buildDealArticleBody(input.rawContent, title) || input.rawContent.trim();
  const summary = inferDealArticleSummary(input.summary, body);
  const sourcePlatform = input.sourceUrl
    ? detectDealArticleSourcePlatform(input.sourceUrl)
    : input.sourcePlatform;
  const slugBase = createDealArticleSlug(title);
  const takenSlugs = new Set(articles.map((article) => article.slug));
  let slug = slugBase;
  let suffix = 2;

  while (takenSlugs.has(slug)) {
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }

  const now = new Date().toISOString();
  const id = `deal-article-${randomUUID()}`;
  const coverImageUrl = await saveDealArticleCoverImage(input.coverImage, input.uploadedCoverImageUrl);
  const engagement = createInitialDealArticleEngagement(
    `${id}:${title}:${input.sourceUrl ?? ""}:${now}`,
  );
  const nextArticle: DealArticle = {
    id,
    slug,
    title,
    summary,
    body,
    rawContent: input.rawContent.trim(),
    coverImageUrl,
    viewCount: engagement.viewCount,
    likeCount: engagement.likeCount,
    sourcePlatform,
    sourceUrl: input.sourceUrl,
    status: input.status,
    tags: input.tags,
    publishedAt: now,
    updatedAt: now,
  };

  await writeJsonFile(dealArticlesFile, [nextArticle, ...articles]);
  await appendOperationLog({
    actor,
    type: "deal_article_publish",
    status: "success",
    message: `发布优惠文章：${nextArticle.title}`,
    detail: `${nextArticle.sourcePlatform} · ${nextArticle.status}`,
  });

  return nextArticle;
}

export async function updateDealArticle(id: string, input: DealArticleInput, actor: string) {
  const articles = await getDealArticles();
  const currentArticle = articles.find((article) => article.id === id);

  if (!currentArticle) {
    throw new Error("没有找到要编辑的文章。");
  }

  const title = inferDealArticleTitle(input.title, input.rawContent);
  const body = buildDealArticleBody(input.rawContent, title) || input.rawContent.trim();
  const summary = inferDealArticleSummary(input.summary, body);
  const sourcePlatform = input.sourceUrl
    ? detectDealArticleSourcePlatform(input.sourceUrl)
    : input.sourcePlatform;
  const nextSlugBase = createDealArticleSlug(title);
  const takenSlugs = new Set(
    articles.filter((article) => article.id !== id).map((article) => article.slug),
  );
  let slug = nextSlugBase;
  let suffix = 2;

  while (takenSlugs.has(slug)) {
    slug = `${nextSlugBase}-${suffix}`;
    suffix += 1;
  }

  const coverImageUrl = await resolveUpdatedDealArticleCoverImageUrl(
    currentArticle.coverImageUrl,
    input.coverImage,
    input.uploadedCoverImageUrl,
    input.resetCoverImage,
  );

  const nextArticle: DealArticle = {
    ...currentArticle,
    slug,
    title,
    summary,
    body,
    rawContent: input.rawContent.trim(),
    coverImageUrl,
    sourcePlatform,
    sourceUrl: input.sourceUrl,
    status: input.status,
    tags: input.tags,
    updatedAt: new Date().toISOString(),
  };

  await writeJsonFile(
    dealArticlesFile,
    articles.map((article) => (article.id === id ? nextArticle : article)),
  );
  await appendOperationLog({
    actor,
    type: "deal_article_update",
    status: "success",
    message: `更新优惠文章：${nextArticle.title}`,
    detail: `${nextArticle.sourcePlatform} · ${nextArticle.status}`,
  });

  return nextArticle;
}

export async function updateDealArticleEngagement(
  id: string,
  {
    viewIncrement = 0,
    likeIncrement = 0,
  }: {
    viewIncrement?: number;
    likeIncrement?: number;
  },
) {
  const articles = await getDealArticles();
  const currentArticle = articles.find((article) => article.id === id);

  if (!currentArticle) {
    throw new Error("没有找到要更新互动数据的文章。");
  }

  const nextArticle: DealArticle = {
    ...currentArticle,
    viewCount: Math.max(0, currentArticle.viewCount + Math.max(0, viewIncrement)),
    likeCount: Math.max(0, currentArticle.likeCount + Math.max(0, likeIncrement)),
    updatedAt: new Date().toISOString(),
  };

  await writeJsonFile(
    dealArticlesFile,
    articles.map((article) => (article.id === id ? nextArticle : article)),
  );

  return nextArticle;
}

export async function deleteDealArticle(id: string, actor: string) {
  const articles = await getDealArticles();
  const currentArticle = articles.find((article) => article.id === id);

  if (!currentArticle) {
    throw new Error("没有找到要删除的文章。");
  }

  await deleteUploadedDealArticleCoverIfNeeded(currentArticle.coverImageUrl);
  await writeJsonFile(
    dealArticlesFile,
    articles.filter((article) => article.id !== id),
  );
  await appendOperationLog({
    actor,
    type: "deal_article_delete",
    status: "success",
    message: `删除优惠文章：${currentArticle.title}`,
    detail: `${currentArticle.sourcePlatform} · ${currentArticle.status}`,
  });

  return currentArticle;
}

async function saveDealArticleCoverImage(file?: File, uploadedCoverImageUrl?: string) {
  if (uploadedCoverImageUrl) {
    return sanitizeUploadedDealArticleCoverUrl(uploadedCoverImageUrl);
  }

  if (!file || file.size === 0) {
    return defaultDealArticleCoverImageUrl;
  }

  const supportedTypes = new Map<string, string>([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
    ["image/avif", ".avif"],
    ["image/svg+xml", ".svg"],
  ]);

  const extension = supportedTypes.get(file.type);
  if (!extension) {
    throw new Error("封面图仅支持 JPG、PNG、WebP、AVIF 或 SVG。");
  }

  const maxFileSize = 6 * 1024 * 1024;
  if (file.size > maxFileSize) {
    throw new Error("封面图不能超过 6MB。");
  }

  await ensureUploadedDealArticleCoverDir();
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadedDealArticleCoverDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, bytes);
  return `/uploads/deal-articles/${fileName}`;
}

async function resolveUpdatedDealArticleCoverImageUrl(
  currentCoverImageUrl: string,
  file?: File,
  uploadedCoverImageUrl?: string,
  resetCoverImage?: boolean,
) {
  if (uploadedCoverImageUrl) {
    const nextCoverImageUrl = sanitizeUploadedDealArticleCoverUrl(uploadedCoverImageUrl);
    if (nextCoverImageUrl !== currentCoverImageUrl) {
      await deleteUploadedDealArticleCoverIfNeeded(currentCoverImageUrl);
    }
    return nextCoverImageUrl;
  }

  if (file && file.size > 0) {
    const nextCoverImageUrl = await saveDealArticleCoverImage(file);
    await deleteUploadedDealArticleCoverIfNeeded(currentCoverImageUrl);
    return nextCoverImageUrl;
  }

  if (resetCoverImage) {
    await deleteUploadedDealArticleCoverIfNeeded(currentCoverImageUrl);
    return defaultDealArticleCoverImageUrl;
  }

  return currentCoverImageUrl || defaultDealArticleCoverImageUrl;
}

function sanitizeUploadedDealArticleCoverUrl(url: string) {
  const normalized = url.trim();

  if (/^\/uploads\/deal-articles\/[A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/i.test(normalized)) {
    return normalized;
  }

  throw new Error("封面图地址无效，请重新上传。");
}

async function deleteUploadedDealArticleCoverIfNeeded(coverImageUrl?: string) {
  if (!coverImageUrl || !coverImageUrl.startsWith("/uploads/deal-articles/")) {
    return;
  }

  const relativePath = coverImageUrl.replace(/^\/+/, "");
  const filePath = path.join(publicDir, relativePath);

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function normalizeDealArticle(article: DealArticle): DealArticle {
  const seed = `${article.id}:${article.slug}:${article.title}:${article.sourceUrl ?? ""}`;
  const fallbackEngagement = createInitialDealArticleEngagement(seed);

  return {
    ...article,
    coverImageUrl: article.coverImageUrl || defaultDealArticleCoverImageUrl,
    viewCount: typeof article.viewCount === "number" ? article.viewCount : fallbackEngagement.viewCount,
    likeCount: typeof article.likeCount === "number" ? article.likeCount : fallbackEngagement.likeCount,
  };
}

function createInitialDealArticleEngagement(seed: string) {
  const hash = createHash("sha1").update(seed).digest();
  const likeCount = 18 + (hash[0] % 43);
  const ratio = 28 + (hash[1] % 5);
  const viewJitter = hash[2] % Math.max(12, likeCount);

  return {
    likeCount,
    viewCount: likeCount * ratio + viewJitter,
  };
}

export async function createMembershipRateReview(
  input: MembershipRateReviewInput,
  actor: string,
) {
  const reviews = await getMembershipRateReviews();
  const nextReview: MembershipRateReview = {
    id: `membership-review-${randomUUID()}`,
    reviewedAt: new Date().toISOString(),
    actor,
    ...input,
  };

  await writeJsonFile(membershipRateReviewsFile, [nextReview, ...reviews].slice(0, 500));
  await appendOperationLog({
    actor,
    type: "membership_rate_review_create",
    status: "success",
    message: `补录会员速率：${nextReview.vendorLabel} · ${nextReview.planName}`,
    detail: `${nextReview.priceSummary} · ${nextReview.captureMethod}`,
  });

  return nextReview;
}

export async function createSourceReview(input: SourceReviewInput, actor: string) {
  const reviews = await getSourceReviews();
  const nextReview: SourceReview = {
    id: `source-review-${randomUUID()}`,
    reviewedAt: new Date().toISOString(),
    actor,
    ...input,
  };

  await writeJsonFile(sourceReviewsFile, [nextReview, ...reviews].slice(0, 700));
  await appendOperationLog({
    actor,
    type: "source_review_create",
    status: "success",
    message: `处理复核源：${nextReview.vendor}`,
    detail: `${nextReview.reviewStatus} · ${nextReview.title}`,
  });

  return nextReview;
}
