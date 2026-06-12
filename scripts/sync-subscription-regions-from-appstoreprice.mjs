#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const LOCAL_FILE = "src/data/subscription-regions.ts";
const REVIEWED_AT = new Date().toISOString().slice(0, 10);

const COUNTRY_NAME_OVERRIDES = {
  TW: "台湾（中国）",
  HK: "中国香港",
};

const PLAN_RULES = [
  {
    key: "chatgpt-plus",
    match: (p) => p.nameLower.includes("chatgpt plus") && p.duration === "monthly",
    mapping: { provider: "OpenAI", productName: "ChatGPT", planName: "Plus", billingCycle: "monthly" },
  },
  {
    key: "chatgpt-go",
    match: (p) => p.nameLower.includes("chatgpt go") && p.duration === "monthly",
    mapping: { provider: "OpenAI", productName: "ChatGPT", planName: "Go", billingCycle: "monthly" },
  },
  {
    key: "chatgpt-pro-5x",
    match: (p) => p.nameLower.includes("chatgpt pro 5x") && p.duration === "monthly",
    mapping: { provider: "OpenAI", productName: "ChatGPT", planName: "Pro 5x", billingCycle: "monthly" },
  },
  {
    key: "chatgpt-pro-20x",
    match: (p) => p.nameLower.includes("chatgpt pro 20x") && p.duration === "monthly",
    mapping: { provider: "OpenAI", productName: "ChatGPT", planName: "Pro 20x", billingCycle: "monthly" },
  },
  {
    key: "chatgpt-plus-yearly",
    match: (p) => p.nameLower.includes("chatgpt plus") && p.duration === "yearly",
    mapping: { provider: "OpenAI", productName: "ChatGPT", planName: "Plus", billingCycle: "yearly" },
  },
  {
    key: "claude-pro",
    match: (p) => p.nameLower.includes("claude pro") && p.duration === "monthly",
    mapping: { provider: "Anthropic", productName: "Claude", planName: "Pro", billingCycle: "monthly" },
  },
  {
    key: "claude-max-5x",
    match: (p) => p.nameLower.includes("claude max 5x") && p.duration === "monthly",
    mapping: { provider: "Anthropic", productName: "Claude", planName: "Max 5x", billingCycle: "monthly" },
  },
  {
    key: "claude-max-20x",
    match: (p) => p.nameLower.includes("claude max 20x") && p.duration === "monthly",
    mapping: { provider: "Anthropic", productName: "Claude", planName: "Max 20x", billingCycle: "monthly" },
  },
  {
    key: "claude-pro-yearly",
    match: (p) => p.nameLower.includes("claude pro") && p.duration === "yearly",
    mapping: { provider: "Anthropic", productName: "Claude", planName: "Pro", billingCycle: "yearly" },
  },
  {
    key: "gemini-ai-pro-monthly",
    match: (p) =>
      p.subscriptionId === "com.google.gemini.2tb.ai.m" &&
      p.nameLower.includes("google ai pro") &&
      p.duration === "monthly",
    mapping: {
      provider: "Google",
      productName: "Gemini",
      planName: "Google AI Pro (5 TB)",
      billingCycle: "monthly",
    },
  },
  {
    key: "gemini-ai-pro-yearly",
    match: (p) =>
      p.subscriptionId === "com.google.gemini.2tb.ai.a" &&
      p.nameLower.includes("google ai pro") &&
      p.duration === "yearly",
    mapping: {
      provider: "Google",
      productName: "Gemini",
      planName: "Google AI Pro (5 TB)",
      billingCycle: "yearly",
    },
  },
  {
    key: "gemini-ai-plus-monthly",
    match: (p) =>
      p.subscriptionId === "com.google.gemini.helium.m" &&
      p.nameLower.includes("google ai plus") &&
      p.duration === "monthly",
    mapping: {
      provider: "Google",
      productName: "Gemini",
      planName: "Google AI Plus (200GB)",
      billingCycle: "monthly",
    },
  },
  {
    key: "gemini-ai-plus-yearly",
    match: (p) =>
      p.subscriptionId === "com.google.gemini.helium.a" &&
      p.nameLower.includes("google ai plus") &&
      p.duration === "yearly",
    mapping: {
      provider: "Google",
      productName: "Gemini",
      planName: "Google AI Plus (200GB)",
      billingCycle: "yearly",
    },
  },
  {
    key: "github-pro-monthly",
    match: (p) => p.nameLower === "github pro" && p.duration === "monthly",
    mapping: {
      provider: "GitHub",
      productName: "GitHub",
      planName: "GitHub Pro",
      billingCycle: "monthly",
    },
  },
  {
    key: "github-copilot-pro-monthly",
    match: (p) => p.nameLower === "copilot pro" && p.duration === "monthly",
    mapping: {
      provider: "GitHub",
      productName: "GitHub",
      planName: "Copilot Pro",
      billingCycle: "monthly",
    },
  },
  {
    key: "github-copilot-pro-plus-monthly",
    match: (p) => p.nameLower === "copilot pro+" && p.duration === "monthly",
    mapping: {
      provider: "GitHub",
      productName: "GitHub",
      planName: "Copilot Pro+",
      billingCycle: "monthly",
    },
  },
  {
    key: "github-copilot-max-monthly",
    match: (p) => p.nameLower === "copilot max" && p.duration === "monthly",
    mapping: {
      provider: "GitHub",
      productName: "GitHub",
      planName: "Copilot Max",
      billingCycle: "monthly",
    },
  },
];

