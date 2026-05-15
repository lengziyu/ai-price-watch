import { buildDealArticleBody, detectDealArticleSourcePlatform } from "@/lib/deal-articles";

export type ExtractedArticleSource = {
  sourceUrl: string;
  sourcePlatform: ReturnType<typeof detectDealArticleSourcePlatform>;
  title?: string;
  summary?: string;
  rawContent: string;
};

export async function extractArticleSourceFromUrl(sourceUrl: string): Promise<ExtractedArticleSource> {
  const url = new URL(sourceUrl);
  const sourcePlatform = detectDealArticleSourcePlatform(sourceUrl);

  if (sourcePlatform === "x") {
    return extractXSourceFromUrl(sourceUrl, url);
  }

  const response = await fetchWithTimeout(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`抓取失败，返回 ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const title =
    readMetaContent(html, "property", "og:title") ||
    readMetaContent(html, "name", "twitter:title") ||
    readTagText(html, "title");
  const summary =
    readMetaContent(html, "property", "og:description") ||
    readMetaContent(html, "name", "twitter:description") ||
    readMetaContent(html, "name", "description");

  const rawContent =
    extractByPlatform(sourcePlatform, html) ||
    extractStructuredArticleBody(html) ||
    extractGenericArticleText(html) ||
    summary ||
    "";

  const normalizedRawContent = buildDealArticleBody(rawContent, title) || rawContent.trim();

  if (!normalizedRawContent) {
    throw new Error("当前链接没有提取到可用正文，可能需要手动复制粘贴。");
  }

  return {
    sourceUrl,
    sourcePlatform,
    title: normalizeText(title),
    summary: buildSourceSummary(summary || rawContent, title),
    rawContent: normalizedRawContent,
  };
}

async function extractXSourceFromUrl(sourceUrl: string, url: URL): Promise<ExtractedArticleSource> {
  const tweetId = extractTweetId(url);

  if (!tweetId) {
    throw new Error("当前 X 链接没有识别到动态 ID，请检查链接格式。");
  }

  const response = await fetchWithTimeout(
    `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=a`,
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        accept: "application/json,text/plain,*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    },
    8000,
  );

  if (!response.ok) {
    throw new Error(`抓取 X 内容失败，返回 ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as XTweetPayload;
  const rawContent = buildXRawContent(payload);
  const title = normalizeText(payload.text.split("\n").find(Boolean) ?? "");
  const summary = normalizeText(payload.text);
  const normalizedRawContent = buildDealArticleBody(rawContent, title) || rawContent.trim();

  if (!normalizedRawContent) {
    throw new Error("当前 X 链接没有提取到可用正文，可能需要手动复制粘贴。");
  }

  return {
    sourceUrl,
    sourcePlatform: "x",
    title,
    summary: buildSourceSummary(summary, title),
    rawContent: normalizedRawContent,
  };
}

function extractByPlatform(
  sourcePlatform: ReturnType<typeof detectDealArticleSourcePlatform>,
  html: string,
) {
  if (sourcePlatform === "linux_do") {
    return extractLinuxDoContent(html);
  }

  if (sourcePlatform === "x") {
    return extractXContent(html);
  }

  return "";
}

function extractLinuxDoContent(html: string) {
  const cookedMatches = [...html.matchAll(/<div[^>]*class=["'][^"']*cooked[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)];
  const chunks = cookedMatches
    .map((match) => htmlToReadableText(match[1]))
    .map((item) => item.trim())
    .filter((item) => item.length > 30);

  return chunks.join("\n\n").trim();
}

function extractXContent(html: string) {
  return (
    readMetaContent(html, "property", "og:description") ||
    readMetaContent(html, "name", "twitter:description") ||
    ""
  );
}

function extractStructuredArticleBody(html: string) {
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  for (const match of jsonLdMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of candidates) {
        const articleBody = readJsonLdBody(item);
        if (articleBody) {
          return articleBody;
        }
      }
    } catch {}
  }

  return "";
}

function readJsonLdBody(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = readJsonLdBody(item);
      if (result) {
        return result;
      }
    }

    return "";
  }

  const record = value as Record<string, unknown>;
  const directBody = normalizeText(String(record.articleBody ?? ""));
  if (directBody.length > 20) {
    return directBody;
  }

  if (record["@graph"]) {
    return readJsonLdBody(record["@graph"]);
  }

  if (record.mainEntity) {
    return readJsonLdBody(record.mainEntity);
  }

  return "";
}

