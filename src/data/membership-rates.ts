import { estimateCnyFromUsd, formatMoney } from "@/lib/format";

const updatedAt = "2026-05-11";

export const membershipRateSources = {
  officialCodexPricing:
    "https://developers.openai.com/codex/pricing?codex-usage-limits=business&codex-pricing-plans=business-enterprise",
  chatgptPricing: "https://openai.com/chatgpt/pricing/",
  anthropicPricing: "https://www.anthropic.com/pricing#subscriptions",
  googleAiPlans: "https://one.google.com/about/google-ai-plans/",
  cursorPricing: "https://cursor.com/pricing",
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
    id: "plus",
    name: "ChatGPT Plus",
    priceUsd: 20,
    audience: "个人入门",
    summary: "适合轻度验证、短回合本地编码和偶发云任务。",
    note: "OpenAI 官方帮助中心说明：Plus 在 2026-05-31 前提供约双倍的常规 Codex 使用量。",
  },
  {
    id: "pro-100",
    name: "ChatGPT Pro $100",
    priceUsd: 100,
    audience: "个人高频",
    summary: "适合日更编码、稳定仓库修复和频繁 code review。",
    note: "OpenAI 开发者文档当前列出了 $100 层级，对应更高的 5 小时和每周额度。",
  },
  {
    id: "pro-200",
    name: "ChatGPT Pro $200",
    priceUsd: 200,
    audience: "重度使用",
    summary: "面向持续高强度编码、复杂上下文和并行云任务。",
    note: "OpenAI 开发者文档注明此层级的提升额度有效期至 2026-05-31。",
  },
].map((plan) => ({
  ...plan,
  priceLabel: formatMoney(plan.priceUsd, "USD"),
  cnyEstimate: estimateCnyFromUsd(plan.priceUsd),
  updatedAt,
}));

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
    label: "OpenAI",
    title: "ChatGPT / Codex",
    priceLabel: "$20 / $100 / $200",
    officialRate: "官方公开了 5 小时、每周和 Business credits 三套口径。",
    communityRate: "重任务波动最大，但也是文档口径最透明的一家。",
    officialSource: membershipRateSources.officialCodexPricing,
    plans: [
      {
        name: "ChatGPT Plus",
        price: "$20 / month",
        detail: "轻度到中度个人使用，适合短任务、本地补丁和间歇式云任务。",
      },
      {
        name: "ChatGPT Pro $100",
        price: "$100 / month",
        detail: "高频个人编码，适合稳定 code review 和更长上下文任务。",
      },
      {
        name: "ChatGPT Pro $200",
        price: "$200 / month",
        detail: "重度并行工作流，额度提升最明显，但仍建议按任务复杂度估预算。",
      },
    ],
    officialNotes: [
      "帮助中心和开发者文档都写出了 Codex 在不同会员层级下的额度区间。",
      "Business / Enterprise 还会额外给出 credits per 1M tokens，方便团队预算。",
      "截至当前文档，部分高档位额度增强带有时间窗口说明。",
    ],
    communityNotes: [
      "多文件重构、长上下文和高推理模式，会比单文件修补更快触发 5 小时窗口上限。",
      "weekly 限额常常比单次 5 小时窗口更早成为连续高强度使用的瓶颈。",
      "短 PR review、局部 diff 和轻量问答更接近官方区间上沿。",
    ],
  },
  {
    id: "anthropic",
    label: "Claude",
    title: "Claude Pro / Max",
    priceLabel: "$20 / $100 / $200",
    officialRate: "官方以 5x / 20x usage 和 priority access 描述，不长期公开精确请求次数。",
    communityRate: "社区体感集中在高峰期稳定性、长会话容忍度和超长文档吞吐。",
    officialSource: membershipRateSources.anthropicPricing,
    plans: [
      {
        name: "Claude Pro",
        price: "$20 / month",
        detail: "官方写法是比免费版提供至少 5x 的 usage，偏向个人知识工作与写作。",
      },
      {
        name: "Claude Max 5x",
        price: "$100 / month",
        detail: "适合高频长会话，主要提升高峰时段的可用性和连续工作稳定度。",
      },
      {
        name: "Claude Max 20x",
        price: "$200 / month",
        detail: "面向超重度用户，强调更高使用上限，而不是公开的精确次数承诺。",
      },
    ],
    officialNotes: [
      "Anthropic 官方订阅页重点写的是 usage 等级差异，而不是统一的按小时/按周次数表。",
      "Max 的卖点主要是 5x / 20x 使用量和 priority access。",
      "对长文档、写作、研究和知识库型工作流更友好。",
    ],
    communityNotes: [
      "社区普遍认为 Max 的差别更多体现在高峰期和长会话连贯性，而不是普通问答速度。",
      "重度用户常把 Claude 作为长文起草和大文档总结主力，再用别家补代码任务。",
      "当连续跑大文档和多轮追问时，Pro 更容易提前碰到容量提示。",
    ],
  },
  {
    id: "google",
    label: "Gemini",
    title: "Google AI Plans",
    priceLabel: "Pro / Ultra",
    officialRate: "官方更常用功能权益和计划访问能力描述，公开次数口径相对少。",
    communityRate: "社区体感受 Deep Research、视频生成和长上下文功能影响很大。",
    officialSource: membershipRateSources.googleAiPlans,
    plans: [
      {
        name: "Google AI Pro",
        price: "官方计划页为准",
        detail: "主力订阅档，覆盖 Gemini 应用内高级模型和部分额外权益。",
      },
      {
        name: "Google AI Ultra",
        price: "官方计划页为准",
        detail: "更高档位，重点在更强模型访问权和更大的高阶功能配额。",
      },
    ],
    officialNotes: [
      "Google 官方计划页更强调功能覆盖、模型访问范围和附加权益。",
      "深度研究、视频与图像等重功能通常比基础聊天更吃配额。",
      "适合把 Gemini 当作多模态和 Google 生态协同入口来看，而不只是单次问答次数。",
    ],
    communityNotes: [
      "社区体感差异多出现在视频、研究报告和长时间会话，而基础问答差距没有那么明显。",
      "学生权益和组合权益往往比单纯速率更能决定是否划算。",
      "不少用户会把 Gemini 当作补充位，而不是唯一主力编码订阅。",
    ],
  },
  {
    id: "cursor",
    label: "Cursor",
    title: "Hobby / Pro / Business",
    priceLabel: "$0 / Pro / Business",
    officialRate: "官方围绕 Fast requests、agent 使用量和团队 seat 来定义体验。",
    communityRate: "社区最关注的是 agent 耗量、排队体感和高峰期是否降速。",
    officialSource: membershipRateSources.cursorPricing,
    plans: [
      {
        name: "Hobby",
        price: "$0 / month",
        detail: "适合试用补全和少量 agent 请求，主要判断编辑器工作流是否匹配自己。",
      },
      {
        name: "Pro",
        price: "官方价格页为准",
        detail: "主力个人档，适合日常写代码、修 bug 和中等频率 agent 使用。",
      },
      {
        name: "Business",
        price: "官方价格页为准",
        detail: "更偏团队 seat、管理和更稳定的组织级工作流，而不是简单加倍次数。",
      },
    ],
    officialNotes: [
      "Cursor 官方写法更靠近 IDE 体验：快速请求、agent 使用和团队功能，而不是单模型配额表。",
      "是否值回票价，通常取决于你的 agent 占比，而不是纯聊天次数。",
      "如果主要是补全和轻修复，免费档到 Pro 的感知差距最明显。",
    ],
    communityNotes: [
      "社区常把 Cursor 的体感归结为高峰排队、agent 速度和大仓库多文件改动时的稳定度。",
      "重度 agent 用户普遍更在意 fast quota 而不是单次补全速度。",
      "如果把 Cursor 当主力 IDE，月度额度和排队体验会比单次价格更关键。",
    ],
  },
] as const;
