import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { DealArticleEngagement } from "@/components/deals/deal-article-engagement";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultDealArticleCoverImageUrl,
  extractPlainTextFromHtml,
  formatDealArticleDifficulty,
  formatDealArticleStatus,
  isRichHtmlContent,
  parseDealArticleBlocks,
  sanitizeDealArticleHtml,
} from "@/lib/deal-articles";
import { formatDateTime } from "@/lib/format";
import { getDealArticleBySlug, getDealArticles } from "@/lib/admin-store";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const articles = await getDealArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getDealArticleBySlug(slug);

  if (!article) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function DealArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getDealArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const blocks = parseDealArticleBlocks(article.body);
  const usesDefaultCover = article.coverImageUrl === defaultDealArticleCoverImageUrl;
  const hasRichBody = isRichHtmlContent(article.body);
  const richBodyHtml = hasRichBody ? sanitizeDealArticleHtml(article.body) : "";

  return (
    <div className="pb-8 sm:pb-16">
      <section className="hero-stage hero-grid hero-aura -mt-[80px] w-full bg-background pt-[86px] sm:-mt-[104px] sm:pt-[116px]">
        <div className="app-shell py-2.5 sm:py-4 lg:py-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <Link
              href="/deals#deal-articles"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(240,253,248,0.92))] px-4 py-2 text-[14px] font-semibold text-foreground shadow-[0_10px_30px_rgba(16,24,40,0.06)] transition hover:border-primary/30 hover:bg-primary/6 hover:text-primary dark:bg-[linear-gradient(135deg,rgba(18,24,28,0.9),rgba(10,18,18,0.82))]"
            >
              <ArrowLeftIcon className="size-4" />
              返回文章列表
            </Link>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatDealArticleStatus(article.status)}</Badge>
              <Badge variant="outline">{formatDealArticleDifficulty(article.difficulty)}</Badge>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-[1.8rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[2.4rem]">
                {article.title}
              </h1>
              <p className="max-w-3xl text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
                {buildDetailSummary(article.summary)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="outline">
                    {tag}
                  </Badge>
                ))}
                <DealArticleEngagement
                  articleId={article.id}
                  initialViewCount={article.viewCount}
                  initialLikeCount={article.likeCount}
                />
                {article.sourceUrl ? (
                  <Link
                    href={article.sourceUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[12px] font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    查看原始来源
                    <ArrowUpRightIcon className="size-3.5" />
                  </Link>
                ) : null}
              </div>
              <Badge variant="outline" className="text-[12px] text-muted-foreground">
                发布于 {formatDateTime(article.publishedAt)}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="app-shell mt-4 sm:mt-8">
        <Card className="mx-auto max-w-4xl rounded-[16px] border-transparent bg-transparent shadow-none sm:border-border sm:bg-card/95">
          {!usesDefaultCover ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-t-[16px] border-b border-border/70">
              <Image
                src={article.coverImageUrl}
                alt={`${article.title} 封面图`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          ) : null}
          <CardContent className="px-0 py-5 sm:px-8 sm:py-8">
            {hasRichBody ? (
              <article className="deal-article-rich" dangerouslySetInnerHTML={{ __html: richBodyHtml }} />
            ) : (
              <article className="flex flex-col gap-5">
                {blocks.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h2 key={`${block.type}-${index}`} className="text-[1.08rem] font-semibold text-foreground sm:text-[1.16rem]">
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <ul key={`${block.type}-${index}`} className="grid gap-2 pl-5 text-[14px] leading-7 text-foreground sm:text-[15px]">
                        {block.items.map((item, itemIndex) => (
                          <li key={`${item}-${itemIndex}`} className="list-disc">
                            {renderRichText(item, `${index}-list-${itemIndex}`)}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={`${block.type}-${index}`} className="text-[14px] leading-8 text-foreground/92 sm:text-[15px]">
                      {renderRichText(block.text, `${index}-paragraph`)}
                    </p>
                  );
                })}
              </article>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function buildDetailSummary(summary: string) {
  const text = extractPlainTextFromHtml(summary).replace(/\s+/g, " ").trim();
  if (text.length <= 96) {
    return text;
  }

  return `${text.slice(0, 96).trim()}...`;
}

function renderRichText(text: string, keyPrefix: string): ReactNode[] {
  const lines = text.split("\n");

  return lines.flatMap((line, lineIndex) => {
    const lineParts = linkifyText(line, `${keyPrefix}-line-${lineIndex}`);
    if (lineIndex < lines.length - 1) {
      return [...lineParts, <br key={`${keyPrefix}-br-${lineIndex}`} />];
    }
    return lineParts;
  });
}

function linkifyText(text: string, keyPrefix: string): ReactNode[] {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const segments = text.split(urlPattern);

  return segments.map((segment, index) => {
    if (!segment) {
      return null;
    }

    const match = segment.match(/^(https?:\/\/[^\s]+)([),.，。！？；：]*)$/);
    if (match) {
      const [, url, tail] = match;
      return (
        <span key={`${keyPrefix}-url-${index}`}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-primary/55 underline-offset-4 transition hover:text-primary hover:decoration-primary"
          >
            {url}
          </a>
          {tail}
        </span>
      );
    }

    return <span key={`${keyPrefix}-text-${index}`}>{segment}</span>;
  });
}
