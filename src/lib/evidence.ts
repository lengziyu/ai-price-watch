import type { DataConfidence, DataSourceType, EvidenceMeta } from "@/types";

export type EvidenceInput = {
  sourceUrl?: string;
  sourceLabel?: string;
  updatedAt?: string;
  tags?: string[];
  note?: string;
  evidence?: EvidenceMeta;
};

export type EvidenceTone = "good" | "review" | "muted" | "danger";

export type EvidenceSummary = {
  confidence: DataConfidence;
  sourceType: DataSourceType;
  sourceLabel: string;
  confidenceLabel: string;
  score: number;
  scoreLabel: string;
  tone: EvidenceTone;
  reviewedAt?: string;
  note?: string;
};

const confidenceLabels: Record<DataConfidence, string> = {
  verified: "已复核",
  review: "待确认",
  needs_update: "需更新",
  blocked: "受限",
  seed: "整理录入",
};

const sourceTypeLabels: Record<DataSourceType, string> = {
  official: "官方价格",
  official_docs: "官方文档",
  help_center: "帮助中心",
  public_html: "公开抓取",
  browser_assisted: "浏览器辅助",
  manual_review: "人工复核",
  community: "社区样本",
  seed: "价格整理",
};

export function renderConfidenceLabel(value: DataConfidence) {
  return confidenceLabels[value];
}

export function renderSourceTypeLabel(value: DataSourceType) {
  return sourceTypeLabels[value];
}

export function buildEvidenceSummary(input: EvidenceInput): EvidenceSummary {
  const sourceType = input.evidence?.sourceType ?? inferSourceType(input);
  const confidence = input.evidence?.confidence ?? inferConfidence(input, sourceType);
  const sourceLabel =
    input.evidence?.sourceLabel ??
    input.sourceLabel ??
    sourceTypeLabels[sourceType];
  const reviewedAt = input.evidence?.reviewedAt ?? input.updatedAt;
  const note = input.evidence?.note ?? buildFallbackNote(input, sourceType, confidence);
  const score = scoreEvidence({ ...input, evidence: { ...input.evidence, confidence, sourceType } });

  return {
    confidence,
    sourceType,
    sourceLabel,
    confidenceLabel: confidenceLabels[confidence],
    score,
    scoreLabel: `${score}/100`,
    tone: toneFor(confidence),
    reviewedAt,
    note,
  };
}

export function scoreEvidence(input: EvidenceInput) {
  const sourceType = input.evidence?.sourceType ?? inferSourceType(input);
  const confidence = input.evidence?.confidence ?? inferConfidence(input, sourceType);
  const baseScore = {
    verified: 88,
    review: 66,
    needs_update: 52,
    blocked: 42,
    seed: 36,
  } satisfies Record<DataConfidence, number>;
  const sourceBonus = {
    official: 8,
    official_docs: 7,
    help_center: 5,
    public_html: 4,
    browser_assisted: 3,
    manual_review: 6,
    community: -4,
    seed: -8,
  } satisfies Record<DataSourceType, number>;
  const urlBonus = input.sourceUrl ? 4 : -6;
  const reviewedBonus = input.evidence?.reviewedAt || input.updatedAt ? 2 : -4;

  return Math.max(
    20,
    Math.min(98, baseScore[confidence] + sourceBonus[sourceType] + urlBonus + reviewedBonus),
  );
}

function inferSourceType(input: EvidenceInput): DataSourceType {
  const tags = input.tags ?? [];
  const url = input.sourceUrl?.toLowerCase() ?? "";
  const label = input.sourceLabel?.toLowerCase() ?? "";

  if (tags.includes("seed")) return "seed";
  if (label.includes("官方")) return "official";
  if (url.includes("docs.") || url.includes("/docs/")) return "official_docs";
  if (url.includes("help.") || url.includes("support.")) return "help_center";
  if (tags.includes("official") || url.includes("pricing") || url.includes("plans")) {
    return "official";
  }

  return input.sourceUrl ? "public_html" : "seed";
}

function inferConfidence(input: EvidenceInput, sourceType: DataSourceType): DataConfidence {
  if ((input.tags ?? []).includes("seed") || sourceType === "seed") return "seed";
  if (!input.sourceUrl) return "review";
  if (sourceType === "community") return "review";
  if (input.updatedAt) return "verified";
  return "needs_update";
}

function toneFor(confidence: DataConfidence): EvidenceTone {
  if (confidence === "verified") return "good";
  if (confidence === "review" || confidence === "needs_update") return "review";
  if (confidence === "blocked") return "danger";
  return "muted";
}

function buildFallbackNote(
  input: EvidenceInput,
  sourceType: DataSourceType,
  confidence: DataConfidence,
) {
  if (input.note) return input.note;
  if (confidence === "verified") return "已记录来源和更新时间，可作为前台展示基准。";
  if (sourceType === "seed") return "当前为整理录入数据，展示时请结合公开来源一起参考。";
  if (confidence === "blocked") return "公开抓取受限，需要后台人工复核。";
  return "已纳入复核队列，等待人工确认价格口径。";
}
