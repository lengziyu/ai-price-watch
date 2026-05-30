import type { SiteLocale } from "@/lib/i18n";
import type { NavItem } from "@/types";

const navItemsByLocale: Record<SiteLocale, NavItem[]> = {
  "zh-CN": [
    { href: "/", label: "首页" },
    { href: "/pricing/tokens", label: "Token 比价" },
    { href: "/pricing/subscriptions", label: "会员订阅", badge: "hot" },
    { href: "/membership-rates", label: "会员速率", badge: "new" },
    { href: "/deals", label: "AI 优惠" },
    { href: "/use-cases", label: "使用场景" },
  ],
  en: [
    { href: "/", label: "Home" },
    { href: "/pricing/tokens", label: "Tokens" },
    { href: "/pricing/subscriptions", label: "Plans", badge: "hot" },
    { href: "/membership-rates", label: "Rates", badge: "new" },
    { href: "/deals", label: "Deals" },
    { href: "/use-cases", label: "Cases" },
  ],
};

const copyByLocale = {
  "zh-CN": {
    header: {
      openNavAriaLabel: "打开导航",
      sheetDescription: "统一按绿色浅色视觉系统浏览站内页面。",
      badgeText: {
        hot: "hot",
        new: "new",
      },
    },
    layout: {
      metadataTitleDefault: "雷价通 - AI 会员订阅、Token 成本与优惠速率追踪",
      metadataTitleTemplate: "%s | 雷价通",
      metadataDescription:
        "雷价通提供 ChatGPT、Claude、Gemini、DeepSeek 等大模型订阅价格、API Token 价格、会员速率、免费额度和 AI 优惠活动对比，帮助你低成本使用 AI。",
      metadataKeywords: [
        "AI比价",
        "大模型价格",
        "ChatGPT价格",
        "Claude价格",
        "Gemini价格",
        "Token价格",
        "AI羊毛",
        "AI优惠",
        "AI工具推荐",
      ],
      openGraphLocale: "zh_CN",
    },
    footer: {
      siblingProjectsTitle: "其他项目",
      maintenanceTitle: "公开价格持续维护",
      maintenanceDescription:
        "当前以公开来源、价格整理和复核时间为基础，帮助你快速判断不同方案的成本差异。",
      principlesLinkLabel: "查看数据原则",
      brandDescriptionSuffix: "当前以公开来源和复核记录为基础，持续维护关键价格与活动信息。",
      trustPrinciplesTitle: "数据原则",
      trustBullets: [
        "所有价格与活动都保留来源链接。",
        "每条数据都带最近复核时间，方便判断信息时效。",
        "价格可能随时间变化，请以官方页面为准。",
      ],
    },
    home: {
      heroPills: ["实时更新", "会员速率", "场景推荐", "优惠文章"],
      heroTitleLine1: "AI 会员价格",
      heroTitleLine2Left: "额度场景优惠",
      heroTitleLine2Right: "首页先看",
      heroDescriptionLine1: "首页集中看会员价格、额度、常用入口和最新活动，先完成第一轮筛选。",
      heroDescriptionLine2: "再进入你关心的厂商、套餐、工具页面，继续看详细对比。",
      compareButton: "开始对比",
      dealsButton: "查看优惠活动",
    },
    dealsPage: {
      metadataTitle: "AI 优惠活动",
      metadataDescription: "收录 AI 工具的免费额度、学生权益、试用入口与正规优惠活动。",
      heroNote: "官方活动 · 免费额度 · 学生权益",
      heroTitleLine1: "AI 优惠活动",
      heroTitleLine2Left: "正规渠道",
      heroTitleLine2Right: "一页看全",
      heroDescriptionLine1: "优先收录官方免费层、教育权益、地区价格差异与新用户福利，",
      heroDescriptionLine2: "不引导灰产代充，只保留可公开验证的入口。",
      viewArticles: "查看文章",
      browseTools: "浏览工具导航",
      tabArticles: "优惠文章",
      tabDeals: "免费优惠",
    },
    aboutPage: {
      metadataTitle: "关于本站",
      metadataDescription: "了解雷价通的定位、数据原则与维护方式。",
      heroNote: "定位说明 · 数据原则 · 维护方式",
      heroTitleLine1: "关于雷价通",
      heroTitleLine2Left: "把影响选择成本的信息",
      heroTitleLine2Right: "摆清楚",
      heroDescriptionLine1: "我们不追求花哨内容，而是把真正影响选择的信息组织清楚，",
      heroDescriptionLine2: "让你能更快判断订阅、Token 与活动是否值得。",
      primaryAction: "查看订阅比价",
      secondaryAction: "查看优惠活动",
      dataPrinciplesTitle: "数据原则",
      faqTitle: "常见问题",
      profileParagraph1:
        "雷价通聚焦 AI 订阅、Token 成本、会员速率和优惠活动，把真正影响决策的信息收敛到同一套页面里。",
      profileParagraph2:
        "站内会持续维护公开价格、来源链接和复核时间，帮助你更快判断不同方案的成本差异。",
      faqItems: [
        {
          question: "站内数据是怎么维护的？",
          answer:
            "目前以公开价格页、帮助中心和人工复核整理为主，优先保证页面可读性、来源清晰度和更新节奏。",
        },
        {
          question: "价格一定准确吗？",
          answer:
            "站内会尽量同步官方来源，但定价和汇率都会变化，所以页面会持续保留“请以官方页面为准”的提示。",
        },
        {
          question: "会收录灰产代充吗？",
          answer:
            "不会。首版只面向正规活动、免费额度、学生权益和明确地区差异，不鼓励违规购买路径。",
        },
      ],
    },
    useCasesPage: {
      metadataTitle: "AI 使用场景推荐",
      metadataDescription:
        "按开发、写作、学习、研究、自动化和创意任务查看推荐工具与模型组合。",
      heroNote: "写作 · 编程 · 学习 · 办公",
      heroTitleLine1: "AI 使用场景",
      heroTitleLine2Left: "按任务选择",
      heroTitleLine2Right: "更省预算",
      heroDescriptionLine1: "不只告诉你“能做什么”，也告诉你“该把预算放在哪”。",
      heroDescriptionLine2: "先按任务类型切换，再回到订阅和 Token 页面做更细的成本决策。",
      primaryAction: "查看场景分类",
      secondaryAction: "去看订阅页",
      boardKicker: "use case tabs",
      boardTitle: "场景分类总览",
      boardCountPrefix: "当前分类共",
      boardCountSuffix: "个场景，覆盖工具选择、预算提醒和落地入口。",
      infoLabels: {
        bestFor: "适合任务",
        tools: "推荐工具",
        models: "优先模型",
        workflow: "推荐工作流",
        budgetTip: "预算提醒",
      },
      groupLabelMap: {
        all: "全部场景",
        dev: "开发编程",
        work: "写作办公",
        research: "学习研究",
        automation: "自动化",
        creative: "创意生成",
      },
      ctaLabelMap: {},
    },
    toolsPage: {
      metadataTitle: "AI 工具导航",
      metadataDescription: "按使用场景快速浏览常见 AI 工具与产品定位。",
      heroNote: "场景分类 · 轻导航 · 快速选型",
      heroTitleLine1: "AI 工具导航",
      heroTitleLine2Left: "先找方向",
      heroTitleLine2Right: "再做选择",
      heroDescriptionLine1: "这里只做轻量导航，不喧宾夺主，帮助你先找到适合自己的工具轨道，",
      heroDescriptionLine2: "再回到订阅与 Token 页做具体价格比较。",
      primaryAction: "去看订阅比价",
      secondaryAction: "去看 Token 价格",
      visitWebsite: "访问官网",
    },
    dealArticlesSection: {
      filterStatus: "状态",
      filterTag: "标签",
      all: "全部",
      notStarted: "未开始",
      inProgress: "进行中",
      ended: "已结束",
      statTotal: "总数",
      statInProgress: "进行中",
      previewAriaPrefix: "查看文章：",
      pendingTag: "待补标签",
      emptyTip: "当前筛选条件下还没有文章，换个状态或标签试试看。",
    },
    articleDetail: {
      backToList: "返回文章列表",
      sourceLink: "查看原始来源",
      publishedAtPrefix: "发布于 ",
      notFoundTitle: "文章未找到",
    },
  },
  en: {
    header: {
      openNavAriaLabel: "Open navigation",
      sheetDescription: "Browse all sections with a clean and consistent layout.",
      badgeText: {
        hot: "hot",
        new: "new",
      },
    },
    layout: {
      metadataTitleDefault: "PriceRadar AI - Track AI Subscriptions, Token Costs, and Deal Signals",
      metadataTitleTemplate: "%s | PriceRadar AI",
      metadataDescription:
        "Compare ChatGPT, Claude, Gemini, and other AI subscription pricing, token costs, membership rates, free credits, and verified deals.",
      metadataKeywords: [
        "AI price comparison",
        "LLM pricing",
        "ChatGPT pricing",
        "Claude pricing",
        "Gemini pricing",
        "Token pricing",
        "AI deals",
        "AI discount",
        "AI tools",
      ],
      openGraphLocale: "en_US",
    },
    footer: {
      siblingProjectsTitle: "Other Projects",
      maintenanceTitle: "Public Pricing, Continuously Maintained",
      maintenanceDescription:
        "Built on public sources, normalized pricing, and review timestamps to help you compare options faster.",
      principlesLinkLabel: "View Data Principles",
      brandDescriptionSuffix:
        "Maintained with public sources and review records to keep key pricing and deal updates current.",
      trustPrinciplesTitle: "Data Principles",
      trustBullets: [
        "Every price and offer includes a source link.",
        "Each entry shows a recent review timestamp for freshness checks.",
        "Prices can change over time. Always verify on official pages.",
      ],
    },
    home: {
      heroPills: ["Live", "Rates", "Cases", "Deals"],
      heroTitleLine1: "AI Cost Compass",
      heroTitleLine2Left: "Plans, Credits, Deals",
      heroTitleLine2Right: "One View",
      heroDescriptionLine1:
        "Scan plans, credits, and key deals in one quick pass.",
      heroDescriptionLine2:
        "Then dive deeper by provider and workflow.",
      compareButton: "Start Comparing",
      dealsButton: "View Deals",
    },
    dealsPage: {
      metadataTitle: "AI Deals",
      metadataDescription:
        "Curated free credits, student benefits, trial entries, and verified promotional offers.",
      heroNote: "Official campaigns · Free credits · Student benefits",
      heroTitleLine1: "AI Deals",
      heroTitleLine2Left: "Legit Channels",
      heroTitleLine2Right: "One Page Overview",
      heroDescriptionLine1:
        "We prioritize official free tiers, education benefits, regional pricing differences, and newcomer offers.",
      heroDescriptionLine2:
        "No gray-market top-ups. Only publicly verifiable entry points.",
      viewArticles: "View Articles",
      browseTools: "Browse Tools",
      tabArticles: "Articles",
      tabDeals: "Free Deals",
    },
    aboutPage: {
      metadataTitle: "About",
      metadataDescription:
        "Learn what PriceRadar AI tracks, how data is reviewed, and what principles we follow.",
      heroNote: "Positioning · Data principles · Maintenance",
      heroTitleLine1: "About PriceRadar AI",
      heroTitleLine2Left: "Make Cost-Critical",
      heroTitleLine2Right: "Signals Clear",
      heroDescriptionLine1:
        "We prioritize decision-critical information over noise and presentation-heavy content.",
      heroDescriptionLine2:
        "So you can quickly judge whether subscriptions, tokens, and deals are worth it.",
      primaryAction: "View Subscription Comparison",
      secondaryAction: "View Deals",
      dataPrinciplesTitle: "Data Principles",
      faqTitle: "FAQ",
      profileParagraph1:
        "PriceRadar AI focuses on subscriptions, token costs, membership rates, and deal updates in one decision-oriented workspace.",
      profileParagraph2:
        "We continuously maintain public pricing, source links, and review timestamps so cost comparisons stay practical.",
      faqItems: [
        {
          question: "How is the data maintained?",
          answer:
            "We rely on public pricing pages, help center sources, and manual review, prioritizing readability, source clarity, and update cadence.",
        },
        {
          question: "Is pricing always exact?",
          answer:
            "We sync official sources as closely as possible, but pricing and FX rates change. Always verify on official pages.",
        },
        {
          question: "Do you include gray-market top-ups?",
          answer:
            "No. We focus on official campaigns, free credits, student benefits, and explicit regional differences.",
        },
      ],
    },
    useCasesPage: {
      metadataTitle: "AI Use Cases",
      metadataDescription:
        "Explore recommended tools and model combinations by coding, writing, study, research, automation, and creative tasks.",
      heroNote: "Writing · Coding · Study · Work",
      heroTitleLine1: "AI Use Cases",
      heroTitleLine2Left: "Choose by Task",
      heroTitleLine2Right: "Save Budget",
      heroDescriptionLine1: "Not just what AI can do, but where your budget should go first.",
      heroDescriptionLine2:
        "Switch by task type, then go deeper on subscriptions and token pricing.",
      primaryAction: "View Cases",
      secondaryAction: "See Plans",
      boardKicker: "use case tabs",
      boardTitle: "Use-case Overview",
      boardCountPrefix: "This category includes",
      boardCountSuffix: "use cases covering tools, budget tips, and entry points.",
      infoLabels: {
        bestFor: "Best For",
        tools: "Recommended Tools",
        models: "Preferred Models",
        workflow: "Suggested Workflow",
        budgetTip: "Budget Tip",
      },
      groupLabelMap: {
        all: "All Cases",
        dev: "Dev & Coding",
        work: "Writing & Office",
        research: "Study & Research",
        automation: "Automation",
        creative: "Creative",
      },
      ctaLabelMap: {
        "看会员速率": "View Membership Rates",
        "看 Token 成本": "View Token Costs",
        "看订阅组合": "View Subscription Mix",
        "看工具导航": "Browse Tool Directory",
        "看低成本入口": "View Low-cost Entries",
        "看学习向订阅": "View Study-focused Plans",
        "看研究向厂商": "View Research Vendors",
        "看便宜模型": "View Low-cost Models",
        "看低成本输入价": "View Low Input Cost",
        "看优惠活动": "View Deals",
        "看创意场景": "View Creative Cases",
        "看运营工具": "View Ops Tools",
      },
    },
    toolsPage: {
      metadataTitle: "AI Tool Directory",
      metadataDescription:
        "Quickly browse common AI tools and product positioning by practical use scenarios.",
      heroNote: "Scenario sorting · Lightweight navigation · Fast selection",
      heroTitleLine1: "AI Tool Directory",
      heroTitleLine2Left: "Find Direction First",
      heroTitleLine2Right: "Then Choose",
      heroDescriptionLine1:
        "This section is intentionally lightweight: it helps you find the right lane first,",
      heroDescriptionLine2:
        "then return to subscriptions and token pages for concrete price comparison.",
      primaryAction: "See Plans",
      secondaryAction: "See Tokens",
      visitWebsite: "Visit Official Site",
    },
    dealArticlesSection: {
      filterStatus: "Status",
      filterTag: "Tags",
      all: "All",
      notStarted: "Not Started",
      inProgress: "In Progress",
      ended: "Ended",
      statTotal: "Total",
      statInProgress: "In Progress",
      previewAriaPrefix: "Read article: ",
      pendingTag: "Tag TBD",
      emptyTip: "No articles match this filter yet. Try another status or tag.",
    },
    articleDetail: {
      backToList: "Back to Articles",
      sourceLink: "View Original Source",
      publishedAtPrefix: "Published on ",
      notFoundTitle: "Article Not Found",
    },
  },
} as const;

export function getPrimaryNav(locale: SiteLocale) {
  return navItemsByLocale[locale];
}

export function getUICopy(locale: SiteLocale) {
  return copyByLocale[locale];
}
