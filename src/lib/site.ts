import type { NavItem } from "@/types";

export const siteConfig = {
  name: "雷价通",
  englishName: "PriceRadar AI",
  domain: "price.lengziyu.cn",
  description:
    "追踪大模型价格、会员订阅差价、API Token 成本、会员速率与 AI 优惠活动。",
  subtitle:
    "Compare AI subscriptions, token prices, free credits and AI deals.",
};

export const primaryNav: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/pricing/tokens", label: "Token 比价" },
  { href: "/pricing/subscriptions", label: "会员订阅", badge: "hot" },
  { href: "/membership-rates", label: "会员速率", badge: "new" },
  { href: "/deals", label: "AI 优惠" },
  { href: "/use-cases", label: "使用场景" },
];

export const homeHighlights = [
  {
    title: "大模型会员订阅比价",
    description: "对比 ChatGPT、Claude、Gemini、Cursor、Windsurf 等方案。",
    href: "/pricing/subscriptions",
  },
  {
    title: "API Token 价格表",
    description: "按平台、模型类型和单价快速筛选，找到更低推理成本。",
    href: "/pricing/tokens",
  },
  {
    title: "今日 AI 羊毛与免费额度",
    description: "优先收录官方免费层、学生权益、试用和正规优惠。",
    href: "/deals",
  },
  {
    title: "AI 使用场景推荐",
    description: "轻量推荐写代码、写作、办公、学习和生成内容的组合。",
    href: "/use-cases",
  },
];

export const trustBullets = [
  "所有价格与活动都保留来源链接。",
  "每条数据都带最近复核时间，方便判断信息时效。",
  "价格可能随时间变化，请以官方页面为准。",
];

export const siblingProjects = [
  {
    href: "https://niuma.lengziyu.cn",
    label: "牛马百宝箱",
  },
  {
    href: "https://envra.lengziyu.cn",
    label: "ENVRA 前端工具",
  },
  {
    href: "https://nav.lengziyu.cn",
    label: "AI 前沿导航",
  },
  {
    href: "https://cv.lengziyu.cn",
    label: "在线简历生成",
  },
  {
    href: "https://zj.lengziyu.cn",
    label: "宗迹",
  },
];
