#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_URL = "https://appstoreprice.org/zh/apps/6448311069";
const LOCAL_FILE = "src/data/subscription-regions.ts";

const PLAN_KEY_TO_LOCAL = {
  "chatgpt-plus": { planName: "Plus", billingCycle: "monthly" },
  "chatgpt-go": { planName: "Go", billingCycle: "monthly" },
  "chatgpt-pro-5x": { planName: "Pro 5x", billingCycle: "monthly" },
  "chatgpt-pro-20x": { planName: "Pro 20x", billingCycle: "monthly" },
  "chatgpt-plus-yearly": { planName: "Plus", billingCycle: "yearly" },
  "claude-pro": { planName: "Pro", billingCycle: "monthly" },
  "claude-max-5x": { planName: "Max 5x", billingCycle: "monthly" },
  "claude-max-20x": { planName: "Max 20x", billingCycle: "monthly" },
  "claude-pro-yearly": { planName: "Pro", billingCycle: "yearly" },
  "gemini-ai-pro-monthly": { planName: "Google AI Pro (5 TB)", billingCycle: "monthly" },
  "gemini-ai-pro-yearly": { planName: "Google AI Pro (5 TB)", billingCycle: "yearly" },
  "gemini-ai-plus-monthly": { planName: "Google AI Plus (200GB)", billingCycle: "monthly" },
  "gemini-ai-plus-yearly": { planName: "Google AI Plus (200GB)", billingCycle: "yearly" },
  "github-pro-monthly": { planName: "GitHub Pro", billingCycle: "monthly" },
  "github-copilot-pro-monthly": { planName: "Copilot Pro", billingCycle: "monthly" },
  "github-copilot-pro-plus-monthly": { planName: "Copilot Pro+", billingCycle: "monthly" },
  "github-copilot-max-monthly": { planName: "Copilot Max", billingCycle: "monthly" },
};

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    planKey: "all",
    provider: "OpenAI",
    product: "ChatGPT",
    cnyWarn: 0.5,
    localWarn: 0.01,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const [k, v] = item.includes("=") ? item.split(/=(.*)/s, 2) : [item, argv[i + 1]];
    const key = k.slice(2);
    const value = v ?? "";

    if (!item.includes("=")) i += 1;

    if (key === "url") args.url = value;
    if (key === "plan-key") args.planKey = value;
    if (key === "provider") args.provider = value;
    if (key === "product") args.product = value;
    if (key === "cny-warn") args.cnyWarn = Number(value);
    if (key === "local-warn") args.localWarn = Number(value);
  }

  return args;
}

function providerProductForPlanKey(planKey) {
  if (planKey.startsWith("chatgpt-")) {
    return { provider: "OpenAI", product: "ChatGPT" };
  }
  if (planKey.startsWith("claude-")) {
    return { provider: "Anthropic", product: "Claude" };
  }
  if (planKey.startsWith("gemini-")) {
    return { provider: "Google", product: "Gemini" };
  }
  if (planKey.startsWith("github-")) {
    return { provider: "GitHub", product: "GitHub" };
  }
  return null;
}

function normalizePlanKey(name, duration) {
  const base = `${name}`.toLowerCase();
  const cycle = `${duration}`.toLowerCase();

  if (base.includes("claude pro") && (cycle.includes("year") || cycle.includes("annual"))) {
    return "claude-pro-yearly";
  }
  if (base.includes("claude max 20x")) return "claude-max-20x";
  if (base.includes("claude max 5x")) return "claude-max-5x";
  if (base.includes("claude pro")) return "claude-pro";
  if (base.includes("google ai plus") && cycle.includes("year")) return "gemini-ai-plus-yearly";
  if (base.includes("google ai plus") && cycle.includes("month")) return "gemini-ai-plus-monthly";
  if (base.includes("google ai pro") && cycle.includes("year")) return "gemini-ai-pro-yearly";
  if (base.includes("google ai pro") && cycle.includes("month")) return "gemini-ai-pro-monthly";
  if (base === "github pro" && cycle.includes("month")) return "github-pro-monthly";
  if (base === "copilot pro" && cycle.includes("month")) return "github-copilot-pro-monthly";
  if (base === "copilot pro+" && cycle.includes("month")) return "github-copilot-pro-plus-monthly";
  if (base === "copilot max" && cycle.includes("month")) return "github-copilot-max-monthly";
  if (base.includes("chatgpt plus") && (cycle.includes("year") || cycle.includes("annual"))) {
    return "chatgpt-plus-yearly";
  }
  if (base.includes("chatgpt plus")) return "chatgpt-plus";
  if (base.includes("chatgpt go")) return "chatgpt-go";
  if (base.includes("chatgpt pro 5x")) return "chatgpt-pro-5x";
  if (base.includes("chatgpt pro 20x")) return "chatgpt-pro-20x";
  return null;
}

