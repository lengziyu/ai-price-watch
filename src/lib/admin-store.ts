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
import {
  getDealArticleAllSlugs,
  getDealArticleSlugForLocale,
} from "@/lib/deal-article-localization";
import { defaultLocale, isSupportedLocale, type SiteLocale } from "@/lib/i18n";
import { importArticleHtml, looksLikeXLongformHtml } from "@/lib/x-html-import";
import type { AIDeal, DealArticle } from "@/types";

const legacyAdminDataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "admin");
const defaultRuntimeAdminDataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), ".runtime", "admin-data");
const adminDataDir = resolveAdminDataDir();
const publicDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");
const uploadedDealArticleCoverDir = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "data",
  "uploads",
  "deal-articles",
);
const legacyPublicDealArticleCoverDir = path.join(publicDir, "uploads", "deal-articles");
const crawlDataFile = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "data",
  "crawl",
  "price-snapshot.json",
);
const manualDealsFile = path.join(adminDataDir, "manual-deals.json");
const dealArticlesFile = path.join(adminDataDir, "deal-articles.json");
const membershipRateReviewsFile = path.join(adminDataDir, "membership-rate-reviews.json");
const sourceReviewsFile = path.join(adminDataDir, "source-reviews.json");
const operationLogsFile = path.join(adminDataDir, "operation-logs.json");
const legacyManualDealsFile = path.join(legacyAdminDataDir, "manual-deals.json");
const legacyDealArticlesFile = path.join(legacyAdminDataDir, "deal-articles.json");
const legacyMembershipRateReviewsFile = path.join(
  legacyAdminDataDir,
  "membership-rate-reviews.json",
);
const legacySourceReviewsFile = path.join(legacyAdminDataDir, "source-reviews.json");
const legacyOperationLogsFile = path.join(legacyAdminDataDir, "operation-logs.json");
const jsonFileMutationQueues = new Map<string, Promise<void>>();

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
  titleEn?: string;
  summaryEn?: string;
  rawContentEn?: string;
  slugEn?: string;
  coverImage?: File;
  uploadedCoverImageUrl?: string;
  resetCoverImage?: boolean;
  difficulty: DealArticle["difficulty"];
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

async function normalizeDealArticleInput(
  input: DealArticleInput,
): Promise<DealArticleInput> {
  const rawContent = input.rawContent.trim();

  if (!rawContent || !looksLikeXLongformHtml(rawContent)) {
    return {
      ...input,
      rawContent,
      titleEn: input.titleEn?.trim(),
      summaryEn: input.summaryEn?.trim(),
      rawContentEn: input.rawContentEn?.trim(),
      slugEn: input.slugEn?.trim(),
    };
  }

  const imported = await importArticleHtml(rawContent);

  return {
    ...input,
    rawContent: imported.rawContent,
    title: input.title.trim() || imported.title,
    summary: input.summary.trim() || imported.summary,
    sourcePlatform: input.sourceUrl
      ? detectDealArticleSourcePlatform(input.sourceUrl)
      : imported.sourcePlatform,
    uploadedCoverImageUrl: input.uploadedCoverImageUrl || imported.suggestedCoverImageUrl,
    titleEn: input.titleEn?.trim(),
    summaryEn: input.summaryEn?.trim(),
    rawContentEn: input.rawContentEn?.trim(),
    slugEn: input.slugEn?.trim(),
  };
}

function resolveAdminDataDir() {
  const configuredDir = process.env.ADMIN_DATA_DIR?.trim();
  if (!configuredDir) {
    return defaultRuntimeAdminDataDir;
  }

  return path.isAbsolute(configuredDir)
    ? configuredDir
    : path.join(/*turbopackIgnore: true*/ process.cwd(), configuredDir);
}

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

