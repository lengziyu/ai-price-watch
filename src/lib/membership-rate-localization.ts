import {
  communityObservations,
  communitySnapshots,
  membershipPlans,
  membershipQuotaRows,
  membershipVendorBoards,
} from "@/data/membership-rates";
import type { SiteLocale } from "@/lib/i18n";

type MembershipPlan = (typeof membershipPlans)[number];
type MembershipQuotaRow = (typeof membershipQuotaRows)[number];
type CommunityObservation = (typeof communityObservations)[number];
type CommunitySnapshot = (typeof communitySnapshots)[number];

const englishMembershipPlanCopy: Record<
  MembershipPlan["id"],
  {
    name: string;
    audience: string;
    summary: string;
    note: string;
    features: string[];
    priceLabel?: string;
  }
> = {
  free: {
    name: "Free",
    audience: "Trial",
    summary: "A limited entry tier for testing the product and model access.",
    note:
      "The official pricing page positions Free as a capped entry tier with limits across messages, uploads, image generation, deep research, memory, and Codex.",
    features: [
      "Limited GPT-5.5 Instant access",
      "Capped messages and uploads",
      "Limited, slower image generation",
      "Limited deep research access",
      "Reduced memory and context support",
      "Limited Codex usage",
    ],
  },
  go: {
    name: "Go",
    audience: "Base Boost",
    summary: "A lighter paid tier that is better for steady chat, uploads, and image use.",
    note:
      "Shown at the current $8 tier, with the main value being higher base allowances than Free.",
    features: [
      "Everything in Free",
      "More GPT-5.5 Instant usage",
      "Higher message allowance",
      "Higher upload allowance",
      "Higher image allowance",
      "Longer memory retention",
    ],
  },
  plus: {
    name: "Plus",
    audience: "Core Personal",
    summary: "Best for frequent personal use, lighter local coding, and occasional cloud tasks.",
    note:
      "OpenAI's help center notes that Plus offers roughly double regular Codex usage through 2026-05-31.",
    features: [
      "Everything in Go",
      "GPT-5.5 Thinking for stronger reasoning",
      "Higher message and upload quotas",
      "More advanced image generation",
      "More deep research and agent-mode headroom",
      "Projects, tasks, and custom GPTs",
      "Higher Codex usage",
    ],
  },
  pro: {
    name: "Pro 5x",
    audience: "Power Personal",
    summary: "For higher quotas, stronger reasoning, and meaningfully larger Codex capacity.",
    note: "Displayed at the current $100 Pro 5x tier.",
    features: [
      "Everything in Plus",
      "Roughly 5x overall usage",
      "Roughly 10x Codex quota",
      "GPT-5.5 Pro reasoning",
      "Largest Codex task capacity",
      "Unlimited GPT-5.3 and file uploads",
      "Unlimited and faster image generation",
    ],
  },
  "pro-20x": {
    name: "Pro 20x",
    audience: "Heavy Personal",
    summary: "For the heaviest personal workflows, especially parallel work and very long sessions.",
    note: "Displayed at the current $200 Pro 20x tier.",
    features: [
      "Everything in Pro 5x",
      "Roughly 20x overall usage",
      "Roughly 20x Codex quota",
      "Better fit for sustained heavy sessions",
      "More stable for heavy multi-tasking",
    ],
  },
  business: {
    name: "Business",
    audience: "Teams",
    summary: "A secure shared workspace for collaboration, connected apps, and admin control.",
    note:
      "Shown at $25 per seat; the enterprise Codex docs also expose the credits-based billing view.",
    features: [
      "ChatGPT Plus plus Business Codex capabilities",
      "Top-tier models for work use",
      "60+ app connectors",
      "Shared projects and workspace GPTs",
      "Member, role, and billing management",
      "Controls like SAML SSO and MFA",
      "Business data excluded from training by default",
    ],
    priceLabel: "$25 / seat",
  },
  enterprise: {
    name: "Enterprise",
    audience: "Large Orgs",
    summary: "Enterprise-grade security, controls, support, and custom commercial terms.",
    note:
      "Best for organizations that need data residency, compliance features, SLAs, invoicing, and volume discounts.",
    features: [
      "Expanded context window",
      "SCIM, EKM, analytics, and domain verification",
      "Custom data retention policies",
      "Encryption at rest and in transit",
      "Data residency across 10 regions",
      "24/7 priority support and SLA",
    ],
    priceLabel: "Contact Sales",
  },
};

