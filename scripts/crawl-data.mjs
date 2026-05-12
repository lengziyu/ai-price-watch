import { mkdir, writeFile } from "node:fs/promises";

const outputDir = new URL("../data/crawl/", import.meta.url);
const outputFile = new URL("./price-snapshot.json", outputDir);

const crawlTargets = [
  {
    id: "openai-chatgpt-pricing",
    vendor: "OpenAI",
    category: "subscription",
    url: "https://openai.com/chatgpt/pricing/",
  },
  {
    id: "openai-codex-pricing",
    vendor: "OpenAI",
    category: "membership-rate",
    url: "https://developers.openai.com/codex/pricing?codex-usage-limits=business&codex-pricing-plans=business-enterprise",
  },
  {
    id: "anthropic-pricing",
    vendor: "Anthropic",
    category: "subscription",
    url: "https://www.anthropic.com/pricing#subscriptions",
  },
  {
    id: "google-ai-plans",
    vendor: "Google",
    category: "subscription",
    url: "https://one.google.com/about/google-ai-plans/",
  },
  {
    id: "cursor-pricing",
    vendor: "Cursor",
    category: "subscription",
    url: "https://cursor.com/pricing",
  },
];

const pricePattern =
  /(?:[$€£¥]\s?\d+(?:,\d{3})*(?:\.\d{1,3})?|\d+(?:\.\d{1,3})?\s?(?:USD|EUR|GBP|CNY|credits?|requests?|messages?|tokens?|x usage))/gi;
const planPattern =
  /\b(?:plus|pro|team|business|enterprise|max|ultra|hobby|free|starter|student|education|codex|agent|fast requests?)\b/gi;

async function main() {
  const startedAt = new Date().toISOString();
  const results = await Promise.all(crawlTargets.map(crawlTarget));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    crawlPolicy:
      "Fetches public HTML only, preserves source URLs, and records extraction confidence for manual review before publishing.",
    targets: crawlTargets.length,
    results,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const succeeded = results.filter((item) => item.ok).length;
  console.log(
    `Crawled ${succeeded}/${results.length} sources in ${Math.round(
      (Date.now() - Date.parse(startedAt)) / 1000,
    )}s`,
  );
  console.log(`Snapshot: ${outputFile.pathname}`);
}

async function crawlTarget(target) {
  const fetchedAt = new Date().toISOString();

  try {
    const html = await fetchHtml(target.url);
    const text = normalizeText(html);
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const priceSignals = extractSignals(text, pricePattern, 28);
    const planSignals = extractSignals(text, planPattern, 18);

    return {
      ...target,
      ok: true,
      fetchedAt,
      title,
      description,
      status: 200,
      byteLength: html.length,
      extraction: {
        confidence: priceSignals.length > 0 || planSignals.length > 0 ? "review" : "low",
        priceSignals,
        planSignals,
      },
    };
  } catch (error) {
    return {
      ...target,
      ok: false,
      fetchedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (compatible; LeiJiaTongBot/0.1; +https://price.lengziyu.cn)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Unsupported content type: ${contentType || "unknown"}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]).trim() : "";
}

function extractMetaDescription(html) {
  const match =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);

  return match ? decodeHtml(match[1]).trim() : "";
}

function normalizeText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function extractSignals(text, pattern, limit) {
  const seen = new Set();
  const signals = [];

  for (const match of text.matchAll(pattern)) {
    const value = match[0].replace(/\s+/g, " ").trim();
    const key = value.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    signals.push({
      value,
      context: extractContext(text, match.index ?? 0, value.length),
    });

    if (signals.length >= limit) {
      break;
    }
  }

  return signals;
}

function extractContext(text, index, length) {
  const start = Math.max(0, index - 64);
  const end = Math.min(text.length, index + length + 64);

  return text.slice(start, end).trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