function parseEmbeddedPlans(html) {
  const planRegex = /\{\\"id\\":\d+,\\"subscriptionId\\":\\"([^\\"]+)\\",\\"name\\":\\"([^\\"]+)\\",\\"nameZh\\":\\"([^\\"]+)\\",\\"type\\":\\"subscription\\",\\"duration\\":\\"([^\\"]+)\\",\\"source\\":\\"[^\\"]+\\",\\"prices\\":\[(.*?)\]\}/gs;
  const priceRegex = /\{\\"region\\":\\"([^\\"]+)\\",\\"regionName\\":\\"([^\\"]+)\\",\\"currency\\":\\"([^\\"]+)\\",\\"price\\":([0-9.]+),\\"priceUsd\\":([0-9.]+),\\"priceCny\\":([0-9.]+)\}/g;

  const plans = [];
  let m;
  while ((m = planRegex.exec(html)) !== null) {
    const [, subscriptionId, name, nameZh, duration, pricesChunk] = m;
    const planKey = normalizePlanKey(name, duration);
    const prices = [];

    let pm;
    while ((pm = priceRegex.exec(pricesChunk)) !== null) {
      const [, region, regionName, currency, price, priceUsd, priceCny] = pm;
      prices.push({
        countryCode: region,
        countryName: regionName,
        currencyCode: currency,
        localPrice: Number(price),
        priceUsd: Number(priceUsd),
        convertedCNY: Number(priceCny),
      });
    }

    if (prices.length > 0) {
      plans.push({
        subscriptionId,
        name,
        nameZh,
        duration,
        planKey,
        prices,
      });
    }
  }

  return plans;
}

async function loadLocalRegionPrices() {
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
    throw new Error("Failed to load local subscriptionRegionPrices.");
  }

  return rows;
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(2) : "NaN";
}

function pct(delta, base) {
  if (!Number.isFinite(base) || base === 0) return "n/a";
  return `${((delta / base) * 100).toFixed(2)}%`;
}

function compareOnePlan({ remotePlan, localRows, warnCny, warnLocal }) {
  const localByCountry = new Map(localRows.map((r) => [r.countryCode, r]));
  const remoteByCountry = new Map(remotePlan.prices.map((r) => [r.countryCode, r]));

  const shared = [...remoteByCountry.keys()].filter((k) => localByCountry.has(k)).sort();
  const missingLocal = [...remoteByCountry.keys()].filter((k) => !localByCountry.has(k)).sort();
  const extraLocal = [...localByCountry.keys()].filter((k) => !remoteByCountry.has(k)).sort();

  const mismatches = [];
  for (const cc of shared) {
    const local = localByCountry.get(cc);
    const remote = remoteByCountry.get(cc);

    const deltaCny = local.convertedCNY - remote.convertedCNY;
    const deltaLocal = local.localPrice - remote.localPrice;
    const currencyMismatch = local.currencyCode !== remote.currencyCode;
    const localMismatch = Math.abs(deltaLocal) > warnLocal;
    const cnyMismatch = Math.abs(deltaCny) > warnCny;

    if (currencyMismatch || localMismatch || cnyMismatch) {
      mismatches.push({
        countryCode: cc,
        country: remote.countryName,
        localCurrency: `${local.currencyCode} ${fmt(local.localPrice)}`,
        remoteCurrency: `${remote.currencyCode} ${fmt(remote.localPrice)}`,
        localCny: local.convertedCNY,
        remoteCny: remote.convertedCNY,
        deltaCny,
        deltaLocal,
        currencyMismatch,
      });
    }
  }

  return { shared, missingLocal, extraLocal, mismatches };
}

