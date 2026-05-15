import type { DealArticle, DealArticleSourcePlatform, DealArticleStatus } from "@/types";

export const defaultDealArticleCoverImageUrl = "/default-deal-article-cover.svg";

const cjkPattern = /[\u3400-\u9fff]/;
const latinOrDigitPattern = /[A-Za-z0-9]/;
const listLinePattern = /^(?:[-*•]|\d+[.)]|[一二三四五六七八九十]+[、.])/;
const headingLinePattern = /^(?:#{1,3}\s+|【.+】$|\[.+\]$|.+：$|[一二三四五六七八九十]+[、.])/;
const htmlTagPattern = /<\/?[a-z][^>]*>/i;
const blockedTagPattern = /<(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi;
const blockedSelfClosingTagPattern = /<(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|svg|math)\b[^>]*\/?>/gi;
const allowedHtmlTags = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "pre",
  "code",
  "a",
]);

export type DealArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function formatDealArticleStatus(value: DealArticleStatus) {
  return {
    not_started: "未开始",
    in_progress: "进行中",
    ended: "已结束",
  }[value];
}

export function formatDealArticleSourcePlatform(value: DealArticleSourcePlatform) {
  return {
    x: "X",
    linux_do: "Linux.do",
    other: "其他来源",
  }[value];
}

export function detectDealArticleSourcePlatform(sourceUrl?: string) {
  if (!sourceUrl) {
    return "other" satisfies DealArticleSourcePlatform;
  }

  try {
    const { hostname } = new URL(sourceUrl);
    const normalizedHostname = hostname.toLowerCase();

    if (
      normalizedHostname === "x.com" ||
      normalizedHostname.endsWith(".x.com") ||
      normalizedHostname === "twitter.com" ||
      normalizedHostname.endsWith(".twitter.com")
    ) {
      return "x" satisfies DealArticleSourcePlatform;
    }

    if (
      normalizedHostname === "linux.do" ||
      normalizedHostname.endsWith(".linux.do")
    ) {
      return "linux_do" satisfies DealArticleSourcePlatform;
    }
  } catch {}

  return "other" satisfies DealArticleSourcePlatform;
}

export function isRichHtmlContent(value: string) {
  const normalized = value.trim();
  return normalized.includes("<") && htmlTagPattern.test(normalized);
}

export function sanitizeDealArticleHtml(html: string) {
  let safeHtml = html
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(blockedTagPattern, "")
    .replace(blockedSelfClosingTagPattern, "");

  safeHtml = safeHtml.replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (_fullTag, slash, rawTagName, rawAttrs) => {
    const tagName = String(rawTagName ?? "").toLowerCase();
    if (!allowedHtmlTags.has(tagName)) {
      return "";
    }

    if (slash) {
      return `</${tagName}>`;
    }

    if (tagName === "a") {
      const hrefMatch = String(rawAttrs ?? "").match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/i);
      const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
      const safeHref = sanitizeHref(href);

      if (!safeHref) {
        return "<a>";
      }

      return `<a href="${escapeHtmlAttribute(safeHref)}" target="_blank" rel="noopener noreferrer">`;
    }

    if (tagName === "br") {
      return "<br>";
    }

    return `<${tagName}>`;
  });

  return safeHtml.trim();
}

export function extractPlainTextFromHtml(html: string) {
  if (!isRichHtmlContent(html)) {
    return html.replace(/\r\n?/g, "\n").trim();
  }

  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|blockquote|pre|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(text)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function inferDealArticleTitle(title: string, rawContent: string) {
  if (title.trim()) {
    return title.trim();
  }

  const sourceText = isRichHtmlContent(rawContent)
    ? extractPlainTextFromHtml(rawContent)
    : rawContent;

  const firstMeaningfulLine = sourceText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("http"));

  if (!firstMeaningfulLine) {
    return "未命名优惠文章";
  }

  return firstMeaningfulLine.replace(/^[-*•]\s*/, "").slice(0, 48);
}

export function buildDealArticleBody(rawContent: string, title?: string) {
  if (isRichHtmlContent(rawContent)) {
    return sanitizeDealArticleHtml(rawContent);
  }

  const lines = rawContent
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .split("\n")
    .map((line) => normalizeArticleLine(line));

  const comparableTitle = normalizeComparableText(title ?? "");
  const trimmedLines = [...lines];
  const firstMeaningfulIndex = trimmedLines.findIndex(Boolean);

  if (
    comparableTitle &&
    firstMeaningfulIndex >= 0 &&
    normalizeComparableText(trimmedLines[firstMeaningfulIndex]) === comparableTitle
  ) {
    trimmedLines.splice(firstMeaningfulIndex, 1);
  }

  const blocks: string[] = [];
  let currentBlock: string[] = [];

  const flushBlock = () => {
    if (currentBlock.length === 0) {
      return;
    }

    const built = buildBlock(currentBlock);
    if (built) {
      blocks.push(built);
    }
    currentBlock = [];
  };

  for (const line of trimmedLines) {
    if (!line) {
      flushBlock();
      continue;
    }

    currentBlock.push(line);
  }

  flushBlock();

  return blocks.join("\n\n").trim();
}

