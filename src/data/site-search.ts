import type { SiteLocale } from "@/lib/i18n";

type SearchSection = "page" | "vendor" | "use_case" | "tool";

type SiteSearchEntrySeed = {
  id: string;
  title: Record<SiteLocale, string>;
  description: Record<SiteLocale, string>;
  href: string;
  section: SearchSection;
  keywords: Record<SiteLocale, string[]>;
};

export type SiteSearchEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  section: string;
  keywords: string[];
};

const sectionLabelMap: Record<SiteLocale, Record<SearchSection, string>> = {
  "zh-CN": {
    page: "页面",
    vendor: "厂商",
    use_case: "场景",
    tool: "工具",
  },
  en: {
    page: "Page",
    vendor: "Vendor",
    use_case: "Use Case",
    tool: "Tool",
  },
};

const siteSearchEntrySeeds: SiteSearchEntrySeed[] = [
  {
    id: "page-home",
    title: { "zh-CN": "首页", en: "Home" },
    description: {
      "zh-CN": "查看站内核心入口、订阅对比、Token 比价和优惠活动。",
      en: "Jump into the main entry points, plans, token pricing, and deals.",
    },
    href: "/",
    section: "page",
    keywords: {
      "zh-CN": ["首页", "导航", "比价", "入口"],
      en: ["home", "navigation", "pricing", "entry"],
    },
  },
  {
    id: "page-tokens",
    title: { "zh-CN": "Token 比价", en: "Token Pricing" },
    description: {
      "zh-CN": "按平台、分类和输入输出成本筛选 API 模型。",
      en: "Filter API models by platform, category, and input-output cost.",
    },
    href: "/pricing/tokens",
    section: "page",
    keywords: {
      "zh-CN": ["token", "api", "模型价格", "输入价", "输出价"],
      en: ["token", "api", "model pricing", "input cost", "output cost"],
    },
  },
  {
    id: "page-subscriptions",
    title: { "zh-CN": "会员订阅", en: "Subscriptions" },
    description: {
      "zh-CN": "对比 ChatGPT、Claude、Gemini 等不同地区的月费。",
      en: "Compare ChatGPT, Claude, Gemini, and other plan prices by region.",
    },
    href: "/pricing/subscriptions",
    section: "page",
    keywords: {
      "zh-CN": ["订阅", "会员", "地区价", "汇率", "plus", "pro"],
      en: ["subscription", "plan", "regional pricing", "fx", "plus", "pro"],
    },
  },
  {
    id: "page-membership-rates",
    title: { "zh-CN": "会员速率", en: "Membership Rates" },
    description: {
      "zh-CN": "查看官方额度口径、社区体感和厂商速率面板。",
      en: "Review quota notes, community signal, and vendor rate boards.",
    },
    href: "/membership-rates",
    section: "page",
    keywords: {
      "zh-CN": ["速率", "额度", "配额", "5小时", "weekly"],
      en: ["rates", "credits", "quota", "5-hour", "weekly"],
    },
  },
  {
    id: "page-deals",
    title: { "zh-CN": "AI 优惠", en: "AI Deals" },
    description: {
      "zh-CN": "收录试用、学生权益、免费额度和正规优惠入口。",
      en: "Track trials, student perks, free credits, and verified promo entries.",
    },
    href: "/deals",
    section: "page",
    keywords: {
      "zh-CN": ["优惠", "羊毛", "试用", "学生", "免费额度"],
      en: ["deals", "promo", "trial", "student", "free credits"],
    },
  },
  {
    id: "page-use-cases",
    title: { "zh-CN": "使用场景", en: "Use Cases" },
    description: {
      "zh-CN": "按开发、写作、研究、自动化和创意任务选工具。",
      en: "Choose tools by coding, writing, research, automation, and creative work.",
    },
    href: "/use-cases",
    section: "use_case",
    keywords: {
      "zh-CN": ["场景", "用途", "写代码", "写作", "学习", "自动化"],
      en: ["use case", "workflow", "coding", "writing", "study", "automation"],
    },
  },
  {
    id: "page-tools",
    title: { "zh-CN": "工具导航", en: "Tool Directory" },
    description: {
      "zh-CN": "浏览常见 AI 工具和产品定位。",
      en: "Browse common AI tools and where each product fits best.",
    },
    href: "/tools",
    section: "tool",
    keywords: {
      "zh-CN": ["工具", "导航", "cursor", "copilot", "perplexity"],
      en: ["tool", "directory", "cursor", "copilot", "perplexity"],
    },
  },
  {
    id: "vendor-openai",
    title: { "zh-CN": "OpenAI / ChatGPT / Codex", en: "OpenAI / ChatGPT / Codex" },
    description: {
      "zh-CN": "看 ChatGPT Plus、Pro 和 Codex 的会员速率面板。",
      en: "Check ChatGPT Plus, Pro, and Codex rate notes in one board.",
    },
    href: "/membership-rates?vendor=openai",
    section: "vendor",
    keywords: {
      "zh-CN": ["openai", "chatgpt", "codex", "plus", "pro"],
      en: ["openai", "chatgpt", "codex", "plus", "pro"],
    },
  },
  {
    id: "vendor-claude",
    title: { "zh-CN": "Claude", en: "Claude" },
    description: {
      "zh-CN": "看 Claude Pro / Max 的价格带和社区体感。",
      en: "See Claude Pro and Max pricing bands with community signal.",
    },
    href: "/membership-rates?vendor=anthropic",
    section: "vendor",
    keywords: {
      "zh-CN": ["claude", "anthropic", "max", "pro"],
      en: ["claude", "anthropic", "max", "pro"],
    },
  },
  {
    id: "vendor-gemini",
    title: { "zh-CN": "Gemini", en: "Gemini" },
    description: {
      "zh-CN": "看 Google AI Pro / Ultra 的官方权益口径。",
      en: "Review official Google AI Pro and Ultra benefit notes.",
    },
    href: "/membership-rates?vendor=google",
    section: "vendor",
    keywords: {
      "zh-CN": ["gemini", "google ai", "ultra", "google ai pro"],
      en: ["gemini", "google ai", "ultra", "google ai pro"],
    },
  },
  {
    id: "vendor-cursor",
    title: { "zh-CN": "Cursor", en: "Cursor" },
    description: {
      "zh-CN": "看 Hobby / Pro / Business 的会员速率与体感。",
      en: "Compare Cursor Hobby, Pro, and team-tier usage notes.",
    },
    href: "/membership-rates?vendor=cursor",
    section: "vendor",
    keywords: {
      "zh-CN": ["cursor", "ide", "agent", "fast requests"],
      en: ["cursor", "ide", "agent", "fast requests"],
    },
  },
  {
    id: "vendor-github",
    title: { "zh-CN": "GitHub Copilot", en: "GitHub Copilot" },
    description: {
      "zh-CN": "看 Free / Pro / Pro+ 的 premium requests 和 code review 体验。",
      en: "Check premium request tiers and code review fit for Copilot.",
    },
    href: "/membership-rates?vendor=github",
    section: "vendor",
    keywords: {
      "zh-CN": ["github", "copilot", "code review", "premium requests"],
      en: ["github", "copilot", "code review", "premium requests"],
    },
  },
  {
    id: "vendor-deepseek",
    title: { "zh-CN": "DeepSeek", en: "DeepSeek" },
    description: {
      "zh-CN": "看 DeepSeek API 模型价格、上下文和扣费规则。",
      en: "Review DeepSeek API pricing, context size, and billing rules.",
    },
    href: "/membership-rates?vendor=deepseek",
    section: "vendor",
    keywords: {
      "zh-CN": ["deepseek", "api", "tokens", "v4", "flash", "pro"],
      en: ["deepseek", "api", "tokens", "v4", "flash", "pro"],
    },
  },
  {
    id: "vendor-grok",
    title: { "zh-CN": "Grok", en: "Grok" },
    description: {
      "zh-CN": "看 X Premium / Premium+ 下的 Grok 访问层级。",
      en: "See how Grok access changes across X Premium tiers.",
    },
    href: "/membership-rates?vendor=grok",
    section: "vendor",
    keywords: {
      "zh-CN": ["grok", "xai", "x premium", "premium plus"],
      en: ["grok", "xai", "x premium", "premium plus"],
    },
  },
  {
    id: "vendor-perplexity",
    title: { "zh-CN": "Perplexity", en: "Perplexity" },
    description: {
      "zh-CN": "看 Pro / Max / Enterprise 的研究型订阅定位。",
      en: "Compare research-focused Pro, Max, and Enterprise positioning.",
    },
    href: "/membership-rates?vendor=perplexity",
    section: "vendor",
    keywords: {
      "zh-CN": ["perplexity", "research", "pro", "max", "enterprise"],
      en: ["perplexity", "research", "pro", "max", "enterprise"],
    },
  },
  {
    id: "usecase-dev",
    title: { "zh-CN": "开发编程场景", en: "Coding Workflows" },
    description: {
      "zh-CN": "找写代码、代码审查、修 bug 和 agent workflow 的组合。",
      en: "Find tool mixes for coding, code review, bug fixing, and agent workflows.",
    },
    href: "/use-cases?group=dev",
    section: "use_case",
    keywords: {
      "zh-CN": ["开发", "写代码", "code review", "bug", "agent"],
      en: ["dev", "coding", "code review", "bug", "agent"],
    },
  },
  {
    id: "usecase-work",
    title: { "zh-CN": "写作办公场景", en: "Writing & Office" },
    description: {
      "zh-CN": "找邮件、PPT、方案、会议纪要和文案润色组合。",
      en: "Find tool mixes for email, decks, briefs, notes, and copy polishing.",
    },
    href: "/use-cases?group=work",
    section: "use_case",
    keywords: {
      "zh-CN": ["写作", "办公", "ppt", "邮件", "文案"],
      en: ["writing", "office", "slides", "email", "copy"],
    },
  },
  {
    id: "usecase-sales",
    title: { "zh-CN": "销售外联场景", en: "Sales Outreach" },
    description: {
      "zh-CN": "找开发信、客户跟进、线索调研和多轮外联组合。",
      en: "Find stacks for prospecting, follow-ups, lead research, and outreach.",
    },
    href: "/use-cases?group=work",
    section: "use_case",
    keywords: {
      "zh-CN": ["销售", "外联", "客户", "开发信", "跟进"],
      en: ["sales", "outreach", "customer", "prospecting", "follow-up"],
    },
  },
  {
    id: "usecase-research",
    title: { "zh-CN": "学习研究场景", en: "Study & Research" },
    description: {
      "zh-CN": "找学习、查资料、深研究和面试准备组合。",
      en: "Find stacks for study, sourcing, deep research, and interview prep.",
    },
    href: "/use-cases?group=research",
    section: "use_case",
    keywords: {
      "zh-CN": ["学习", "研究", "查资料", "面试", "perplexity"],
      en: ["study", "research", "sources", "interview", "perplexity"],
    },
  },
  {
    id: "usecase-automation",
    title: { "zh-CN": "自动化场景", en: "Automation" },
    description: {
      "zh-CN": "找 SOP、表格处理、脚本和重复劳动加速组合。",
      en: "Find setups for SOPs, spreadsheets, scripts, and repetitive work.",
    },
    href: "/use-cases?group=automation",
    section: "use_case",
    keywords: {
      "zh-CN": ["自动化", "sop", "脚本", "表格", "批量处理"],
      en: ["automation", "sop", "scripts", "sheets", "batch work"],
    },
  },
  {
    id: "usecase-support",
    title: { "zh-CN": "客服自动化场景", en: "Support Automation" },
    description: {
      "zh-CN": "找 FAQ、工单回复、知识库整理和客服提效组合。",
      en: "Find tool mixes for FAQs, ticket replies, and knowledge-base upkeep.",
    },
    href: "/use-cases?group=automation",
    section: "use_case",
    keywords: {
      "zh-CN": ["客服", "工单", "知识库", "回复", "FAQ"],
      en: ["support", "tickets", "knowledge base", "reply", "faq"],
    },
  },
  {
    id: "usecase-creative",
    title: { "zh-CN": "创意生成场景", en: "Creative Work" },
    description: {
      "zh-CN": "找图片、视频、社媒内容和多模态表达组合。",
      en: "Find stacks for images, video, social content, and multimodal output.",
    },
    href: "/use-cases?group=creative",
    section: "use_case",
    keywords: {
      "zh-CN": ["图片", "视频", "创意", "社媒", "内容生成"],
      en: ["image", "video", "creative", "social", "content"],
    },
  },
  {
    id: "tool-copilot",
    title: { "zh-CN": "GitHub Copilot", en: "GitHub Copilot" },
    description: {
      "zh-CN": "适合写代码、终端解释、代码审查和 GitHub 工作流。",
      en: "Best for coding, terminal help, code review, and GitHub workflows.",
    },
    href: "/tools",
    section: "tool",
    keywords: {
      "zh-CN": ["copilot", "github", "编码", "review"],
      en: ["copilot", "github", "coding", "review"],
    },
  },
  {
    id: "tool-perplexity",
    title: { "zh-CN": "Perplexity", en: "Perplexity" },
    description: {
      "zh-CN": "适合深研究、网页检索、引用导向的信息整合。",
      en: "Best for deep research, web search, and citation-first synthesis.",
    },
    href: "/tools",
    section: "tool",
    keywords: {
      "zh-CN": ["perplexity", "research", "search", "citations"],
      en: ["perplexity", "research", "search", "citations"],
    },
  },
  {
    id: "tool-grok",
    title: { "zh-CN": "Grok", en: "Grok" },
    description: {
      "zh-CN": "适合热点追踪、社媒语境和实时浏览。",
      en: "Best for trend tracking, social context, and live browsing.",
    },
    href: "/tools",
    section: "tool",
    keywords: {
      "zh-CN": ["grok", "xai", "热点", "实时"],
      en: ["grok", "xai", "trends", "live"],
    },
  },
];

export function getSiteSearchEntries(locale: SiteLocale): SiteSearchEntry[] {
  return siteSearchEntrySeeds.map((item) => ({
    id: item.id,
    title: item.title[locale],
    description: item.description[locale],
    href: item.href,
    section: sectionLabelMap[locale][item.section],
    keywords: item.keywords[locale],
  }));
}
