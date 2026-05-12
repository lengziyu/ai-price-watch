import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AIDeal } from "@/types";

const adminDataDir = path.join(process.cwd(), "data", "admin");
const crawlDataFile = path.join(process.cwd(), "data", "crawl", "price-snapshot.json");
const manualDealsFile = path.join(adminDataDir, "manual-deals.json");
const operationLogsFile = path.join(adminDataDir, "operation-logs.json");

export type CrawlSnapshotResult = {
  id: string;
  vendor: string;
  category: string;
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

async function ensureAdminDataDir() {
  await mkdir(adminDataDir, { recursive: true });
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
