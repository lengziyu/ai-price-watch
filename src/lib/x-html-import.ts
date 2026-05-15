import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildDealArticleBody,
  detectDealArticleSourcePlatform,
  extractPlainTextFromHtml,
  inferDealArticleSummary,
  inferDealArticleTitle,
} from "@/lib/deal-articles";

const bodyImageUploadDir = path.join(process.cwd(), "data", "uploads", "deal-article-body");
const remoteImageHeaders = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
} as const;

type ImportedXHtmlResult = {
  sourcePlatform: ReturnType<typeof detectDealArticleSourcePlatform>;
  title: string;
  summary: string;
  rawContent: string;
  suggestedCoverImageUrl?: string;
  imageCount: number;
  skippedImageCount: number;
};

type ParsedTag = {
  name: string;
  kind?: "paragraph" | "list" | "list-item" | "strong" | "em" | "link";
};

export async function importXArticleHtml(rawHtml: string): Promise<ImportedXHtmlResult> {
  const normalizedHtml = normalizeInputHtml(rawHtml);

  if (!looksLikeXLongformHtml(normalizedHtml)) {
    throw new Error("没有识别到可导入的 X 长文 HTML，请确认复制的是文章详情区域的完整 HTML。");
  }

  const parsedHtml = parseXLongformHtml(normalizedHtml);
  if (!parsedHtml) {
    throw new Error("HTML 已读取到，但没有解析出正文内容，请检查复制内容是否完整。");
  }

  const localized = await localizeImportedImages(parsedHtml);
  const normalizedBody = buildDealArticleBody(localized.html) || localized.html.trim();
  const normalizedText = extractPlainTextFromHtml(normalizedBody);

  if (!normalizedText) {
    throw new Error("解析结果为空，请换一份更完整的 HTML 再试。");
  }

  return {
    sourcePlatform: "x",
    title: inferDealArticleTitle("", normalizedBody),
    summary: inferDealArticleSummary("", normalizedBody),
    rawContent: normalizedBody,
    suggestedCoverImageUrl: localized.firstImageUrl,
    imageCount: localized.imageCount,
    skippedImageCount: localized.skippedImageCount,
  };
}

function looksLikeXLongformHtml(html: string) {
  return (
    html.includes("longformRichTextComponent") ||
    html.includes("public-DraftEditor-content") ||
    html.includes("data-editor=")
  );
}

