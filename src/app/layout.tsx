import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";

import { AppChrome } from "@/components/layout/app-chrome";
import { ScrollToTopButton } from "@/components/shared/scroll-to-top-button";
import { siteConfig } from "@/lib/site";

import "@wangeditor-next/editor/dist/css/style.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://price.lengziyu.cn"),
  title: {
    default: "雷价通 - AI 会员订阅、Token 成本与优惠速率追踪",
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "雷价通提供 ChatGPT、Claude、Gemini、DeepSeek 等大模型订阅价格、API Token 价格、会员速率、免费额度和 AI 优惠活动对比，帮助你低成本使用 AI。",
  keywords: [
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
  applicationName: siteConfig.name,
  icons: {
    icon: [
      {
        url: "/leijiatong-logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "雷价通",
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (() => {
      try {
        const storageKey = "ai-price-watch-theme";
        const stored = window.localStorage.getItem(storageKey);
        const theme =
          stored === "light" || stored === "dark"
            ? stored
            : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.dataset.theme = theme;
      } catch {}
    })();
  `;

  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <div className="relative flex min-h-full flex-col">
          <AppChrome>{children}</AppChrome>
          <ScrollToTopButton />
        </div>
      </body>
    </html>
  );
}
