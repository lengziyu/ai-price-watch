import { estimateCnyFromUsd, formatMoney } from "@/lib/format";

const updatedAt = "2026-05-14";
export const membershipRatesUpdatedAt = updatedAt;

export const membershipRateSources = {
  officialCodexPricing:
    "https://developers.openai.com/codex/pricing?codex-usage-limits=business&codex-pricing-plans=business-enterprise",
  chatgptPricing: "https://chatgpt.com/zh-Hans-CN/pricing/",
  anthropicPricing: "https://claude.com/pricing",
  googleAiPlans: "https://gemini.google/us/subscriptions/?hl=en",
  cursorPricing: "https://cursor.com/cn/pricing",
  githubCopilotPlans: "https://github.com/features/copilot/plans",
  githubCopilotBilling:
    "https://docs.github.com/copilot/reference/copilot-billing/models-and-pricing",
  deepseekPricing: "https://api-docs.deepseek.com/zh-cn/quick_start/pricing",
  xPremium: "https://help.x.com/en/using-x/x-premium",
  xPremiumPlusPricing: "https://help.x.com/en/premium-plus-price-update",
  perplexityPro: "https://www.perplexity.ai/properks/",
  perplexityEnterprise:
    "https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions",
  perplexityConnector:
    "https://www.perplexity.ai/help-center/en/articles/12167980-using-the-connector-for-slack",
  helpArticle:
    "https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/",
  communityThreads: [
    {
      label: "Reddit: Codex heavy tasks burn Plus quota faster than expected",
      url: "https://www.reddit.com/r/ChatGPT/comments/1k6v6p2/codex_usage_limits_are_way_too_low/",
    },
    {
      label: "Reddit: Pro users comparing effective 5h windows on real repos",
      url: "https://www.reddit.com/r/OpenAI/comments/1k6r7d7/codex_pro_limits_in_real_projects/",
    },
    {
      label: "GitHub issue: small edits still consume quota because complexity matters",
      url: "https://github.com/openai/codex/issues/13186",
    },
  ],
};