async function tryLoadJsonWithAutoMigration<T>(
  filePath: string,
  legacyFilePath: string,
  fallback: T,
): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    if (filePath !== legacyFilePath) {
      try {
        const legacyContent = await readFile(legacyFilePath, "utf8");
        await ensureAdminDataDir();
        await writeFile(filePath, legacyContent, "utf8");
        return JSON.parse(legacyContent) as T;
      } catch (legacyError) {
        if ((legacyError as NodeJS.ErrnoException).code !== "ENOENT") {
          throw legacyError;
        }
      }
    }

    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureAdminDataDir();
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

// Serialize read-modify-write cycles per file so concurrent requests do not clobber each other.
async function withSerializedJsonMutation<T>(
  filePath: string,
  mutate: () => Promise<T>,
): Promise<T> {
  const previous = jsonFileMutationQueues.get(filePath) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const next = previous.catch(() => undefined).then(() => current);
  jsonFileMutationQueues.set(filePath, next);

  await previous.catch(() => undefined);

  try {
    return await mutate();
  } finally {
    release();
    if (jsonFileMutationQueues.get(filePath) === next) {
      jsonFileMutationQueues.delete(filePath);
    }
  }
}

async function mutateJsonFileWithResult<T, TResult>(
  filePath: string,
  legacyFilePath: string,
  fallback: T,
  mutate: (currentValue: T) => Promise<{ nextValue: T; result: TResult }> | { nextValue: T; result: TResult },
): Promise<TResult> {
  return withSerializedJsonMutation(filePath, async () => {
    const currentValue = await tryLoadJsonWithAutoMigration<T>(
      filePath,
      legacyFilePath,
      fallback,
    );
    const { nextValue, result } = await mutate(currentValue);
    await writeJsonFile(filePath, nextValue);
    return result;
  });
}

