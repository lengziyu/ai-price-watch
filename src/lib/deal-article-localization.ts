import { defaultLocale, type SiteLocale } from "@/lib/i18n";
import type { DealArticle } from "@/types";

type LocalizedRecord = Partial<Record<SiteLocale, string>>;

function normalizeLocalizedValue(value?: string | null) {
  return value?.trim() || "";
}

function resolveLocalizedText(
  fallbackValue: string,
  localizedRecord: LocalizedRecord | undefined,
  locale: SiteLocale,
) {
  const direct = normalizeLocalizedValue(localizedRecord?.[locale]);
  if (direct) {
    return direct;
  }

  const fallbackLocaleValue = normalizeLocalizedValue(localizedRecord?.[defaultLocale]);
  if (fallbackLocaleValue) {
    return fallbackLocaleValue;
  }

  return fallbackValue;
}

export function getDealArticleSlugForLocale(article: DealArticle, locale: SiteLocale) {
  return resolveLocalizedText(article.slug, article.slugByLocale, locale);
}

export function getDealArticleAllSlugs(article: DealArticle) {
  const values = new Set<string>();

  const baseSlug = normalizeLocalizedValue(article.slug);
  if (baseSlug) {
    values.add(baseSlug);
  }

  for (const value of Object.values(article.slugByLocale ?? {})) {
    const normalized = normalizeLocalizedValue(value);
    if (normalized) {
      values.add(normalized);
    }
  }

  return [...values];
}

export function localizeDealArticle(article: DealArticle, locale: SiteLocale): DealArticle {
  return {
    ...article,
    slug: getDealArticleSlugForLocale(article, locale),
    title: resolveLocalizedText(article.title, article.titleByLocale, locale),
    summary: resolveLocalizedText(article.summary, article.summaryByLocale, locale),
    body: resolveLocalizedText(article.body, article.bodyByLocale, locale),
    rawContent: resolveLocalizedText(article.rawContent, article.rawContentByLocale, locale),
  };
}

export function localizeDealArticles(articles: DealArticle[], locale: SiteLocale) {
  return articles.map((article) => localizeDealArticle(article, locale));
}