export function inferDealArticleSummary(summary: string, body: string) {
  if (summary.trim()) {
    return summary.trim();
  }

  if (isRichHtmlContent(body)) {
    const firstLine = extractPlainTextFromHtml(body)
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";

    if (firstLine.length <= 88) {
      return firstLine;
    }

    return `${firstLine.slice(0, 88).trim()}...`;
  }

  const firstParagraph = parseDealArticleBlocks(body).find((block) => block.type === "paragraph");
  const text = firstParagraph?.type === "paragraph" ? firstParagraph.text : body.split("\n")[0] ?? "";

  if (text.length <= 88) {
    return text;
  }

  return `${text.slice(0, 88).trim()}...`;
}

export function parseDealArticleBlocks(body: string): DealArticleBlock[] {
  return body
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);

      if (lines.length > 0 && lines.every(isListLikeLine)) {
        return {
          type: "list" as const,
          items: lines.map((line) => line.replace(listLinePattern, "").trim()),
        };
      }

      if (lines.length === 1 && isHeadingLine(lines[0])) {
        return {
          type: "heading" as const,
          text: lines[0].replace(/^#{1,3}\s*/, "").replace(/[：:]$/, "").trim(),
        };
      }

      return {
        type: "paragraph" as const,
        text: lines.join("\n"),
      };
    });
}

export function createDealArticleSlug(title: string) {
  const normalized = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "article";
}

export function getDealArticleStatusCounts(articles: DealArticle[]) {
  return {
    total: articles.length,
    notStarted: articles.filter((article) => article.status === "not_started").length,
    inProgress: articles.filter((article) => article.status === "in_progress").length,
    ended: articles.filter((article) => article.status === "ended").length,
  };
}

function buildBlock(lines: string[]) {
  const cleanedLines = lines.map((line) => line.trim()).filter(Boolean);

  if (cleanedLines.length === 0) {
    return "";
  }

  if (cleanedLines.every(isListLikeLine)) {
    return cleanedLines.map((line) => `- ${line.replace(listLinePattern, "").trim()}`).join("\n");
  }

  if (cleanedLines.length === 1 && isHeadingLine(cleanedLines[0])) {
    return cleanedLines[0];
  }

  return joinSoftLines(cleanedLines);
}

function joinSoftLines(lines: string[]) {
  return lines.reduce((result, line, index) => {
    if (index === 0) {
      return line;
    }

    return `${result}${pickLineJoiner(result, line)}${line}`;
  }, "");
}

function pickLineJoiner(left: string, right: string) {
  const previousChar = left.trimEnd().slice(-1);
  const nextChar = right.trimStart().charAt(0);

  if (!previousChar || !nextChar) {
    return "";
  }

  if (/[（《“‘【(\[]/.test(previousChar)) {
    return "";
  }

  if (/[，。！？；：、,.!?;:]/.test(previousChar)) {
    return "";
  }

  if (cjkPattern.test(previousChar) && cjkPattern.test(nextChar)) {
    return "";
  }

  if (
    (cjkPattern.test(previousChar) && latinOrDigitPattern.test(nextChar)) ||
    (latinOrDigitPattern.test(previousChar) && cjkPattern.test(nextChar))
  ) {
    return " ";
  }

  return " ";
}

function normalizeArticleLine(line: string) {
  return line
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-*•]\s*/, "- ")
    .trim();
}

function normalizeComparableText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isListLikeLine(line: string) {
  return listLinePattern.test(line);
}

function isHeadingLine(line: string) {
  const normalized = line.trim();
  return headingLinePattern.test(normalized) && normalized.length <= 40;
}

function sanitizeHref(rawHref: string) {
  const normalized = rawHref.trim();
  if (!normalized) {
    return null;
  }

  if (/^(?:javascript|data|vbscript):/i.test(normalized)) {
    return null;
  }

  if (/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(normalized)) {
    return normalized;
  }

  return null;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeHtmlEntities(value: string) {
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
  };

  return value
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => entityMap[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => {
      const parsed = Number.parseInt(code, 10);
      if (Number.isNaN(parsed)) {
        return "";
      }
      return String.fromCharCode(parsed);
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const parsed = Number.parseInt(hex, 16);
      if (Number.isNaN(parsed)) {
        return "";
      }
      return String.fromCharCode(parsed);
    });
}
