import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import Script from "next/script";

import { AppChrome } from "@/components/layout/app-chrome";
import { ScrollToTopButton } from "@/components/shared/scroll-to-top-button";
import { getRequestLocale } from "@/lib/request-locale";
import { siteConfig } from "@/lib/site";
import { getUICopy } from "@/lib/ui-copy";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);

  return {
    metadataBase: new URL("https://price.lengziyu.cn"),
    title: {
      default: uiCopy.layout.metadataTitleDefault,
      template: uiCopy.layout.metadataTitleTemplate,
    },
    description: uiCopy.layout.metadataDescription,
    keywords: [...uiCopy.layout.metadataKeywords],
    applicationName: locale === "en" ? siteConfig.englishName : siteConfig.name,
    icons: {
      icon: [
        {
          url: "/leijiatong-logo.svg",
          type: "image/svg+xml",
        },
      ],
    },
    openGraph: {
      title: locale === "en" ? siteConfig.englishName : siteConfig.name,
      description: locale === "en" ? siteConfig.descriptionEn : siteConfig.description,
      siteName: locale === "en" ? siteConfig.englishName : siteConfig.name,
      locale: uiCopy.layout.openGraphLocale,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
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
      lang={locale}
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="49c7452e-cd73-484d-a9c5-1e22b84e1b7e"
          strategy="afterInteractive"
        />
        <div className="relative flex min-h-full flex-col">
          <AppChrome>{children}</AppChrome>
          <ScrollToTopButton />
        </div>
      </body>
    </html>
  );
}