export const membershipPlans = [
  {
    id: "free",
    name: "免费版",
    priceUsd: 0,
    audience: "日常试用",
    summary: "日常任务的智能解决方案，适合先验证模型和功能入口。",
    note: "官方价格页把免费版定位为受限入口，消息、上传、图像生成、深度研究、记忆和 Codex 都有使用限制。",
    features: [
      "有限的 GPT-5.5 Instant 使用权限",
      "消息和上传数量受限",
      "图像生成受限，速度较慢",
      "有限使用深度研究",
      "记忆与上下文支持受限",
      "Codex 有限使用",
    ],
  },
  {
    id: "go",
    name: "Go",
    priceLabel: "$8",
    audience: "更高基础额度",
    summary: "比免费版更适合连续聊天、上传和图片生成。",
    note: "按当前口径展示为 $8 档位，页面权益重点是比免费版更高的基础额度。",
    features: [
      "免费套餐中的全部内容",
      "更多 GPT-5.5 Instant 使用权限",
      "更高的消息额度",
      "更高的上传额度",
      "更高的图片生成额度",
      "更长的记忆",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    priceUsd: 20,
    audience: "个人主力",
    summary: "适合日常高频使用、短回合本地编码和间歇式云任务。",
    note: "OpenAI 官方帮助中心说明：Plus 在 2026-05-31 前提供约双倍的常规 Codex 使用量。",
    features: [
      "Go 中的全部内容",
      "GPT-5.5 Thinking 高级推理能力",
      "更高的消息与上传配额",
      "更复杂、更精准的图像生成",
      "深入研究和智能体模式配额更高",
      "项目、任务和自定义 GPT",
      "更高的 Codex 使用量",
    ],
  },
  {
    id: "pro",
    name: "Pro 5x",
    priceLabel: "$100",
    audience: "重度个人",
    summary: "面向更高配额、专业推理和更大的 Codex 任务量。",
    note: "按 Pro 5x 口径展示为 $100 档位。",
    features: [
      "Plus 中的全部内容",
      "约 5 倍使用配额",
      "约 10 倍 Codex 配额",
      "GPT-5.5 Pro 专业推理能力",
      "Codex 最大任务量",
      "GPT-5.3 及文件上传不设限",
      "无限制且更快速的图像生成",
    ],
  },
  {
    id: "pro-20x",
    name: "Pro 20x",
    priceLabel: "$200",
    audience: "超重度个人",
    summary: "面向最高强度的个人工作流，适合高并发与超长会话场景。",
    note: "按 Pro 20x 口径展示为 $200 档位。",
    features: [
      "Pro 5x 中的全部内容",
      "约 20 倍使用配额",
      "约 20 倍 Codex 配额",
      "更适合连续高强度任务",
      "重度多任务并行更稳",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceLabel: "$25 / seat",
    audience: "团队协作",
    summary: "安全协作工作空间，适合团队成员、应用连接和统一管理。",
    note: "按每席位 $25 口径展示；Codex 企业部分还提供 credits 计费口径。",
    features: [
      "ChatGPT Plus 与 Business Codex 套餐能力",
      "工作场景顶级模型",
      "60 多款应用连接",
      "共享项目和自定义工作空间 GPT",
      "成员、角色和账单管理",
      "SAML SSO / MFA 等关键控制",
      "业务数据默认不用于训练",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "联系销售",
    cnyEstimate: null,
    audience: "大规模组织",
    summary: "企业级安全、控制、支持和自定义商务条款。",
    note: "适合需要数据驻留、高级合规、SLA、发票账单和批量折扣的组织。",
    features: [
      "扩展版上下文窗口",
      "SCIM、EKM、用户分析与域验证",
      "自定义数据保留策略",
      "静态与传输过程加密",
      "十个地区支持数据驻留",
      "7x24 优先支持和 SLA",
    ],
  },
].map((plan) => {
  const priceLabel = "priceLabel" in plan ? plan.priceLabel : formatMoney(plan.priceUsd, "USD");
  const cnyEstimate =
    "cnyEstimate" in plan
      ? plan.cnyEstimate
      : "priceUsd" in plan
        ? estimateCnyFromUsd(plan.priceUsd)
        : null;

  return {
    ...plan,
    priceLabel,
    cnyEstimate,
    updatedAt,
  };
});

export const membershipQuotaRows = [
  {
    scope: "GPT-5.5 本地编码任务",
    period: "每 5 小时",
    plus: "15 - 80 次",
    pro100: "80 - 400 次",
    pro200: "300 - 1600 次",
    community:
      "轻任务更容易接近区间上沿；多文件重构、长上下文或高推理经常更靠近下沿。",
  },
  {
    scope: "GPT-5.4 本地编码任务",
    period: "每 5 小时",
    plus: "20 - 100 次",
    pro100: "100 - 500 次",
    pro200: "400 - 2000 次",
    community:
      "中等仓库修复一般比 GPT-5.5 更耐用，但连续大补丁仍会明显压缩窗口。",
  },
  {
    scope: "GPT-5.4 mini 本地编码任务",
    period: "每 5 小时",
    plus: "60 - 350 次",
    pro100: "300 - 1750 次",
    pro200: "1200 - 7000 次",
    community:
      "轻量问答、改注释和小范围 diff 最接近上限；适合作为省额度的日常默认档。",
  },
  {
    scope: "GPT-5.3-Codex 本地编码任务",
    period: "每 5 小时",
    plus: "30 - 150 次",
    pro100: "150 - 750 次",
    pro200: "600 - 3000 次",
    community:
      "不少用户反馈它在老仓库修修补补时更稳，但遇到长链路问题依然会掉到区间中下段。",
  },
  {
    scope: "GPT-5.3-Codex 云任务",
    period: "每周",
    plus: "10 - 60 次",
    pro100: "50 - 300 次",
    pro200: "200 - 1200 次",
    community:
      "云任务最受上下文长度和执行时长影响；并行跑多个长任务时，实际可用次数通常比理论上限少。",
  },
  {
    scope: "GPT-5.3-Codex code review",
    period: "每周",
    plus: "20 - 50 次",
    pro100: "100 - 250 次",
    pro200: "400 - 1000 次",
    community:
      "短 PR 审查比较接近官方区间；大型 PR、跨目录 diff 和反复追问更容易耗尽配额。",
  },
].map((row) => ({ ...row, updatedAt }));

export const businessCreditRows = [
  {
    model: "GPT-5.5",
    input: "125 credits",
    cachedInput: "12.50 credits",
    output: "750 credits",
  },
  {
    model: "GPT-5.4",
    input: "62.50 credits",
    cachedInput: "6.250 credits",
    output: "375 credits",
  },
  {
    model: "GPT-5.4 mini",
    input: "18.75 credits",
    cachedInput: "1.875 credits",
    output: "113 credits",
  },
  {
    model: "GPT-5.3-Codex",
    input: "43.75 credits",
    cachedInput: "4.375 credits",
    output: "350 credits",
  },
  {
    model: "GPT-5.2",
    input: "43.75 credits",
    cachedInput: "4.375 credits",
    output: "350 credits",
  },
  {
    model: "GPT-Image-2 (image)",
    input: "200 credits",
    cachedInput: "50 credits",
    output: "750 credits",
  },
  {
    model: "GPT-Image-2 (text)",
    input: "125 credits",
    cachedInput: "31.25 credits",
    output: "250 credits",
  },
].map((row) => ({ ...row, updatedAt }));

export const communityObservations = [
  {
    title: "短任务更接近官方上沿",
    detail:
      "单文件修补、提测前检查和小范围改文案，通常比多轮重构更接近 OpenAI 给出的理论上限。",
  },
  {
    title: "复杂仓库会明显压低有效次数",
    detail:
      "多文件 diff、长上下文、反复追问和高推理模式，都会让同一 5 小时窗口里的可用任务数更少。",
  },
  {
    title: "云任务和 code review 的波动最大",
    detail:
      "这两类最受上下文体积、执行时长和并发影响，社区样本普遍建议把它们按官方区间的中位数来估预算。",
  },
];

export const communitySnapshots = [
  {
    title: "Plus 用户在重任务里 20 分钟烧掉约 75% 的 5 小时窗口",
    date: "2026-04-11",
    takeaway:
      "公开样本普遍反映：多文件重构、长上下文和高推理模式，会让 Plus 的可用窗口远低于官方上限。",
    source:
      "https://www.reddit.com/r/codex/comments/1sgzy01/codex_on_chatgpt_plus_burned_75_of_5h_in_20_mins/",
  },
  {
    title: "有用户观察到 weekly 与 5h 大约呈 2:1 消耗关系",
    date: "2026-03-11",
    takeaway:
      "这说明就算单次 5 小时窗口没彻底用满，连续高强度编码也可能更早碰到 weekly 限制。",
    source:
      "https://www.reddit.com/r/codex/comments/1rp145k/whats_the_ratio_youre_getting_between_5hweekly/",
  },
  {
    title: "轻量日常工作流有人一周结束还能剩 10% 到 20% weekly",
    date: "2026-04-12",
    takeaway:
      "如果主要做短问答、局部修补和 code review，Plus 或低档 Pro 的体感会明显好于重仓库场景。",
    source:
      "https://www.reddit.com/r/codex/comments/1sjn723/updates_to_codex_usage_on_plus/",
  },
];

export const membershipVendorBoards = [
  {
    id: "openai",
    label: "ChatGPT",
    title: "ChatGPT Plans",
    priceLabel: "$0 / $8 / $20 / $100 / $200 / $25 seat",
    collectionMode: "browser_assisted",
    maintenanceTip:
      "ChatGPT 价格页可读到套餐权益；Codex 定价页提供更细的 5 小时、每周和 Business credits 口径。",
    officialRate: "官方公开了套餐权益、会员层级、Codex 使用窗口和 Business credits。",
    communityRate: "重任务波动最大，但文档口径最透明，适合做基准页。",
    officialSource: membershipRateSources.chatgptPricing,
    plans: membershipPlans.map((plan) => ({
      name: plan.name,
      price: plan.priceLabel,
      detail: plan.summary,
      features: plan.features,
    })),
    officialNotes: [
      "ChatGPT pricing 页面列出 Free、Go、Plus、Pro、Business 和 Enterprise 的功能权益。",
      "Codex 开发者文档写出了不同会员层级下的额度区间。",
      "Business / Enterprise 还会额外给出 credits per 1M tokens，方便团队预算。",
    ],
    communityNotes: [
      "多文件重构、长上下文和高推理模式，会比单文件修补更快触发 5 小时窗口上限。",
      "weekly 限额常常比单次 5 小时窗口更早成为连续高强度使用的瓶颈。",
      "短 PR review、局部 diff 和轻量问答更接近官方区间上沿。",
    ],
    quotaRows: membershipQuotaRows.map((row) => ({
      scope: row.scope,
      period: row.period,
      low: row.plus,
      mid: row.pro100,
      high: row.pro200,
      community: row.community,
    })),
  },
  {
    id: "anthropic",
    label: "Claude",
    title: "Claude Plans",
    priceLabel: "$0 / $20 / $100 / $200",
    collectionMode: "public_html",
    maintenanceTip:
      "Claude pricing 页面可读到个人、团队与 API 定价；订阅速率更适合用 usage multiplier 和社区体感补齐。",
    officialRate: "官方公开 Free、Pro、Max 与 Team 价格，同时 API 区域公开 MTok 输入/输出价格。",
    communityRate: "社区体感集中在高峰期稳定性、长会话容忍度和超长文档吞吐。",
    officialSource: membershipRateSources.anthropicPricing,
    plans: [
      {
        name: "Free",
        price: "$0 / month",
        detail: "适合试用 Claude 基础聊天、写作和文档问答。",
        features: [
          "基础 Claude 对话入口",
          "有限消息额度",
          "网页和移动端使用",
          "适合低频写作和总结",
        ],
      },
      {
        name: "Pro",
        price: "$20 / month",
        detail: "个人主力档，适合长文本理解、写作辅助和研究整理。",
        features: [
          "比免费版更高 usage",
          "更稳定的高峰期访问",
          "适合长文档理解与写作",
          "可作为研究和总结主力",
        ],
      },
      {
        name: "Max 5x",
        price: "$100 / month",
        detail: "面向高频长会话，比 Pro 更适合连续文档和多轮分析。",
        features: [
          "约 Pro 的 5 倍使用量",
          "高峰期更稳",
          "长会话和复杂分析更耐用",
          "适合重度个人知识工作流",
        ],
      },
      {
        name: "Max 20x",
        price: "$200 / month",
        detail: "超重度个人档，重点是更高使用上限而非公开精确次数。",
        features: [
          "约 Pro 的 20 倍使用量",
          "更适合连续高强度会话",
          "重文档和批量总结余量更大",
          "适合把 Claude 当主力工作台",
        ],
      },
      {
        name: "Team",
        price: "$20 / seat / month 起",
        detail: "官方年付标准席位 $20，月付 $25；适合 5 到 150 人团队。",
        features: [
          "团队席位和集中计费",
          "标准席位包含更多 usage",
          "Premium seat 可到 5x usage",
          "更适合可预测成本的组织",
        ],
      },
    ],
    officialNotes: [
      "Claude 官方订阅页重点写的是 usage 等级差异，而不是统一的按小时/按周次数表。",
      "Team 标准席位为 $20/seat/月年付，月付 $25；Premium seat 年付 $100、月付 $125。",
      "API 区域公开了 Opus / Sonnet 的输入、输出和 prompt cache 价格。",
    ],
    communityNotes: [
      "Max 的差别更多体现在高峰期、长会话连贯性和大文档吞吐。",
      "重度用户常把 Claude 作为长文起草和大文档总结主力，再用别家补代码任务。",
      "当连续跑大文档和多轮追问时，Pro 更容易提前碰到容量提示。",
    ],
    quotaRows: [
      {
        scope: "订阅使用层级",
        period: "按月",
        low: "Pro: 比免费版更多",
        mid: "Max 5x: 约 Pro 5 倍",
        high: "Max 20x: 约 Pro 20 倍",
        community: "长文档和连续多轮分析最能体现 Max 档位差异。",
      },
      {
        scope: "Team 席位",
        period: "按席位/月",
        low: "Standard: $20 年付",
        mid: "Standard: $25 月付",
        high: "Premium: $100 年付 / $125 月付",
        community: "团队场景重点是可预测成本和席位管理，而不是单纯个人次数。",
      },
      {
        scope: "API 参考价格",
        period: "每 MTok",
        low: "Sonnet 4.5: $3 输入 / $15 输出",
        mid: "Opus 4.6: $5 输入 / $25 输出",
        high: "Prompt cache read $0.30 - $0.50",
        community: "API 价格适合预算参考，订阅会员的实际消息上限仍以页面和账户提示为准。",
      },
    ],
  },
  {
    id: "google",
    label: "Gemini",
    title: "Google AI Plans",
    priceLabel: "$0 / $7.99 / $19.99 / $249.99",
    collectionMode: "public_html",
    maintenanceTip:
      "Google One 原入口有时需要地区跳转；Gemini subscriptions 页面可读到 Free、AI Plus、AI Pro 和 AI Ultra。",
    officialRate: "官方以模型访问、生态权益、存储和高阶功能限制来描述套餐。",
    communityRate: "体感差异主要来自 Deep Research、视频生成、NotebookLM、编码代理和长上下文。",
    officialSource: membershipRateSources.googleAiPlans,
    plans: [
      {
        name: "Free",
        price: "$0 / month",
        detail: "带 Google Account 的基础 Gemini 入口。",
        features: [
          "Access to Gemini 3 Flash",
          "Varying access to Gemini 3.1 Pro",
          "图像生成和编辑",
          "Deep Research、Gemini Live、Canvas、Gems",
          "15GB Google 存储",
        ],
      },
      {
        name: "Google AI Plus",
        price: "$7.99 / month",
        detail: "提高 Gemini、NotebookLM、Flow 和 Google 应用内 AI 访问。",
        features: [
          "Free 的全部内容",
          "增强访问 3.1 Pro 和 Nano Banana Pro",
          "有限访问 Veo 3.1 Lite",
          "NotebookLM 更多 Audio Overviews 和 notebooks",
          "Gmail、Vids 等 Google 应用内 Gemini",
          "200GB Google 存储",
        ],
      },
      {
        name: "Google AI Pro",
        price: "$19.99 / month",
        detail: "主力个人档，面向更高模型、研究、视频、编码和 Workspace 权益。",
        features: [
          "更高访问 3.1 Pro、Deep Research、Nano Banana Pro",
          "Veo 3.1 Lite 视频生成",
          "Jules 异步编码代理更高限额",
          "Gemini CLI / Code Assist 更高日请求",
          "Google Antigravity 更高速率",
          "NotebookLM 5x 更多权益",
          "5TB Google 存储",
        ],
      },
      {
        name: "Google AI Ultra",
        price: "$249.99 / month",
        detail: "最高访问等级，包含 Deep Think、Agent 和更大的生态权益。",
        features: [
          "Pro 的全部内容",
          "最高模型和功能限制",
          "Deep Think 和 Gemini Agent",
          "Veo 3.1 / Flow 最高访问",
          "Jules、CLI、Code Assist 最高日请求",
          "YouTube Premium 个人版",
          "30TB Google 存储",
        ],
      },
    ],
    officialNotes: [
      "Gemini 官方订阅页公开 Free、AI Plus、AI Pro 和 AI Ultra 的美元价格。",
      "Pro 当前页面写明 5TB 存储、NotebookLM 5x、Jules / Gemini CLI / Code Assist 更高限额。",
      "Ultra 当前页面写明 30TB 存储、Deep Think / Agent、YouTube Premium 与最高访问等级。",
    ],
    communityNotes: [
      "视频、研究报告、NotebookLM 和编码代理更容易拉开 Plus/Pro/Ultra 的差距。",
      "基础聊天差距没有高阶多模态、Workspace 和开发工具链那么明显。",
      "Google 订阅价值很大一部分来自生态权益，不适合只按聊天次数比较。",
    ],
    quotaRows: [
      {
        scope: "Gemini app / 高级模型",
        period: "按月",
        low: "Free: 3 Flash + 变化的 3.1 Pro",
        mid: "Pro: 更高 3.1 Pro + Deep Research",
        high: "Ultra: Deep Think + Agent + 最高限制",
        community: "复杂研究、长文档和多模态任务更能体现高档位差距。",
      },
      {
        scope: "开发工具链",
        period: "按日/按功能",
        low: "Plus: 基础生态增强",
        mid: "Pro: Jules / CLI / Code Assist 更高限额",
        high: "Ultra: 最高日请求和 Antigravity 速率",
        community: "编码代理额度是否有价值，取决于是否真的使用 Google 的开发工作台。",
      },
      {
        scope: "生态权益与存储",
        period: "按月",
        low: "Free: 15GB / Plus: 200GB",
        mid: "Pro: 5TB + Workspace Gemini",
        high: "Ultra: 30TB + YouTube Premium",
        community: "如果本来就买 Google One 或 YouTube Premium，Ultra 的有效价值会被生态权益改变。",
      },
    ],
  },
  {
    id: "cursor",
    label: "Cursor",
    title: "Cursor Plans",
    priceLabel: "$0 / $20 / $40",
    collectionMode: "public_html",
    maintenanceTip:
      "Cursor 中文定价页公开且结构清晰，Hobby、个人、团队和企业都能抓到主要权益。",
    officialRate: "官方围绕智能体请求、Tab 补全、前沿模型、MCP、技能、钩子和团队治理来定义体验。",
    communityRate: "社区最关注 agent 耗量、排队体感和高峰期是否降速。",
    officialSource: membershipRateSources.cursorPricing,
    plans: [
      {
        name: "Hobby",
        price: "免费",
        detail: "无需信用卡，适合试用编辑器、Tab 补全和有限智能体请求。",
        features: [
          "无需信用卡",
          "有限智能体请求次数",
          "有限 Tab 补全次数",
          "适合验证 IDE 工作流",
        ],
      },
      {
        name: "Pro",
        price: "$20 / mo.",
        detail: "主力个人档，覆盖日常编码、修 bug 和中频智能体使用。",
        features: [
          "Hobby 的全部内容",
          "智能体扩展限额",
          "访问前沿模型",
          "MCP、技能和钩子",
          "云端智能体",
          "按用量计费的 Bugbot",
        ],
      },
      {
        name: "Teams",
        price: "$40 / user / mo.",
        detail: "团队共享上下文、规则、安全审查和统一管理。",
        features: [
          "个人版全部内容",
          "支持团队共享上下文的云端智能体",
          "团队级规则、技能和自动化",
          "安全审查智能体",
          "SAML/OIDC SSO + 团队级隐私模式",
          "用量分析和统一计费",
        ],
      },
      {
        name: "Enterprise",
        price: "定制版",
        detail: "发票、共享用量池、SCIM、审计日志和更细管理员控制。",
        features: [
          "团队版全部功能",
          "共享用量池",
          "发票/采购订单计费",
          "SCIM 席位管理",
          "AI 代码跟踪 API 和审计日志",
          "细粒度管理员和模型控制",
          "优先支持和客户成功管理",
        ],
      },
    ],
    officialNotes: [
      "Cursor 官方写法更靠近 IDE 体验：智能体、Tab、云端 agent、MCP、技能和团队治理。",
      "按用量计费会在包含额度用尽后继续提供模型用量。",
      "团队和企业档主要提升共享上下文、安全治理和集中管理。",
    ],
    communityNotes: [
      "高峰排队、agent 速度和大仓库多文件改动稳定度，是社区最常讨论的体感指标。",
      "重度 agent 用户普遍更在意 fast quota，而不是单次补全速度。",
      "如果把 Cursor 当主力 IDE，月度额度和排队体验会比单次价格更关键。",
    ],
    quotaRows: [
      {
        scope: "智能体请求",
        period: "按月套餐",
        low: "Hobby: 有限请求",
        mid: "Pro: 扩展限额",
        high: "Teams/Enterprise: 团队共享与治理",
        community: "大仓库多文件改动时，Pro 到团队档的差距比普通补全更明显。",
      },
      {
        scope: "模型与工作流能力",
        period: "按功能",
        low: "Hobby: 基础 Tab / agent",
        mid: "Pro: 前沿模型 + MCP + 云端 agent",
        high: "Enterprise: 模型控制 + 审计 + 共享池",
        community: "是否值回票价，通常取决于 agent 占比而不是纯聊天次数。",
      },
    ],
  },
  {
    id: "github",
    label: "GitHub",
    title: "GitHub Copilot",
    priceLabel: "$0 / $10 / $39 / seat",
    collectionMode: "public_html",
    maintenanceTip:
      "GitHub 的 plans 与 billing 文档都能公开抓取，适合持续扩到 Business / Enterprise 层。",
    officialRate: "官方公开 Free、Pro、Pro+ 的 premium requests，并说明 chat、agent、review、CLI 的消耗口径。",
    communityRate: "社区最在意免费档够不够试、Pro requests 是否够用，以及大仓库审查时的流畅度。",
    officialSource: membershipRateSources.githubCopilotPlans,
    plans: [
      {
        name: "Copilot Free",
        price: "$0 / month",
        detail: "适合先试 GitHub 与 IDE 内 Copilot 工作流。",
        features: [
          "2,000 completions / month",
          "50 chat requests / month",
          "50 premium requests / month",
          "支持 CLI、coding agent 和本地/GitHub 代码改动入口",
        ],
      },
      {
        name: "Copilot Pro",
        price: "$10 / month",
        detail: "个人主力档，适合日常补全、chat、agent mode 和 code review。",
        features: [
          "300 premium requests / month",
          "无限 GPT-5 mini 等基础交互",
          "包含 MCP servers",
          "自定义指令与 agents",
          "代码审查、agent mode 和 Copilot CLI",
        ],
      },
      {
        name: "Copilot Pro+",
        price: "$39 / month",
        detail: "高频 agent 和高级模型用户更适合的个人高档。",
        features: [
          "1,500 premium requests / month",
          "可按 $0.04/request 追加 premium requests",
          "更多高级模型访问",
          "适合高频 cloud agent 和 code review",
        ],
      },
      {
        name: "Business",
        price: "$19 / user / month",
        detail: "组织 seat、策略、管理和企业平台集成。",
        features: [
          "Pro 能力 + 组织管理",
          "企业策略与访问控制",
          "集中账单和许可证管理",
          "适合团队标准化 IDE / GitHub 体验",
        ],
      },
      {
        name: "Enterprise",
        price: "$39 / user / month",
        detail: "更完整的平台治理、企业安全和知识库集成。",
        features: [
          "Business 能力 + 企业级功能",
          "更强组织治理和策略",
          "GitHub 平台集成更完整",
          "适合大规模工程组织",
        ],
      },
    ],
    officialNotes: [
      "GitHub 官方价格页写明 Free 为 2,000 completions 与 50 chat requests。",
      "当前页面公开 Free / Pro / Pro+ 分别为 50 / 300 / 1,500 premium requests。",
      "Business / Enterprise 的重点更多在组织管理、策略和 GitHub 平台集成。",
    ],
    communityNotes: [
      "如果主要用 inline suggestions，Free 到 Pro 的差异通常比 Pro 到 Pro+ 更明显。",
      "高频 code review、cloud agent 和跨仓库工作流更容易碰 premium requests 上限。",
      "把 Copilot 放在 GitHub 平台和 IDE 两边一起用时，主观价值会比只在编辑器内更高。",
    ],
    quotaRows: [
      {
        scope: "Completions / Chat",
        period: "按月",
        low: "Free: 2,000 completions + 50 chat",
        mid: "Pro: 常规建议更宽松",
        high: "Pro+: 高频个人更稳",
        community: "从 Free 到 Pro 的体感提升通常最大。",
      },
      {
        scope: "Premium requests",
        period: "按月",
        low: "Free: 50",
        mid: "Pro: 300",
        high: "Pro+: 1,500",
        community: "Chat、agent mode、code review、cloud agent 和 Copilot CLI 都会消耗 premium requests。",
      },
      {
        scope: "团队治理",
        period: "按席位/月",
        low: "个人档: 无组织管理",
        mid: "Business: $19/user",
        high: "Enterprise: $39/user",
        community: "企业档是否划算主要看策略、许可证和平台治理需求。",
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    title: "DeepSeek API",
    priceLabel: "¥0.02 / ¥1 / ¥2 起",
    collectionMode: "public_html",
    maintenanceTip:
      "DeepSeek API docs 是结构化中文文档，模型、价格、上下文和扣费规则都适合直接抓取。",
    officialRate: "官方按百万 tokens 计价，公开 deepseek-v4-flash 与 deepseek-v4-pro 的输入/输出价格。",
    communityRate: "社区更关心长上下文成本、缓存命中率和 Pro 折扣期结束后的价格变化。",
    officialSource: membershipRateSources.deepseekPricing,
    plans: [
      {
        name: "deepseek-v4-flash",
        price: "¥0.02 / ¥1 / ¥2",
        detail: "缓存命中输入 / 缓存未命中输入 / 输出，单位均为百万 tokens。",
        features: [
          "OpenAI 格式 Base URL",
          "Anthropic 格式 Base URL",
          "支持非思考与思考模式",
          "1M 上下文长度",
          "最大 384K 输出长度",
          "支持 JSON Output 和 Tool Calls",
          "FIM 补全仅非思考模式支持",
        ],
      },
      {
        name: "deepseek-v4-pro",
        price: "¥0.025 / ¥3 / ¥6",
        detail: "当前 2.5 折优惠价，原价分别为 ¥0.1 / ¥12 / ¥24 每百万 tokens。",
        features: [
          "DeepSeek-V4-Pro 模型版本",
          "支持思考模式",
          "1M 上下文长度",
          "最大 384K 输出长度",
          "支持 JSON Output 和 Tool Calls",
          "当前优惠期到 2026-05-31 23:59",
        ],
      },
      {
        name: "扣费规则",
        price: "按量扣费",
        detail: "token 消耗量乘以模型单价，从赠送余额或充值余额扣减。",
        features: [
          "优先扣减赠送余额",
          "充值余额和赠送余额可并存",
          "定期查看页面确认价格变化",
          "更适合 API 成本预算，不是订阅会员",
        ],
      },
    ],
    officialNotes: [
      "DeepSeek 官方文档说明价格以百万 tokens 为单位。",
      "deepseek-chat 与 deepseek-reasoner 未来会弃用，当前分别对应 v4-flash 的非思考与思考模式。",
      "v4-pro 当前 2.5 折优惠期延长至北京时间 2026-05-31 23:59。",
    ],
    communityNotes: [
      "DeepSeek 更像 API 成本页，适合和订阅会员分开看预算。",
      "长上下文任务是否划算，很大程度取决于缓存命中率。",
      "Pro 折扣期之后需要重新复核价格，否则预算会偏乐观。",
    ],
    quotaRows: [
      {
        scope: "模型上下文",
        period: "每次请求",
        low: "Flash: 1M context",
        mid: "Pro: 1M context",
        high: "最大输出 384K",
        community: "长上下文是成本优势点，但输出长度和缓存命中会显著改变账单。",
      },
      {
        scope: "百万 tokens 价格",
        period: "按量计费",
        low: "Flash: ¥0.02 / ¥1 / ¥2",
        mid: "Pro 优惠: ¥0.025 / ¥3 / ¥6",
        high: "Pro 原价: ¥0.1 / ¥12 / ¥24",
        community: "优惠期结束后，Pro 成本可能需要按原价重新评估。",
      },
      {
        scope: "功能支持",
        period: "按模型",
        low: "JSON Output / Tool Calls",
        mid: "FIM 非思考模式支持",
        high: "OpenAI + Anthropic 两种 Base URL",
        community: "迁移成本低，但仍建议独立监控模型行为和缓存命中率。",
      },
    ],
  },
  {
    id: "grok",
    label: "Grok",
    title: "X Premium / Premium+",
    priceLabel: "$8 / $40+",
    collectionMode: "browser_assisted",
    maintenanceTip:
      "X 的帮助页容易返回 403，建议通过浏览器辅助读取后在后台补录摘要，不要只依赖服务端抓取。",
    officialRate: "官方把 Grok 放在 X Premium 体系里，Premium 提供更高使用上限，Premium+ 提供最高限制。",
    communityRate: "社区通常把 Grok 当作热点和社媒语境强项，而不是最稳的长文编码主力。",
    officialSource: membershipRateSources.xPremium,
    plans: [
      {
        name: "X Premium",
        price: "starts at $8 / month",
        detail: "提供更高 Grok 使用上限，适合轻到中度实时问答。",
        features: [
          "X 会员权益包",
          "Grok increased usage limits",
          "适合热点和社媒语境",
          "价格因地区变化",
        ],
      },
      {
        name: "X Premium+",
        price: "starts at $40 / month",
        detail: "提供更高 Grok 限额，面向更高频实时问答和热点跟进。",
        features: [
          "Premium 的全部权益",
          "更高 Grok 使用限制",
          "更适合重度 X 用户",
          "地区本地化价格",
        ],
      },
    ],
    officialNotes: [
      "X 官方帮助中心明确写出 Premium 与 Premium+ 对 Grok 的限额差异。",
      "Premium+ 价格页还给出了多个国家的本地化月费与年费。",
      "这类订阅本质上是 X 会员权益包，Grok 是其中最核心的 AI 增值功能之一。",
    ],
    communityNotes: [
      "Grok 的优势更多体现在热点、社媒语境和实时趋势，而不是纯长文严肃推理。",
      "如果你已经是 X 重度用户，订阅带来的整体收益通常高于单看 AI 次数。",
      "拿 Grok 做研究时，最好和引用型工具交叉验证，避免把它当唯一事实源。",
    ],
    quotaRows: [
      {
        scope: "实时热点问答",
        period: "按月套餐",
        low: "Premium: $8+",
        mid: "Premium+: $40+",
        high: "地区价差异较大",
        community: "社媒场景优势明显，但严肃研究建议与引用型工具交叉验证。",
      },
      {
        scope: "Grok 使用上限",
        period: "按账户",
        low: "Premium: increased limits",
        mid: "Premium+: highest limits",
        high: "随 X 规则变动",
        community: "订阅价值高度依赖你是否常驻 X 信息流。",
      },
    ],
  },
  {
    id: "perplexity",
    label: "Perplexity",
    title: "Perplexity Pro / Max / Enterprise",
    priceLabel: "$20 / $200 / Enterprise",
    collectionMode: "manual_review",
    maintenanceTip:
      "Perplexity 的帮助中心公开访问不稳定，当前以人工复核为主，并结合浏览器辅助采集。",
    officialRate: "官方更强调深度搜索、引用、连接器和 Enterprise 能力，而不是固定聊天次数。",
    communityRate: "社区最看重搜索深度、引用可靠性和做研究报告时能不能省时间。",
    officialSource: membershipRateSources.perplexityConnector,
    plans: [
      {
        name: "Perplexity Pro",
        price: "$20 / month",
        detail: "适合个人研究、查资料和高频搜索。",
        features: [
          "更高搜索和回答能力",
          "适合引用型研究",
          "多模型入口",
          "个人知识工作流",
        ],
      },
      {
        name: "Perplexity Max",
        price: "$200 / month",
        detail: "面向更重度的研究与生成需求，而不是普通问答。",
        features: [
          "更高研究与生成上限",
          "更适合批量搜索和长报告",
          "适合重度个人研究",
        ],
      },
      {
        name: "Enterprise Pro",
        price: "$40 / seat / month",
        detail: "企业档强调连接器、组织治理和团队内知识访问。",
        features: [
          "团队 seat 和管理",
          "连接器和企业知识访问",
          "更高使用上限",
          "组织治理和安全能力",
        ],
      },
    ],
    officialNotes: [
      "Perplexity 的官方说明更偏功能和访问层级，例如 Pro、Max、Enterprise Pro、Enterprise Max。",
      "连接器帮助页明确提到了 Pro、Max、Enterprise Pro、Enterprise Max 的入口价格。",
      "Enterprise FAQ 公开写出了 seat 价格、年付折扣和更高使用限制。",
    ],
    communityNotes: [
      "把 Perplexity 当研究入口最值，但长文最终整理很多人还是会交给 Claude 或 ChatGPT。",
      "如果你主要做链接搜集和快速 facts gathering，Pro 往往已经够用。",
      "Perplexity 的价值更像省时间的研究层，而不是单纯替代所有聊天订阅。",
    ],
    quotaRows: [
      {
        scope: "深度搜索 / 引用研究",
        period: "按月套餐",
        low: "Pro: $20",
        mid: "Max: $200",
        high: "Enterprise Pro: $40/seat",
        community: "做研究报告时节省时间效果明显，重度团队更看重企业档。",
      },
      {
        scope: "连接器与团队知识",
        period: "按席位",
        low: "个人档: 轻连接",
        mid: "Enterprise Pro: 连接器",
        high: "Enterprise Max: 更高上限",
        community: "团队资料分散时，连接器比单纯聊天额度更重要。",
      },
    ],
  },
] as const;
