export type BillingCycle = "monthly" | "yearly";

export type DataSourceType =
  | "official"
  | "official_docs"
  | "help_center"
  | "public_html"
  | "browser_assisted"
  | "manual_review"
  | "community"
  | "seed";

export type DataConfidence =
  | "verified"
  | "review"
  | "needs_update"
  | "blocked"
  | "seed";

export type EvidenceMeta = {
  sourceType?: DataSourceType;
  confidence?: DataConfidence;
  sourceLabel?: string;
  reviewedAt?: string;
  note?: string;
};

export type SubscriptionPlan = {
  id: string;
  productName: string;
  provider: string;
  planName: string;
  officialPriceUSD?: number;
  priceCNY?: number;
  billingCycle: BillingCycle;
  region?: string;
  sourceUrl?: string;
  note?: string;
  evidence?: EvidenceMeta;
  tags: string[];
  updatedAt: string;
};

export type SubscriptionRegionPrice = {
  id: string;
  provider: string;
  productName: string;
  planName: string;
  billingCycle: BillingCycle;
  country: string;
  countryCode: string;
  currencyCode: string;
  localPrice: number;
  convertedCNY: number;
  sourceLabel: string;
  note?: string;
  evidence?: EvidenceMeta;
  updatedAt: string;
};

export type TokenPriceCategory =
  | "text"
  | "vision"
  | "audio"
  | "embedding"
  | "reasoning";

export type TokenPrice = {
  id: string;
  modelName: string;
  provider: string;
  platform: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  currency: "USD" | "CNY";
  contextWindow?: string;
  category: TokenPriceCategory;
  sourceUrl?: string;
  note?: string;
  evidence?: EvidenceMeta;
  updatedAt: string;
};

export type AIDeal = {
  id: string;
  title: string;
  provider: string;
  summary: string;
  dealType:
    | "free_credit"
    | "discount"
    | "trial"
    | "student"
    | "region_price"
    | "other";
  value?: string;
  deadline?: string;
  sourceUrl?: string;
  howToGet?: string;
  suitableFor: string[];
  riskLevel: "low" | "medium" | "high";
  status: "active" | "expired" | "unknown";
  updatedAt: string;
};

export type UseCase = {
  id: string;
  title: string;
  description: string;
  group: "dev" | "work" | "research" | "automation" | "creative";
  recommendedTools: string[];
  recommendedModels: string[];
  bestFor: string[];
  workflow: string;
  budgetTip: string;
  ctaHref: string;
  ctaLabel: string;
  difficulty: "easy" | "medium" | "advanced";
  estimatedCost: "free" | "low" | "medium" | "high";
};

export type ToolDirectoryItem = {
  id: string;
  name: string;
  category: string;
  summary: string;
  pricing: string;
  url: string;
  tags: string[];
};

export type NavItem = {
  href: string;
  label: string;
  badge?: string;
  description?: string;
};