function extractGenericArticleText(html: string) {
  const articleMatch = html.match(/<(article|main)[^>]*>([\s\S]*?)<\/\1>/i);
  if (articleMatch) {
    const text = htmlToReadableText(articleMatch[2]);
    if (text.length > 60) {
      return text;
    }
  }

  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => htmlToReadableText(match[1]))
    .map((item) => item.trim())
    .filter((item) => item.length > 30);

  if (paragraphs.length > 0) {
    return paragraphs.slice(0, 18).join("\n\n");
  }

  return "";
}

function readMetaContent(html: string, attribute: "name" | "property", key: string) {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*content=["']([\\s\\S]*?)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta[^>]*content=["']([\\s\\S]*?)["'][^>]*${attribute}=["']${escapeRegExp(key)}["'][^>]*>`,
    "i",
  );

  return decodeHtmlEntities(pattern.exec(html)?.[1] || reversePattern.exec(html)?.[1] || "").trim();
}

function readTagText(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, "i"));
  return normalizeText(match?.[1] ?? "");
}

function htmlToReadableText(fragment: string) {
  return normalizeText(
    decodeHtmlEntities(
      fragment
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<li\b[^>]*>/gi, "- ")
        .replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function normalizeText(value?: string) {
  return (value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSourceSummary(summary: string, title?: string) {
  const normalized = normalizeText(summary);
  if (!normalized) {
    return "";
  }

  const comparableTitle = normalizeComparableText(title ?? "");
  const flattened = normalized
    .split("\n")
    .filter((line) => normalizeComparableText(line) !== comparableTitle)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!flattened) {
    return "";
  }

  const sentence = flattened
    .replace(/作者：.+$/u, "")
    .replace(/发布时间：.+$/u, "")
    .replace(/点赞：.+$/u, "")
    .trim();

  if (sentence.length <= 72) {
    return sentence;
  }

  return `${sentence.slice(0, 72).trim()}...`;
}

async function fetchWithTimeout(
  input: string | URL,
  init?: RequestInit,
  timeoutMs = 10000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("抓取超时，请稍后重试或手动粘贴正文。");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractTweetId(url: URL) {
  const match = url.pathname.match(/\/status\/(\d+)/i);
  return match?.[1] ?? "";
}

function buildXRawContent(payload: XTweetPayload) {
  const urlMap = new Map<string, string>();

  for (const item of payload.entities?.urls ?? []) {
    if (item.url && item.expanded_url) {
      urlMap.set(item.url, item.expanded_url);
    }
  }

  let text = payload.text ?? "";

  for (const [shortUrl, expandedUrl] of urlMap) {
    text = text.replaceAll(shortUrl, expandedUrl);
  }

  text = text.replace(/https:\/\/t\.co\/[A-Za-z0-9]+/g, "").trim();

  const lines = [text];
  const author = normalizeText(payload.user?.name ?? "");
  const screenName = normalizeText(payload.user?.screen_name ?? "");

  if (author || screenName) {
    lines.push(`作者：${author}${screenName ? ` (@${screenName})` : ""}`);
  }

  if (typeof payload.favorite_count === "number") {
    lines.push(`点赞：${payload.favorite_count}`);
  }

  if (payload.created_at) {
    lines.push(`发布时间：${payload.created_at}`);
  }

  return lines.filter(Boolean).join("\n\n");
}

type XTweetPayload = {
  text: string;
  created_at?: string;
  favorite_count?: number;
  entities?: {
    urls?: Array<{
      url?: string;
      expanded_url?: string;
    }>;
  };
  user?: {
    name?: string;
    screen_name?: string;
  };
};

function normalizeComparableText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
