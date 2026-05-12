export type BillingCycle = "monthly" | "yearly";

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
  recommendedTools: string[];
  recommendedModels: string[];
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