const DEFAULT_SOURCES = [
  "https://appstoreprice.org/zh/apps/6448311069",
  "https://appstoreprice.org/zh/apps/6473753684",
  "https://appstoreprice.org/zh/apps/6477489729",
  "https://appstoreprice.org/zh/apps/1477376905",
];

function parseArgs(argv) {
  const urls = [];
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (item.startsWith("--url=")) {
      urls.push(item.slice("--url=".length));
    }
  }
  return { urls: urls.length ? urls : DEFAULT_SOURCES };
}

function parsePlansFromHtml(html) {
  const planRegex = /\{\\"id\\":\d+,\\"subscriptionId\\":\\"([^\\"]+)\\",\\"name\\":\\"([^\\"]+)\\",\\"nameZh\\":\\"([^\\"]+)\\".*?\\"type\\":\\"subscription\\",\\"duration\\":\\"([^\\"]+)\\",\\"source\\":\\"([^\\"]+)\\",\\"prices\\":\[(.*?)\]\}/gs;
  const priceRegex = /\{\\"region\\":\\"([^\\"]+)\\",\\"regionName\\":\\"([^\\"]+)\\",\\"currency\\":\\"([^\\"]+)\\",\\"price\\":([0-9.]+),\\"priceUsd\\":([0-9.]+),\\"priceCny\\":([0-9.]+)\}/g;

  const plans = [];
  let m;
  while ((m = planRegex.exec(html)) !== null) {
    const [, subscriptionId, name, nameZh, duration, source, chunk] = m;
    const prices = [];

    let pm;
    while ((pm = priceRegex.exec(chunk)) !== null) {
      const [, countryCode, countryName, currencyCode, localPrice, priceUsd, convertedCNY] = pm;
      prices.push({
        countryCode,
        countryName,
        currencyCode,
        localPrice: Number(localPrice),
        priceUsd: Number(priceUsd),
        convertedCNY: Number(convertedCNY),
      });
    }

    plans.push({
      subscriptionId,
      name,
      nameZh,
      nameLower: name.toLowerCase(),
      duration,
      source,
      prices,
    });
  }

  return plans;
}

async function loadLocalRows() {
  const ts = await readFile(LOCAL_FILE, "utf8");
  const js = ts
    .replace(/^import[^\n]*\n/gm, "")
    .replace(
      /export const subscriptionRegionPrices\s*:\s*SubscriptionRegionPrice\[\]\s*=\s*/,
      "const subscriptionRegionPrices = ",
    );

  const fn = new Function(`${js}\nreturn subscriptionRegionPrices;`);
  const rows = fn();

  if (!Array.isArray(rows)) {
    throw new Error("Failed to parse local subscriptionRegionPrices");
  }

  return rows;
}

function idPrefixFromRuleKey(key) {
  if (key.startsWith("chatgpt-plus-yearly")) return "chatgpt-plus-yearly";
  if (key.startsWith("chatgpt-pro-20x")) return "chatgpt-pro-20x";
  if (key.startsWith("chatgpt-pro-5x")) return "chatgpt-pro-5x";
  if (key.startsWith("chatgpt-plus")) return "chatgpt-plus";
  if (key.startsWith("chatgpt-go")) return "chatgpt-go";
  if (key.startsWith("claude-max-20x")) return "claude-max-20x";
  if (key.startsWith("claude-max-5x")) return "claude-max-5x";
  if (key.startsWith("claude-pro-yearly")) return "claude-pro-annual";
  if (key.startsWith("claude-pro")) return "claude-pro";
  if (key.startsWith("gemini-ai-plus-yearly")) return "gemini-plus-yearly";
  if (key.startsWith("gemini-ai-plus-monthly")) return "gemini-plus";
  if (key.startsWith("gemini-ai-pro-yearly")) return "gemini-pro-yearly";
  if (key.startsWith("gemini-ai-pro-monthly")) return "gemini-pro";
  if (key.startsWith("github-pro-monthly")) return "github-pro";
  if (key.startsWith("github-copilot-pro-monthly")) return "github-copilot-pro";
  if (key.startsWith("github-copilot-pro-plus-monthly")) return "github-copilot-pro-plus";
  if (key.startsWith("github-copilot-max-monthly")) return "github-copilot-max";
  return key;
}