const englishMembershipQuotaRows: Record<
  MembershipQuotaRow["scope"],
  { scope: string; period: string; community: string }
> = {
  "GPT-5.5 本地编码任务": {
    scope: "GPT-5.5 local coding",
    period: "Per 5 hours",
    community:
      "Light tasks land closer to the top of the range; multi-file refactors, long context, and higher reasoning push usage toward the lower end.",
  },
  "GPT-5.4 本地编码任务": {
    scope: "GPT-5.4 local coding",
    period: "Per 5 hours",
    community:
      "Mid-size repo fixes usually last longer than GPT-5.5, but sustained large patches still compress the window quickly.",
  },
  "GPT-5.4 mini 本地编码任务": {
    scope: "GPT-5.4 mini local coding",
    period: "Per 5 hours",
    community:
      "Quick Q&A, comments, and small diffs get closest to the upper bound. It works well as a quota-saving default.",
  },
  "GPT-5.3-Codex 本地编码任务": {
    scope: "GPT-5.3-Codex local coding",
    period: "Per 5 hours",
    community:
      "Many users find it steadier for maintenance work in older repos, but long-chain problems still push it into the lower-middle range.",
  },
  "GPT-5.3-Codex 云任务": {
    scope: "GPT-5.3-Codex cloud tasks",
    period: "Per week",
    community:
      "Cloud tasks are the most sensitive to context size and execution length. Running several long tasks in parallel usually lowers real usable counts.",
  },
  "GPT-5.3-Codex code review": {
    scope: "GPT-5.3-Codex code review",
    period: "Per week",
    community:
      "Short PR reviews stay closer to the official range; large PRs, cross-directory diffs, and repeated follow-ups burn quota faster.",
  },
};

const englishCommunityObservations: Record<
  CommunityObservation["title"],
  { title: string; detail: string }
> = {
  "短任务更接近官方上沿": {
    title: "Short tasks stay near the upper bound",
    detail:
      "Single-file fixes, pre-release checks, and small copy edits usually land closer to OpenAI's theoretical upper range than larger refactors do.",
  },
  "复杂仓库会明显压低有效次数": {
    title: "Complex repos cut usable counts fast",
    detail:
      "Multi-file diffs, long context, repeated follow-ups, and high-reasoning mode all reduce how many tasks fit into the same 5-hour window.",
  },
  "云任务和 code review 的波动最大": {
    title: "Cloud tasks and review fluctuate most",
    detail:
      "These are most affected by context size, execution length, and concurrency, so public samples usually suggest budgeting around the midpoint of the official range.",
  },
};

const englishCommunitySnapshots: Record<
  CommunitySnapshot["title"],
  { title: string; takeaway: string }
> = {
  "Plus 用户在重任务里 20 分钟烧掉约 75% 的 5 小时窗口": {
    title: "One Plus user burned ~75% of a 5h window in 20 minutes",
    takeaway:
      "Public examples consistently show that multi-file refactors, long context, and high-reasoning mode can push Plus far below the official upper range.",
  },
  "有用户观察到 weekly 与 5h 大约呈 2:1 消耗关系": {
    title: "Some users observed a roughly 2:1 weekly-to-5h burn ratio",
    takeaway:
      "That implies you can hit the weekly limit before fully exhausting each 5-hour window if the workload stays intense across the week.",
  },
  "轻量日常工作流有人一周结束还能剩 10% 到 20% weekly": {
    title: "Lighter daily workflows may still leave 10% to 20% weekly headroom",
    takeaway:
      "If most work is short Q&A, local patching, and code review, Plus or lower Pro tiers feel much better than they do in heavy-repo scenarios.",
  },
};

export function getLocalizedMembershipPlans(locale: SiteLocale) {
  if (locale !== "en") {
    return membershipPlans;
  }

  return membershipPlans.map((plan) => {
    const copy = englishMembershipPlanCopy[plan.id];

    return {
      ...plan,
      name: copy.name,
      audience: copy.audience,
      summary: copy.summary,
      note: copy.note,
      features: copy.features,
      priceLabel: copy.priceLabel ?? plan.priceLabel,
    };
  });
}