export async function getManualDeals() {
  const deals = await tryLoadJsonWithAutoMigration<AIDeal[]>(
    manualDealsFile,
    legacyManualDealsFile,
    [],
  );
  return deals.toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getDealArticles() {
  const articles = await tryLoadJsonWithAutoMigration<DealArticle[]>(
    dealArticlesFile,
    legacyDealArticlesFile,
    [],
  );
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

export async function getDealArticleBySlug(slug: string, locale: SiteLocale = defaultLocale) {
  const articles = await getDealArticles();
  return articles.find((article) => {
    const allSlugs = getDealArticleAllSlugs(article);
    if (allSlugs.includes(slug)) {
      return true;
    }

    return getDealArticleSlugForLocale(article, locale) === slug;
  });
}

export async function getDealArticleById(id: string) {
  const articles = await getDealArticles();
  return articles.find((article) => article.id === id);
}

export async function getMembershipRateReviews() {
  const reviews = await tryLoadJsonWithAutoMigration<MembershipRateReview[]>(
    membershipRateReviewsFile,
    legacyMembershipRateReviewsFile,
    [],
  );
  return reviews.toSorted((left, right) => right.reviewedAt.localeCompare(left.reviewedAt));
}

export async function getSourceReviews() {
  const reviews = await tryLoadJsonWithAutoMigration<SourceReview[]>(
    sourceReviewsFile,
    legacySourceReviewsFile,
    [],
  );
  return reviews.toSorted((left, right) => right.reviewedAt.localeCompare(left.reviewedAt));
}

export async function getOperationLogs() {
  const logs = await tryLoadJsonWithAutoMigration<AdminOperationLog[]>(
    operationLogsFile,
    legacyOperationLogsFile,
    [],
  );
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
): Promise<AdminOperationLog> {
  return mutateJsonFileWithResult(
    operationLogsFile,
    legacyOperationLogsFile,
    [],
    (logs: AdminOperationLog[]) => {
      const nextEntry: AdminOperationLog = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...input,
      };

      return {
        nextValue: [nextEntry, ...logs].slice(0, 300),
        result: nextEntry,
      };
    },
  );
}

export async function createManualDeal(input: ManualDealInput, actor: string): Promise<AIDeal> {
  const nextDeal = await mutateJsonFileWithResult(
    manualDealsFile,
    legacyManualDealsFile,
    [],
    (deals: AIDeal[]) => {
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

      return {
        nextValue: [nextDeal, ...deals],
        result: nextDeal,
      };
    },
  );

  await appendOperationLog({
    actor,
    type: "manual_deal_create",
    status: "success",
    message: `手动录入 AI 优惠：${nextDeal.title}`,
    detail: `${nextDeal.provider} · ${nextDeal.dealType}`,
  });

  return nextDeal;
}

export async function createDealArticle(
  input: DealArticleInput,
  actor: string,
): Promise<DealArticle> {
  const normalizedInput = await normalizeDealArticleInput(input);
  const title = inferDealArticleTitle(normalizedInput.title, normalizedInput.rawContent);
  const body = buildDealArticleBody(normalizedInput.rawContent, title) || normalizedInput.rawContent;
  const summary = inferDealArticleSummary(normalizedInput.summary, body);
  const rawContentEn = normalizedInput.rawContentEn?.trim() ?? "";
  const titleEn =
    normalizedInput.titleEn?.trim() || (rawContentEn ? inferDealArticleTitle("", rawContentEn) : "");
  const bodyEn = rawContentEn
    ? buildDealArticleBody(rawContentEn, titleEn) || rawContentEn
    : "";
  const summaryEn =
    normalizedInput.summaryEn?.trim() || (bodyEn ? inferDealArticleSummary("", bodyEn) : "");
  const sourcePlatform = normalizedInput.sourceUrl
    ? detectDealArticleSourcePlatform(normalizedInput.sourceUrl)
    : normalizedInput.sourcePlatform;
  const coverImageUrl = await saveDealArticleCoverImage(
    normalizedInput.coverImage,
    normalizedInput.uploadedCoverImageUrl,
  );
  const nextArticle = await mutateJsonFileWithResult(
    dealArticlesFile,
    legacyDealArticlesFile,
    [],
    (articles: DealArticle[]) => {
      const takenSlugs = new Set(
        articles.flatMap((article) => getDealArticleAllSlugs(article)),
      );
      const slug = buildUniqueSlug(createDealArticleSlug(title), takenSlugs);
      const requestedSlugEn = normalizeOptionalSlug(normalizedInput.slugEn);
      const generatedSlugEn = titleEn ? createDealArticleSlug(titleEn) : "";
      const candidateSlugEn = requestedSlugEn || generatedSlugEn;
      const slugEn = candidateSlugEn ? buildUniqueSlug(candidateSlugEn, takenSlugs) : "";

      const now = new Date().toISOString();
      const id = `deal-article-${randomUUID()}`;
      const engagement = createInitialDealArticleEngagement(
        `${id}:${title}:${normalizedInput.sourceUrl ?? ""}:${now}`,
      );

      const nextArticle: DealArticle = {
        id,
        slug,
        slugByLocale: {
          [defaultLocale]: slug,
          ...(slugEn ? { en: slugEn } : {}),
        },
        title,
        titleByLocale: {
          [defaultLocale]: title,
          ...(titleEn ? { en: titleEn } : {}),
        },
        summary,
        summaryByLocale: {
          [defaultLocale]: summary,
          ...(summaryEn ? { en: summaryEn } : {}),
        },
        body,
        bodyByLocale: {
          [defaultLocale]: body,
          ...(bodyEn ? { en: bodyEn } : {}),
        },
        rawContent: normalizedInput.rawContent,
        rawContentByLocale: {
          [defaultLocale]: normalizedInput.rawContent,
          ...(rawContentEn ? { en: rawContentEn } : {}),
        },
        coverImageUrl,
        viewCount: engagement.viewCount,
        likeCount: engagement.likeCount,
        difficulty: normalizedInput.difficulty,
        sourcePlatform,
        sourceUrl: normalizedInput.sourceUrl,
        status: normalizedInput.status,
        tags: normalizedInput.tags,
        publishedAt: now,
        updatedAt: now,
      };

      return {
        nextValue: [nextArticle, ...articles],
        result: nextArticle,
      };
    },
  );

  await appendOperationLog({
    actor,
    type: "deal_article_publish",
    status: "success",
    message: `发布优惠文章：${nextArticle.title}`,
    detail: `${nextArticle.sourcePlatform} · ${nextArticle.status}`,
  });

  return nextArticle;
}

export async function updateDealArticle(
  id: string,
  input: DealArticleInput,
  actor: string,
): Promise<DealArticle> {
  const normalizedInput = await normalizeDealArticleInput(input);
  const title = inferDealArticleTitle(normalizedInput.title, normalizedInput.rawContent);
  const body = buildDealArticleBody(normalizedInput.rawContent, title) || normalizedInput.rawContent;
  const summary = inferDealArticleSummary(normalizedInput.summary, body);
  const rawContentEn = normalizedInput.rawContentEn?.trim() ?? "";
  const titleEn =
    normalizedInput.titleEn?.trim() || (rawContentEn ? inferDealArticleTitle("", rawContentEn) : "");
  const bodyEn = rawContentEn
    ? buildDealArticleBody(rawContentEn, titleEn) || rawContentEn
    : "";
  const summaryEn =
    normalizedInput.summaryEn?.trim() || (bodyEn ? inferDealArticleSummary("", bodyEn) : "");
  const sourcePlatform = normalizedInput.sourceUrl
    ? detectDealArticleSourcePlatform(normalizedInput.sourceUrl)
    : normalizedInput.sourcePlatform;
  const nextArticle = await mutateJsonFileWithResult(
    dealArticlesFile,
    legacyDealArticlesFile,
    [],
    async (articles: DealArticle[]) => {
      const currentArticle = articles.find((article) => article.id === id);

      if (!currentArticle) {
        throw new Error("没有找到要编辑的文章。");
      }

      const nextSlugBase = createDealArticleSlug(title);
      const takenSlugs = new Set(
        articles
          .filter((article) => article.id !== id)
          .flatMap((article) => getDealArticleAllSlugs(article)),
      );
      const slug = buildUniqueSlug(nextSlugBase, takenSlugs);
      const requestedSlugEn = normalizeOptionalSlug(normalizedInput.slugEn);
      const existingSlugEn = currentArticle.slugByLocale?.en?.trim() ?? "";
      const generatedSlugEn = titleEn ? createDealArticleSlug(titleEn) : "";
      const candidateSlugEn = requestedSlugEn || generatedSlugEn || existingSlugEn;
      const slugEn = candidateSlugEn ? buildUniqueSlug(candidateSlugEn, takenSlugs) : "";

      const coverImageUrl = await resolveUpdatedDealArticleCoverImageUrl(
        currentArticle.coverImageUrl,
        normalizedInput.coverImage,
        normalizedInput.uploadedCoverImageUrl,
        normalizedInput.resetCoverImage,
      );

      const nextArticle: DealArticle = {
        ...currentArticle,
        slug,
        slugByLocale: {
          ...(currentArticle.slugByLocale ?? {}),
          [defaultLocale]: slug,
          ...(slugEn ? { en: slugEn } : {}),
        },
        title,
        titleByLocale: {
          ...(currentArticle.titleByLocale ?? {}),
          [defaultLocale]: title,
          ...(titleEn ? { en: titleEn } : {}),
        },
        summary,
        summaryByLocale: {
          ...(currentArticle.summaryByLocale ?? {}),
          [defaultLocale]: summary,
          ...(summaryEn ? { en: summaryEn } : {}),
        },
        body,
        bodyByLocale: {
          ...(currentArticle.bodyByLocale ?? {}),
          [defaultLocale]: body,
          ...(bodyEn ? { en: bodyEn } : {}),
        },
        rawContent: normalizedInput.rawContent,
        rawContentByLocale: {
          ...(currentArticle.rawContentByLocale ?? {}),
          [defaultLocale]: normalizedInput.rawContent,
          ...(rawContentEn ? { en: rawContentEn } : {}),
        },
        coverImageUrl,
        difficulty: normalizedInput.difficulty,
        sourcePlatform,
        sourceUrl: normalizedInput.sourceUrl,
        status: normalizedInput.status,
        tags: normalizedInput.tags,
        updatedAt: new Date().toISOString(),
      };

      return {
        nextValue: articles.map((article) => (article.id === id ? nextArticle : article)),
        result: nextArticle,
      };
    },
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
): Promise<DealArticle> {
  return mutateJsonFileWithResult(
    dealArticlesFile,
    legacyDealArticlesFile,
    [],
    (articles: DealArticle[]) => {
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

      return {
        nextValue: articles.map((article) => (article.id === id ? nextArticle : article)),
        result: nextArticle,
      };
    },
  );
}

export async function deleteDealArticle(id: string, actor: string): Promise<DealArticle> {
  const deletedArticle = await mutateJsonFileWithResult(
    dealArticlesFile,
    legacyDealArticlesFile,
    [],
    async (articles: DealArticle[]) => {
      const currentArticle = articles.find((article) => article.id === id);

      if (!currentArticle) {
        throw new Error("没有找到要删除的文章。");
      }

      await deleteUploadedDealArticleCoverIfNeeded(currentArticle.coverImageUrl);
      return {
        nextValue: articles.filter((article) => article.id !== id),
        result: currentArticle,
      };
    },
  );

  await appendOperationLog({
    actor,
    type: "deal_article_delete",
    status: "success",
    message: `删除优惠文章：${deletedArticle.title}`,
    detail: `${deletedArticle.sourcePlatform} · ${deletedArticle.status}`,
  });

  return deletedArticle;
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

  if (
    /^\/uploads\/deal-articles\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/i.test(normalized) ||
    /^\/uploads\/deal-article-body\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/i.test(normalized)
  ) {
    return normalized;
  }

  throw new Error("封面图地址无效，请重新上传。");
}

async function deleteUploadedDealArticleCoverIfNeeded(coverImageUrl?: string) {
  if (!coverImageUrl || !coverImageUrl.startsWith("/uploads/deal-articles/")) {
    return;
  }

  const fileName = coverImageUrl.replace(/^\/uploads\/deal-articles\//, "");
  if (!/^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|avif|svg)$/i.test(fileName)) {
    return;
  }

  await deleteFileIfExists(path.join(uploadedDealArticleCoverDir, fileName));
  await deleteFileIfExists(path.join(legacyPublicDealArticleCoverDir, fileName));
}

async function deleteFileIfExists(filePath: string) {
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function normalizeDealArticle(article: DealArticle): DealArticle {
  const normalizedSlugByLocale = normalizeLocalizedArticleText(
    article.slugByLocale,
    article.slug,
    true,
  );
  const normalizedTitleByLocale = normalizeLocalizedArticleText(
    article.titleByLocale,
    article.title,
  );
  const normalizedSummaryByLocale = normalizeLocalizedArticleText(
    article.summaryByLocale,
    article.summary,
  );
  const normalizedBodyByLocale = normalizeLocalizedArticleText(
    article.bodyByLocale,
    article.body,
  );
  const normalizedRawContentByLocale = normalizeLocalizedArticleText(
    article.rawContentByLocale,
    article.rawContent,
  );

  const seed = `${article.id}:${article.slug}:${article.title}:${article.sourceUrl ?? ""}`;
  const fallbackEngagement = createInitialDealArticleEngagement(seed);

  return {
    ...article,
    slug: normalizedSlugByLocale[defaultLocale] ?? article.slug,
    slugByLocale: normalizedSlugByLocale,
    title: normalizedTitleByLocale[defaultLocale] ?? article.title,
    titleByLocale: normalizedTitleByLocale,
    summary: normalizedSummaryByLocale[defaultLocale] ?? article.summary,
    summaryByLocale: normalizedSummaryByLocale,
    body: normalizedBodyByLocale[defaultLocale] ?? article.body,
    bodyByLocale: normalizedBodyByLocale,
    rawContent: normalizedRawContentByLocale[defaultLocale] ?? article.rawContent,
    rawContentByLocale: normalizedRawContentByLocale,
    coverImageUrl: article.coverImageUrl || defaultDealArticleCoverImageUrl,
    viewCount: typeof article.viewCount === "number" ? article.viewCount : fallbackEngagement.viewCount,
    likeCount: typeof article.likeCount === "number" ? article.likeCount : fallbackEngagement.likeCount,
    difficulty: article.difficulty || "medium",
  };
}

function normalizeLocalizedArticleText(
  localizedValue: Record<string, string> | undefined,
  fallbackValue: string | undefined,
  keepSlugShape = false,
) {
  const normalized: Partial<Record<SiteLocale, string>> = {};

  for (const [locale, value] of Object.entries(localizedValue ?? {})) {
    if (!isSupportedLocale(locale)) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    normalized[locale] = keepSlugShape ? trimmed.replace(/\s+/g, "-") : trimmed;
  }

  const fallback = fallbackValue?.trim();
  if (fallback && !normalized[defaultLocale]) {
    normalized[defaultLocale] = keepSlugShape ? fallback.replace(/\s+/g, "-") : fallback;
  }

  return normalized;
}

function buildUniqueSlug(baseSlug: string, takenSlugs: Set<string>) {
  const fallback = normalizeOptionalSlug(baseSlug) || "article";
  let slug = fallback;
  let suffix = 2;

  while (takenSlugs.has(slug)) {
    slug = `${fallback}-${suffix}`;
    suffix += 1;
  }

  takenSlugs.add(slug);
  return slug;
}

function normalizeOptionalSlug(value?: string) {
  if (!value) {
    return "";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized;
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
): Promise<MembershipRateReview> {
  const nextReview = await mutateJsonFileWithResult(
    membershipRateReviewsFile,
    legacyMembershipRateReviewsFile,
    [],
    (reviews: MembershipRateReview[]) => {
      const nextReview: MembershipRateReview = {
        id: `membership-review-${randomUUID()}`,
        reviewedAt: new Date().toISOString(),
        actor,
        ...input,
      };

      return {
        nextValue: [nextReview, ...reviews].slice(0, 500),
        result: nextReview,
      };
    },
  );

  await appendOperationLog({
    actor,
    type: "membership_rate_review_create",
    status: "success",
    message: `补录会员速率：${nextReview.vendorLabel} · ${nextReview.planName}`,
    detail: `${nextReview.priceSummary} · ${nextReview.captureMethod}`,
  });

  return nextReview;
}

export async function createSourceReview(
  input: SourceReviewInput,
  actor: string,
): Promise<SourceReview> {
  const nextReview = await mutateJsonFileWithResult(
    sourceReviewsFile,
    legacySourceReviewsFile,
    [],
    (reviews: SourceReview[]) => {
      const nextReview: SourceReview = {
        id: `source-review-${randomUUID()}`,
        reviewedAt: new Date().toISOString(),
        actor,
        ...input,
      };

      return {
        nextValue: [nextReview, ...reviews].slice(0, 700),
        result: nextReview,
      };
    },
  );

  await appendOperationLog({
    actor,
    type: "source_review_create",
    status: "success",
    message: `处理复核源：${nextReview.vendor}`,
    detail: `${nextReview.reviewStatus} · ${nextReview.title}`,
  });

  return nextReview;
}