async function main() {
  const args = parseArgs(process.argv);
  const inferred = args.planKey !== "all" ? providerProductForPlanKey(args.planKey) : null;
  if (inferred) {
    args.provider = inferred.provider;
    args.product = inferred.product;
  }
  const response = await fetch(args.url, {
    headers: {
      "user-agent": "ai-price-watch-validator/1.0",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const remotePlans = parseEmbeddedPlans(html).filter((p) => p.planKey);

  if (remotePlans.length === 0) {
    throw new Error("No subscription plans were parsed from appstoreprice page.");
  }

  const localAll = await loadLocalRegionPrices();
  const localFiltered = localAll.filter(
    (row) => row.provider === args.provider && row.productName === args.product,
  );

  let targetPlans =
    args.planKey === "all"
      ? remotePlans
      : remotePlans.filter((p) => p.planKey === args.planKey);

  if (targetPlans.length > 1 && args.planKey.startsWith("gemini-")) {
    const canonicalIdByKey = {
      "gemini-ai-pro-monthly": "com.google.gemini.2tb.ai.m",
      "gemini-ai-pro-yearly": "com.google.gemini.2tb.ai.a",
      "gemini-ai-plus-monthly": "com.google.gemini.helium.m",
      "gemini-ai-plus-yearly": "com.google.gemini.helium.a",
    };
    const canonical =
      targetPlans.find((p) => p.subscriptionId === canonicalIdByKey[args.planKey]) ??
      [...targetPlans].sort((a, b) => b.prices.length - a.prices.length)[0];
    targetPlans = canonical ? [canonical] : targetPlans;
  }

  if (targetPlans.length === 0) {
    const keys = [...new Set(remotePlans.map((p) => p.planKey))].join(", ");
    throw new Error(`Plan key not found. Available: ${keys}`);
  }

  console.log(`Source: ${args.url}`);
  console.log(`Parsed plans: ${[...new Set(remotePlans.map((p) => p.planKey))].join(", ")}`);
  console.log(`Local rows: ${localFiltered.length} (${LOCAL_FILE})`);
  console.log("-");

  let hasIssue = false;

  for (const remotePlan of targetPlans) {
    const mapping = PLAN_KEY_TO_LOCAL[remotePlan.planKey];
    if (!mapping) continue;

    const localRows = localFiltered.filter(
      (r) => r.planName === mapping.planName && r.billingCycle === mapping.billingCycle,
    );

    const result = compareOnePlan({
      remotePlan,
      localRows,
      warnCny: args.cnyWarn,
      warnLocal: args.localWarn,
    });

    console.log(`Plan: ${remotePlan.planKey} (${remotePlan.nameZh || remotePlan.name})`);
    console.log(`Shared countries: ${result.shared.length}`);
    console.log(`Missing in local: ${result.missingLocal.length ? result.missingLocal.join(", ") : "none"}`);
    console.log(`Extra in local: ${result.extraLocal.length ? result.extraLocal.join(", ") : "none"}`);

    if (result.mismatches.length === 0) {
      console.log("Mismatches: none");
    } else {
      hasIssue = true;
      console.log(`Mismatches (${result.mismatches.length}):`);
      for (const item of result.mismatches) {
        console.log(
          `- ${item.countryCode} ${item.country}: CNY local=${fmt(item.localCny)} remote=${fmt(item.remoteCny)} delta=${fmt(item.deltaCny)} (${pct(item.deltaCny, item.remoteCny)}), local delta=${fmt(item.deltaLocal)}${item.currencyMismatch ? " (currency mismatch)" : ""} | local=${item.localCurrency} remote=${item.remoteCurrency}`,
        );
      }
    }

    console.log("-");
  }

  if (hasIssue) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