function buildRowsFromPlan(rule, plan) {
  const idPrefix = idPrefixFromRuleKey(rule.key);
  return plan.prices.map((price) => ({
    id: `${idPrefix}-${price.countryCode.toLowerCase()}`,
    provider: rule.mapping.provider,
    productName: rule.mapping.productName,
    planName: rule.mapping.planName,
    billingCycle: rule.mapping.billingCycle,
    country: COUNTRY_NAME_OVERRIDES[price.countryCode] ?? price.countryName,
    countryCode: price.countryCode,
    currencyCode: price.currencyCode,
    localPrice: price.localPrice,
    convertedCNY: price.convertedCNY,
    sourceLabel: "地区价格整理",
    updatedAt: REVIEWED_AT,
  }));
}

function toTsObject(row) {
  return `  {\n    id: "${row.id}",\n    provider: "${row.provider}",\n    productName: "${row.productName}",\n    planName: "${row.planName}",\n    billingCycle: "${row.billingCycle}",\n    country: "${row.country}",\n    countryCode: "${row.countryCode}",\n    currencyCode: "${row.currencyCode}",\n    localPrice: ${row.localPrice},\n    convertedCNY: ${row.convertedCNY},\n    sourceLabel: "${row.sourceLabel}",\n    updatedAt: reviewedAt,\n  },`;
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const ak = `${a.provider}|${a.productName}|${a.planName}|${a.billingCycle}|${a.convertedCNY}|${a.countryCode}`;
    const bk = `${b.provider}|${b.productName}|${b.planName}|${b.billingCycle}|${b.convertedCNY}|${b.countryCode}`;
    return ak.localeCompare(bk, "zh-CN");
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const localRows = await loadLocalRows();

  const plansByRuleKey = new Map();

  for (const url of args.urls) {
    const response = await fetch(url, {
      headers: {
        "user-agent": "ai-price-watch-sync/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const plans = parsePlansFromHtml(html);

    for (const rule of PLAN_RULES) {
      if (plansByRuleKey.has(rule.key)) continue;
      const matched = plans.find((p) => rule.match(p));
      if (matched) {
        plansByRuleKey.set(rule.key, matched);
      }
    }
  }

  const matchedRules = PLAN_RULES.filter((rule) => plansByRuleKey.has(rule.key));
  if (matchedRules.length === 0) {
    throw new Error("No plans matched from remote sources.");
  }

  const removedMatchers = matchedRules.map((rule) => rule.mapping);
  const keptRows = localRows.filter(
    (row) =>
      !removedMatchers.some(
        (m) =>
          row.provider === m.provider &&
          row.productName === m.productName &&
          row.planName === m.planName &&
          row.billingCycle === m.billingCycle,
      ) &&
      !(
        row.provider === "Google" &&
        row.productName === "Gemini" &&
        row.planName === "Google AI Pro" &&
        row.billingCycle === "monthly"
      ),
  );

  const syncedRows = matchedRules.flatMap((rule) => buildRowsFromPlan(rule, plansByRuleKey.get(rule.key)));
  const dedupedById = new Map();
  for (const row of [...keptRows, ...syncedRows]) {
    dedupedById.set(row.id, row);
  }
  const nextRows = sortRows([...dedupedById.values()]);

  const content = `import type { SubscriptionRegionPrice } from "@/types";\n\nconst reviewedAt = "${REVIEWED_AT}";\n\nexport const subscriptionRegionPrices: SubscriptionRegionPrice[] = [\n${nextRows
    .map(toTsObject)
    .join("\n")}\n];\n`;

  await writeFile(LOCAL_FILE, content, "utf8");

  console.log(`Synced rules: ${matchedRules.length}`);
  console.log(`Rows before: ${localRows.length}`);
  console.log(`Rows after: ${nextRows.length}`);
  for (const rule of matchedRules) {
    const plan = plansByRuleKey.get(rule.key);
    console.log(`- ${rule.key}: ${plan?.subscriptionId} (${plan?.prices.length} regions)`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