function normalizeInputHtml(html: string) {
  return html
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function parseXLongformHtml(html: string) {
  const tokens = html.match(/<\/?[^>]+>|[^<]+/g) ?? [];
  const blocks: string[] = [];
  const stack: ParsedTag[] = [];
  let currentParagraph: string | null = null;
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentListItem: string | null = null;

  const appendInline = (value: string) => {
    if (!value) {
      return;
    }

    if (currentListItem !== null) {
      currentListItem += value;
      return;
    }

    if (currentParagraph === null) {
      currentParagraph = "";
    }

    currentParagraph += value;
  };

  const appendText = (value: string) => {
    const normalized = normalizeTextToken(value);
    if (!normalized) {
      return;
    }

    appendInline(escapeHtml(normalized));
  };

  const flushParagraph = () => {
    if (currentParagraph === null) {
      return;
    }

    const normalized = normalizeInlineHtml(currentParagraph);
    if (normalized) {
      blocks.push(`<p>${normalized}</p>`);
    }

    currentParagraph = null;
  };

  const flushListItem = () => {
    if (currentListItem === null) {
      return;
    }

    const normalized = normalizeInlineHtml(currentListItem);
    if (normalized) {
      if (!currentList) {
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(normalized);
    }

    currentListItem = null;
  };

  const flushList = () => {
    if (!currentList) {
      return;
    }

    flushListItem();
    if (currentList.items.length > 0) {
      const items = currentList.items.map((item) => `<li>${item}</li>`).join("");
      blocks.push(`<${currentList.type}>${items}</${currentList.type}>`);
    }

    currentList = null;
  };

  for (const token of tokens) {
    if (!token.startsWith("<")) {
      appendText(token);
      continue;
    }

    const closeMatch = token.match(/^<\s*\/\s*([a-z0-9]+)[^>]*>$/i);
    if (closeMatch) {
      closeParsedTag(closeMatch[1].toLowerCase(), stack, appendInline, flushParagraph, flushListItem, flushList);
      continue;
    }

    const openMatch = token.match(/^<\s*([a-z0-9]+)([^>]*)>$/i);
    if (!openMatch) {
      continue;
    }

    const tagName = openMatch[1].toLowerCase();
    const attrs = openMatch[2] ?? "";
    const selfClosing = /\/\s*>$/.test(token);

    if (tagName === "img") {
      const src = normalizeImportedImageUrl(readHtmlAttribute(attrs, "src"));
      if (src) {
        const alt = escapeHtmlAttribute(readHtmlAttribute(attrs, "alt").trim().slice(0, 120));
        flushParagraph();
        flushListItem();
        const imageTag = `<img src="${escapeHtmlAttribute(src)}" alt="${alt}" loading="lazy">`;
        blocks.push(`<p>${imageTag}</p>`);
      }
      continue;
    }

    if (tagName === "br") {
      appendInline("<br>");
      continue;
    }

    if (tagName === "ul" || tagName === "ol") {
      flushParagraph();
      flushList();
      currentList = { type: tagName, items: [] };
      stack.push({ name: tagName, kind: "list" });
      continue;
    }

    if (tagName === "li") {
      flushParagraph();
      flushListItem();
      currentListItem = "";
      stack.push({ name: tagName, kind: "list-item" });
      continue;
    }

    const paragraphBlock = isXParagraphBlock(tagName, attrs);
    if (paragraphBlock) {
      flushParagraph();
      currentParagraph = "";
      stack.push({ name: tagName, kind: "paragraph" });
      continue;
    }

    if (tagName === "a") {
      const href = sanitizeImportedHref(readHtmlAttribute(attrs, "href"));
      if (href) {
        appendInline(`<a href="${escapeHtmlAttribute(href)}" target="_blank" rel="noopener noreferrer">`);
        stack.push({ name: tagName, kind: "link" });
      } else {
        stack.push({ name: tagName });
      }
      continue;
    }

    if (tagName === "strong" || tagName === "b" || isBoldSpan(tagName, attrs)) {
      appendInline("<strong>");
      stack.push({ name: tagName, kind: "strong" });
      continue;
    }

    if (tagName === "em" || tagName === "i") {
      appendInline("<em>");
      stack.push({ name: tagName, kind: "em" });
      continue;
    }

    if (!selfClosing) {
      stack.push({ name: tagName });
    }
  }

  while (stack.length > 0) {
    closeParsedTag("", stack, appendInline, flushParagraph, flushListItem, flushList);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n\n").trim();
}

function closeParsedTag(
  closingTagName: string,
  stack: ParsedTag[],
  appendInline: (value: string) => void,
  flushParagraph: () => void,
  flushListItem: () => void,
  flushList: () => void,
) {
  while (stack.length > 0) {
    const parsedTag = stack.pop();
    if (!parsedTag) {
      return;
    }

    if (parsedTag.kind === "link") {
      appendInline("</a>");
    }

    if (parsedTag.kind === "strong") {
      appendInline("</strong>");
    }

    if (parsedTag.kind === "em") {
      appendInline("</em>");
    }

    if (parsedTag.kind === "paragraph") {
      flushParagraph();
    }

    if (parsedTag.kind === "list-item") {
      flushListItem();
    }

    if (parsedTag.kind === "list") {
      flushList();
    }

    if (!closingTagName || parsedTag.name === closingTagName) {
      return;
    }
  }
}

function isXParagraphBlock(tagName: string, attrs: string) {
  if (tagName !== "div") {
    return false;
  }

  const className = readHtmlAttribute(attrs, "class");
  const dataBlock = readHtmlAttribute(attrs, "data-block");

  return dataBlock === "true" && /\blongform-unstyled\b/.test(className);
}

function isBoldSpan(tagName: string, attrs: string) {
  if (tagName !== "span") {
    return false;
  }

  const style = readHtmlAttribute(attrs, "style");
  return /font-weight\s*:\s*(?:bold|[6-9]00)/i.test(style);
}

function readHtmlAttribute(attrs: string, name: string) {
  const pattern = new RegExp(
    `\\b${escapeRegExp(name)}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = attrs.match(pattern);
  return decodeHtmlEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
}

function normalizeTextToken(value: string) {
  const normalized = decodeHtmlEntities(value)
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

function normalizeInlineHtml(value: string) {
  const normalized = value
    .replace(/(?:<br>\s*){2,}/g, "<br>")
    .replace(/^(?:<br>\s*)+|(?:\s*<br>)+$/g, "")
    .replace(/<strong>\s*<\/strong>/g, "")
    .replace(/<em>\s*<\/em>/g, "")
    .trim();

  return stripTags(normalized).trim() || /<img\b/i.test(normalized) ? normalized : "";
}

async function localizeImportedImages(html: string) {
  const imageMatches = [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)];
  if (imageMatches.length === 0) {
    return {
      html,
      firstImageUrl: undefined,
      imageCount: 0,
      skippedImageCount: 0,
    };
  }

  const localizedUrlByRemote = new Map<string, string>();
  let skippedImageCount = 0;

  await Promise.all(
    [...new Set(imageMatches.map((match) => match[1]).filter(Boolean))].map(async (remoteUrl) => {
      const localizedUrl = await downloadImportedImage(remoteUrl);
      if (localizedUrl) {
        localizedUrlByRemote.set(remoteUrl, localizedUrl);
        return;
      }

      skippedImageCount += 1;
    }),
  );

  const localizedHtml = html.replace(/<img\b([^>]*)src="([^"]+)"([^>]*)>/gi, (fullMatch, beforeSrc, remoteUrl, afterSrc) => {
    const localizedUrl = localizedUrlByRemote.get(remoteUrl);
    if (!localizedUrl) {
      return "";
    }

    return `<img${beforeSrc}src="${escapeHtmlAttribute(localizedUrl)}"${afterSrc}>`;
  });

  return {
    html: localizedHtml,
    firstImageUrl: localizedUrlByRemote.get(imageMatches[0]?.[1] ?? ""),
    imageCount: localizedUrlByRemote.size,
    skippedImageCount,
  };
}

async function downloadImportedImage(remoteUrl: string) {
  const normalizedUrl = normalizeImportedImageUrl(remoteUrl);
  if (!normalizedUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(normalizedUrl);
  } catch {
    return null;
  }

  if (!/^https?:$/i.test(url.protocol)) {
    return null;
  }

  const response = await fetchWithTimeout(url.toString(), {
    headers: remoteImageHeaders,
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  if (bytes.byteLength === 0 || bytes.byteLength > 8 * 1024 * 1024) {
    return null;
  }

  const extension = inferRemoteImageExtension(url, response.headers.get("content-type"));
  if (!extension) {
    return null;
  }

  await mkdir(bodyImageUploadDir, { recursive: true });
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  await writeFile(path.join(bodyImageUploadDir, fileName), bytes);

  return `/uploads/deal-article-body/${fileName}`;
}

function inferRemoteImageExtension(url: URL, contentType: string | null) {
  const normalizedContentType = String(contentType ?? "").split(";")[0].trim().toLowerCase();
  const extensionByContentType = new Map<string, string>([
    ["image/jpeg", ".jpg"],
    ["image/png", ".png"],
    ["image/webp", ".webp"],
    ["image/avif", ".avif"],
    ["image/svg+xml", ".svg"],
  ]);

  const byContentType = extensionByContentType.get(normalizedContentType);
  if (byContentType) {
    return byContentType;
  }

  const format = url.searchParams.get("format");
  if (format && /^(?:jpg|jpeg|png|webp|avif|svg)$/i.test(format)) {
    return `.${format.toLowerCase() === "jpeg" ? "jpg" : format.toLowerCase()}`;
  }

  const pathnameExtension = path.extname(url.pathname).toLowerCase();
  if (/^\.(?:jpg|jpeg|png|webp|avif|svg)$/.test(pathnameExtension)) {
    return pathnameExtension === ".jpeg" ? ".jpg" : pathnameExtension;
  }

  return null;
}

function sanitizeImportedHref(href: string) {
  const normalized = href.trim();
  if (!normalized) {
    return "";
  }

  if (/^(?:javascript|data|vbscript):/i.test(normalized)) {
    return "";
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(normalized)) {
    return normalized;
  }

  return "";
}

function normalizeImportedImageUrl(src: string) {
  const normalized = decodeHtmlEntities(src).trim();
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  return normalized;
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
    .replace(/&#(\d+);/g, (_match, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isNaN(parsed) ? "" : String.fromCharCode(parsed);
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isNaN(parsed) ? "" : String.fromCharCode(parsed);
    });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export type { ImportedXHtmlResult };