export function getLocalizedMembershipQuotaRows(locale: SiteLocale) {
  if (locale !== "en") {
    return membershipQuotaRows;
  }

  return membershipQuotaRows.map((row) => {
    const copy = englishMembershipQuotaRows[row.scope];

    return {
      ...row,
      scope: copy.scope,
      period: copy.period,
      community: copy.community,
    };
  });
}

export function getLocalizedCommunityObservations(locale: SiteLocale) {
  if (locale !== "en") {
    return communityObservations;
  }

  return communityObservations.map((item) => {
    const copy = englishCommunityObservations[item.title];
    return { ...item, title: copy.title, detail: copy.detail };
  });
}

export function getLocalizedCommunitySnapshots(locale: SiteLocale) {
  if (locale !== "en") {
    return communitySnapshots;
  }

  return communitySnapshots.map((item) => {
    const copy = englishCommunitySnapshots[item.title];
    return { ...item, title: copy.title, takeaway: copy.takeaway };
  });
}

export function getLocalizedMembershipVendorBoards(locale: SiteLocale) {
  if (locale !== "en") {
    return membershipVendorBoards;
  }

  const localizedPlans = getLocalizedMembershipPlans(locale);
  const localizedQuotaRows = getLocalizedMembershipQuotaRows(locale);

  return membershipVendorBoards.map((vendor) => {
    if (vendor.id === "openai") {
      return {
        ...vendor,
        maintenanceTip:
          "ChatGPT pricing covers plan benefits, while Codex pricing adds more concrete 5-hour, weekly, and Business credits framing.",
        officialRate:
          "Official sources publish plan tiers, Codex usage windows, and Business credits framing.",
        communityRate:
          "Heavy tasks fluctuate most, but OpenAI still offers the clearest public documentation baseline.",
        plans: localizedPlans.map((plan) => ({
          name: plan.name,
          price: plan.priceLabel,
          detail: plan.summary,
          features: plan.features,
        })),
        officialNotes: [
          "The ChatGPT pricing page lists Free, Go, Plus, Pro, Business, and Enterprise plan benefits.",
          "Codex docs describe the quota ranges for different subscription tiers.",
          "Business and Enterprise also expose credits per 1M tokens for team budgeting.",
        ],
        communityNotes: [
          "Multi-file refactors, long context, and high-reasoning mode hit the 5-hour ceiling much faster than single-file work.",
          "Weekly limits often become the earlier bottleneck in sustained heavy usage.",
          "Short PR review, local diffs, and light Q&A stay closer to the official upper range.",
        ],
        quotaRows: localizedQuotaRows.map((row) => ({
          scope: row.scope,
          period: row.period,
          low: row.plus,
          mid: row.pro100,
          high: row.pro200,
          community: row.community,
        })),
      };
    }

    if (vendor.id === "anthropic") {
      return {
        ...vendor,
        maintenanceTip:
          "Claude pricing clearly exposes personal, team, and API pricing. Subscription-rate comparison still depends on usage multipliers and community signal.",
        officialRate:
          "Anthropic publicly shows Free, Pro, Max, and Team pricing, along with MTok API input-output rates.",
        communityRate:
          "Community signal centers on peak-hour stability, long-session tolerance, and very long document throughput.",
        plans: [
          {
            name: "Free",
            price: "$0 / month",
            detail: "A basic Claude entry point for chat, writing, and document Q&A.",
            features: [
              "Core Claude chat access",
              "Limited message allowance",
              "Web and mobile access",
              "Best for lighter writing and summaries",
            ],
          },
          {
            name: "Pro",
            price: "$20 / month",
            detail: "The main personal tier for long-text understanding, writing support, and research.",
            features: [
              "More usage than Free",
              "More stable peak-hour access",
              "Better for long documents and writing",
              "Good research and synthesis baseline",
            ],
          },
          {
            name: "Max 5x",
            price: "$100 / month",
            detail: "Built for heavier long-session usage and more sustained document analysis than Pro.",
            features: [
              "Roughly 5x Pro usage",
              "More stable at peak times",
              "Better endurance for long chats and analysis",
              "Fits heavier solo knowledge workflows",
            ],
          },
          {
            name: "Max 20x",
            price: "$200 / month",
            detail: "A very heavy personal tier focused on headroom rather than a public exact-message count.",
            features: [
              "Roughly 20x Pro usage",
              "Better for sustained high-intensity sessions",
              "More slack for large docs and batch summaries",
              "Fits users who treat Claude as a main workspace",
            ],
          },
          {
            name: "Team",
            price: "$20 / seat / month and up",
            detail: "Officially $20 annual / $25 monthly for standard seats, aimed at 5 to 150 person teams.",
            features: [
              "Team seats and centralized billing",
              "More usage in standard seats",
              "Premium seats scale up to 5x usage",
              "Better for predictable org-level cost control",
            ],
          },
        ],
        officialNotes: [
          "Claude's official subscription page emphasizes usage tier differences more than fixed hourly or weekly counts.",
          "Team standard seats are $20/seat/month annually or $25 monthly. Premium seats are $100 annually or $125 monthly.",
          "The API section publishes Opus and Sonnet input, output, and prompt-cache pricing.",
        ],
        communityNotes: [
          "Max tiers mainly separate themselves through peak-hour resilience, long-session continuity, and big-document throughput.",
          "Heavy users often use Claude for long drafting and large-document synthesis, then rely on other tools for code-heavy work.",
          "When you run repeated large-doc workflows, Pro hits capacity prompts sooner.",
        ],
        quotaRows: [
          {
            scope: "Subscription tier usage",
            period: "Monthly",
            low: "Pro: more than Free",
            mid: "Max 5x: roughly 5x Pro",
            high: "Max 20x: roughly 20x Pro",
            community: "Long documents and repeated deep analysis show the Max gap most clearly.",
          },
          {
            scope: "Team seats",
            period: "Per seat / month",
            low: "Standard: $20 annual",
            mid: "Standard: $25 monthly",
            high: "Premium: $100 annual / $125 monthly",
            community: "For teams, predictable cost and seat governance matter more than raw personal message counts.",
          },
          {
            scope: "API reference pricing",
            period: "Per MTok",
            low: "Sonnet 4.5: $3 in / $15 out",
            mid: "Opus 4.6: $5 in / $25 out",
            high: "Prompt cache read: $0.30 - $0.50",
            community: "Useful for budgeting, but actual subscription message ceilings still depend on the product page and account prompts.",
          },
        ],
      };
    }

    if (vendor.id === "google") {
      return {
        ...vendor,
        maintenanceTip:
          "Google's older Google One entry points can redirect by region. The Gemini subscriptions page is the cleaner source for Free, AI Plus, AI Pro, and AI Ultra.",
        officialRate:
          "Google describes plans through model access, ecosystem perks, storage, and advanced feature ceilings.",
        communityRate:
          "The felt difference mostly comes from Deep Research, video generation, NotebookLM, coding agents, and long-context workflows.",
        plans: [
          {
            name: "Free",
            price: "$0 / month",
            detail: "The base Gemini entry tier for anyone with a Google account.",
            features: [
              "Access to Gemini 3 Flash",
              "Variable access to Gemini 3.1 Pro",
              "Image generation and editing",
              "Deep Research, Gemini Live, Canvas, and Gems",
              "15GB Google storage",
            ],
          },
          {
            name: "Google AI Plus",
            price: "$7.99 / month",
            detail: "Adds more Gemini, NotebookLM, Flow, and Google-app AI access.",
            features: [
              "Everything in Free",
              "More 3.1 Pro and Nano Banana Pro access",
              "Limited Veo 3.1 Lite access",
              "More NotebookLM audio overviews and notebooks",
              "Gemini inside Gmail, Vids, and other Google apps",
              "200GB Google storage",
            ],
          },
          {
            name: "Google AI Pro",
            price: "$19.99 / month",
            detail: "The main personal tier for stronger models, research, video, coding, and Workspace perks.",
            features: [
              "Higher access to 3.1 Pro, Deep Research, and Nano Banana Pro",
              "Veo 3.1 Lite video generation",
              "Higher Jules async coding-agent limits",
              "Higher Gemini CLI and Code Assist daily requests",
              "Higher Google Antigravity rate limits",
              "5x NotebookLM benefits",
              "5TB Google storage",
            ],
          },
          {
            name: "Google AI Ultra",
            price: "$249.99 / month",
            detail: "The highest access tier with Deep Think, agent features, and the broadest ecosystem bundle.",
            features: [
              "Everything in Pro",
              "Highest model and feature ceilings",
              "Deep Think and Gemini Agent",
              "Top-tier Veo 3.1 and Flow access",
              "Highest Jules, CLI, and Code Assist daily limits",
              "YouTube Premium individual",
              "30TB Google storage",
            ],
          },
        ],
        officialNotes: [
          "Gemini's subscription page publicly lists Free, AI Plus, AI Pro, and AI Ultra in USD.",
          "Pro currently calls out 5TB storage, NotebookLM 5x, and higher Jules, Gemini CLI, and Code Assist limits.",
          "Ultra currently calls out 30TB storage, Deep Think, agent access, YouTube Premium, and the highest usage tier.",
        ],
        communityNotes: [
          "Video, research reports, NotebookLM, and coding-agent workflows create the clearest Plus-to-Pro-to-Ultra differences.",
          "Basic chat quality does not separate the tiers as clearly as multimodal tools, Workspace perks, and developer tooling do.",
          "A large share of Google's plan value comes from ecosystem benefits, so pure chat-count comparisons can mislead.",
        ],
        quotaRows: [
          {
            scope: "Gemini app / advanced models",
            period: "Monthly",
            low: "Free: 3 Flash + variable 3.1 Pro",
            mid: "Pro: more 3.1 Pro + Deep Research",
            high: "Ultra: Deep Think + Agent + top limits",
            community: "Complex research, long docs, and multimodal tasks show the high-tier gap most clearly.",
          },
          {
            scope: "Developer tooling",
            period: "Per day / feature",
            low: "Plus: base ecosystem bump",
            mid: "Pro: higher Jules, CLI, and Code Assist limits",
            high: "Ultra: top daily caps and Antigravity rate limits",
            community: "Whether coding-agent quotas matter depends on whether you actually work inside Google's developer stack.",
          },
          {
            scope: "Ecosystem perks and storage",
            period: "Monthly",
            low: "Free: 15GB / Plus: 200GB",
            mid: "Pro: 5TB + Workspace Gemini",
            high: "Ultra: 30TB + YouTube Premium",
            community: "If you already pay for Google One or YouTube Premium, ecosystem perks can change the effective value sharply.",
          },
        ],
      };
    }

    if (vendor.id === "cursor") {
      return {
        ...vendor,
        maintenanceTip:
          "Cursor's pricing page is public and structurally clear, so Hobby, Pro, Teams, and Enterprise benefits are relatively easy to track.",
        officialRate:
          "Cursor defines value through agent requests, Tab completion, frontier models, MCP, skills, hooks, and team governance.",
        communityRate:
          "The community watches agent burn, queue feel, and peak-hour slowdown much more than raw sticker price.",
        plans: [
          {
            name: "Hobby",
            price: "Free",
            detail: "No credit card needed. Best for testing the editor, Tab, and limited agent requests.",
            features: [
              "No credit card required",
              "Limited agent requests",
              "Limited Tab completions",
              "Good for validating the IDE workflow",
            ],
          },
          {
            name: "Pro",
            price: "$20 / mo.",
            detail: "The main solo tier for everyday coding, bug fixing, and medium-frequency agent use.",
            features: [
              "Everything in Hobby",
              "Expanded agent limits",
              "Access to frontier models",
              "MCP, skills, and hooks",
              "Cloud agents",
              "Usage-based Bugbot",
            ],
          },
          {
            name: "Teams",
            price: "$40 / user / mo.",
            detail: "Built for shared context, rules, security review, and centralized management.",
            features: [
              "Everything in Pro",
              "Cloud agents with shared team context",
              "Team rules, skills, and automation",
              "Security review agents",
              "SAML/OIDC SSO and team privacy mode",
              "Usage analytics and unified billing",
            ],
          },
          {
            name: "Enterprise",
            price: "Custom",
            detail: "Adds invoicing, shared usage pools, SCIM, audit logs, and more granular admin control.",
            features: [
              "Everything in Teams",
              "Shared usage pools",
              "Invoice and purchase-order billing",
              "SCIM seat management",
              "AI code-tracking API and audit logs",
              "Granular admin and model controls",
              "Priority support and customer success",
            ],
          },
        ],
        officialNotes: [
          "Cursor's official framing is closer to IDE experience design: agents, Tab, cloud agents, MCP, skills, and governance.",
          "Usage-based billing can continue model usage after included quota is exhausted.",
          "Teams and Enterprise mainly add shared context, security governance, and centralized management.",
        ],
        communityNotes: [
          "Peak queueing, agent speed, and stability on large multi-file repos are the most discussed quality signals.",
          "Heavy agent users care more about fast quota than single-completion latency.",
          "If Cursor is your main IDE, monthly headroom and queue behavior matter more than sticker price per seat.",
        ],
        quotaRows: [
          {
            scope: "Agent requests",
            period: "By plan / month",
            low: "Hobby: limited requests",
            mid: "Pro: expanded limits",
            high: "Teams/Enterprise: shared governance and team context",
            community: "The gap from Pro to team tiers becomes much more obvious on large multi-file repos than on plain autocomplete.",
          },
          {
            scope: "Model and workflow depth",
            period: "By feature",
            low: "Hobby: basic Tab and agent",
            mid: "Pro: frontier models + MCP + cloud agents",
            high: "Enterprise: model control + audit + shared pools",
            community: "Whether it feels worth the price usually depends on agent-heavy usage rather than chat-style usage alone.",
          },
        ],
      };
    }

    if (vendor.id === "github") {
      return {
        ...vendor,
        maintenanceTip:
          "GitHub's plans and billing docs are public and straightforward to crawl, which makes expansion into Business and Enterprise tracking relatively sustainable.",
        officialRate:
          "GitHub publicly documents Free, Pro, and Pro+ premium requests, plus how chat, agents, review, and CLI consume them.",
        communityRate:
          "Most discussion centers on whether Free is enough to test, whether Pro requests last, and how smooth large-repo review feels.",
        plans: [
          {
            name: "Copilot Free",
            price: "$0 / month",
            detail: "A good entry tier for trying GitHub and IDE-based Copilot workflows.",
            features: [
              "2,000 completions / month",
              "50 chat requests / month",
              "50 premium requests / month",
              "CLI, coding agent, and local/GitHub code-edit entry points",
            ],
          },
          {
            name: "Copilot Pro",
            price: "$10 / month",
            detail: "The core personal tier for daily completion, chat, agent mode, and review.",
            features: [
              "300 premium requests / month",
              "Unlimited base interactions like GPT-5 mini",
              "Includes MCP servers",
              "Custom instructions and agents",
              "Code review, agent mode, and Copilot CLI",
            ],
          },
          {
            name: "Copilot Pro+",
            price: "$39 / month",
            detail: "A higher personal tier for heavier agent use and stronger model access.",
            features: [
              "1,500 premium requests / month",
              "Extra premium requests at $0.04 each",
              "More advanced model access",
              "Better fit for frequent cloud agent and code review work",
            ],
          },
          {
            name: "Business",
            price: "$19 / user / month",
            detail: "Adds org seats, policy, management, and GitHub platform integration.",
            features: [
              "Pro capabilities plus org management",
              "Enterprise policy and access control",
              "Centralized billing and license management",
              "Better for standardized team IDE and GitHub workflows",
            ],
          },
          {
            name: "Enterprise",
            price: "$39 / user / month",
            detail: "Adds deeper platform governance, enterprise security, and knowledge integration.",
            features: [
              "Everything in Business plus enterprise features",
              "Stronger org governance and policy controls",
              "Deeper GitHub platform integration",
              "Best for large engineering organizations",
            ],
          },
        ],
        officialNotes: [
          "GitHub's pricing page states that Free includes 2,000 completions and 50 chat requests.",
          "The current page publishes 50 / 300 / 1,500 premium requests for Free / Pro / Pro+.",
          "Business and Enterprise lean much more on org governance, policy, and GitHub platform integration.",
        ],
        communityNotes: [
          "If you mostly use inline suggestions, the jump from Free to Pro usually feels larger than the jump from Pro to Pro+.",
          "Heavy code review, cloud agent use, and cross-repo workflows hit premium-request limits much faster.",
          "Copilot feels more valuable when used across both GitHub and the IDE instead of only inside the editor.",
        ],
        quotaRows: [
          {
            scope: "Completions / chat",
            period: "Monthly",
            low: "Free: 2,000 completions + 50 chat",
            mid: "Pro: much looser baseline usage",
            high: "Pro+: steadier for heavy solo use",
            community: "The biggest felt jump is usually from Free to Pro.",
          },
          {
            scope: "Premium requests",
            period: "Monthly",
            low: "Free: 50",
            mid: "Pro: 300",
            high: "Pro+: 1,500",
            community: "Chat, agent mode, code review, cloud agent, and Copilot CLI all consume premium requests.",
          },
          {
            scope: "Team governance",
            period: "Per seat / month",
            low: "Personal: no org governance",
            mid: "Business: $19/user",
            high: "Enterprise: $39/user",
            community: "Enterprise value depends mainly on policy, licensing, and platform-governance needs.",
          },
        ],
      };
    }

    if (vendor.id === "deepseek") {
      return {
        ...vendor,
        priceLabel: "from ¥0.02 / ¥1 / ¥2",
        maintenanceTip:
          "DeepSeek's API docs are structured and public, so model pricing, context length, and billing rules are relatively easy to track directly.",
        officialRate:
          "DeepSeek prices by million tokens and publicly exposes input-output pricing for deepseek-v4-flash and deepseek-v4-pro.",
        communityRate:
          "Most discussion centers on long-context cost, cache hit rate, and how pricing changes after the Pro discount window ends.",
        plans: [
          {
            name: "deepseek-v4-flash",
            price: "¥0.02 / ¥1 / ¥2",
            detail: "Cached input / uncached input / output, all priced per million tokens.",
            features: [
              "OpenAI-format Base URL",
              "Anthropic-format Base URL",
              "Thinking and non-thinking modes",
              "1M context length",
              "Up to 384K output",
              "JSON Output and Tool Calls",
              "FIM completion in non-thinking mode only",
            ],
          },
          {
            name: "deepseek-v4-pro",
            price: "¥0.025 / ¥3 / ¥6",
            detail: "Current 75% off promotional pricing. Original list price is ¥0.1 / ¥12 / ¥24 per million tokens.",
            features: [
              "DeepSeek-V4-Pro model",
              "Thinking mode support",
              "1M context length",
              "Up to 384K output",
              "JSON Output and Tool Calls",
              "Promo window currently ends 2026-05-31 23:59",
            ],
          },
          {
            name: "Billing rules",
            price: "Usage-based",
            detail: "Token consumption is multiplied by the model price and deducted from gifted or recharged balance.",
            features: [
              "Gift balance is deducted first",
              "Gift and recharged balance can coexist",
              "Check the page regularly for pricing changes",
              "Best for API budgeting rather than subscription comparison",
            ],
          },
        ],
        officialNotes: [
          "DeepSeek's official docs specify pricing in units of one million tokens.",
          "deepseek-chat and deepseek-reasoner are being retired and currently map to v4-flash non-thinking and thinking modes respectively.",
          "The v4-pro 75% off window is currently extended through 2026-05-31 23:59 Beijing time.",
        ],
        communityNotes: [
          "DeepSeek works more like an API cost board than a subscription board, so it is best evaluated separately.",
          "Whether long-context work is cost-efficient depends heavily on cache hit rate.",
          "After the Pro discount ends, pricing needs a fresh review or budgets will look too optimistic.",
        ],
        quotaRows: [
          {
            scope: "Model context",
            period: "Per request",
            low: "Flash: 1M context",
            mid: "Pro: 1M context",
            high: "Up to 384K output",
            community: "Long context is a cost advantage, but output length and cache hit rate can change the bill a lot.",
          },
          {
            scope: "Price per million tokens",
            period: "Usage-based",
            low: "Flash: ¥0.02 / ¥1 / ¥2",
            mid: "Pro promo: ¥0.025 / ¥3 / ¥6",
            high: "Pro list: ¥0.1 / ¥12 / ¥24",
            community: "Once the promo ends, Pro should be re-evaluated at list price.",
          },
          {
            scope: "Feature support",
            period: "By model",
            low: "JSON Output / Tool Calls",
            mid: "FIM in non-thinking mode",
            high: "OpenAI + Anthropic Base URLs",
            community: "Migration is easy, but model behavior and cache hit rate still deserve separate monitoring.",
          },
        ],
      };
    }

    if (vendor.id === "grok") {
      return {
        ...vendor,
        maintenanceTip:
          "X help pages can return 403, so browser-assisted review is usually more reliable than depending on server-side scraping alone.",
        officialRate:
          "Grok sits inside X Premium. Premium raises usage limits, while Premium+ offers the highest ceiling.",
        communityRate:
          "Community positioning tends to treat Grok as strong for live trends and social context rather than as the steadiest long-form coding assistant.",
        plans: [
          {
            name: "X Premium",
            price: "starts at $8 / month",
            detail: "Higher Grok limits for lighter to medium real-time Q&A use.",
            features: [
              "X membership bundle",
              "Increased Grok usage limits",
              "Best for trends and social context",
              "Region-dependent pricing",
            ],
          },
          {
            name: "X Premium+",
            price: "starts at $40 / month",
            detail: "Higher Grok ceilings for heavier real-time Q&A and trend monitoring.",
            features: [
              "Everything in Premium",
              "Higher Grok usage limits",
              "Better fit for heavy X users",
              "Localized regional pricing",
            ],
          },
        ],
        officialNotes: [
          "X's help center explicitly distinguishes Grok limits between Premium and Premium+.",
          "Premium+ pricing docs also list localized monthly and annual pricing for multiple countries.",
          "These subscriptions are fundamentally X membership bundles, with Grok as one of the main AI upsells.",
        ],
        communityNotes: [
          "Grok's edge is more about trends, social context, and live signals than strict long-form reasoning.",
          "If you already live inside X, the overall subscription value is usually higher than a raw AI-count comparison suggests.",
          "For research, it works best when cross-checked with citation-oriented tools instead of being the only source of truth.",
        ],
        quotaRows: [
          {
            scope: "Live trend Q&A",
            period: "By monthly plan",
            low: "Premium: $8+",
            mid: "Premium+: $40+",
            high: "Large regional variation",
            community: "Strong in social-media contexts, but serious research still benefits from citation-first tools.",
          },
          {
            scope: "Grok usage limits",
            period: "By account",
            low: "Premium: increased limits",
            mid: "Premium+: highest limits",
            high: "Subject to X policy changes",
            community: "Subscription value depends heavily on whether you are already a heavy X user.",
          },
        ],
      };
    }

    if (vendor.id === "perplexity") {
      return {
        ...vendor,
        maintenanceTip:
          "Perplexity help-center access is inconsistent, so the page is maintained mainly through manual review plus browser-assisted verification.",
        officialRate:
          "Perplexity emphasizes deep search, citations, connectors, and enterprise capability more than fixed chat counts.",
        communityRate:
          "Most users care most about search depth, citation reliability, and whether it actually saves time on research reports.",
        plans: [
          {
            name: "Perplexity Pro",
            price: "$20 / month",
            detail: "A strong personal tier for research, source collection, and frequent search.",
            features: [
              "Stronger search and answer quality",
              "Best for citation-heavy research",
              "Multi-model access",
              "Fits solo knowledge workflows",
            ],
          },
          {
            name: "Perplexity Max",
            price: "$200 / month",
            detail: "Built for heavier research and generation work rather than ordinary Q&A.",
            features: [
              "Higher research and generation ceilings",
              "Better for batch search and long reports",
              "Best for heavy solo research",
            ],
          },
          {
            name: "Enterprise Pro",
            price: "$40 / seat / month",
            detail: "Focused on connectors, org governance, and team knowledge access.",
            features: [
              "Team seats and management",
              "Connectors and enterprise knowledge access",
              "Higher usage ceilings",
              "Org governance and security capabilities",
            ],
          },
        ],
        officialNotes: [
          "Perplexity's official framing is feature- and access-tier oriented: Pro, Max, Enterprise Pro, and Enterprise Max.",
          "Connector docs mention entry pricing for Pro, Max, Enterprise Pro, and Enterprise Max.",
          "The Enterprise FAQ publicly details seat pricing, annual discounts, and higher usage limits.",
        ],
        communityNotes: [
          "Perplexity is most valuable as a research entry layer, while many users still hand final long-form writing to Claude or ChatGPT.",
          "If your work is mostly link collection and fast fact gathering, Pro is often enough.",
          "Its value feels more like a time-saving research layer than a one-for-one replacement for every chat subscription.",
        ],
        quotaRows: [
          {
            scope: "Deep search / cited research",
            period: "By monthly plan",
            low: "Pro: $20",
            mid: "Max: $200",
            high: "Enterprise Pro: $40/seat",
            community: "The time saved on research reports is often the clearest value signal, especially for heavier teams.",
          },
          {
            scope: "Connectors and team knowledge",
            period: "By seat",
            low: "Personal plans: light connectors",
            mid: "Enterprise Pro: connectors",
            high: "Enterprise Max: higher ceilings",
            community: "When team knowledge is fragmented, connectors matter more than plain chat allowance.",
          },
        ],
      };
    }

    return vendor;
  });
}
