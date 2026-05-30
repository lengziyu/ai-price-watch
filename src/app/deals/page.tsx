import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { DealArticlesSection } from "@/components/deals/deal-articles-section";
import { DealsExplorer } from "@/components/deals/deals-explorer";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiDeals } from "@/data/deals";
import { getDealArticles } from "@/lib/admin-store";
import { localizeDealArticles } from "@/lib/deal-article-localization";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getUICopy } from "@/lib/ui-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return {
    title: uiCopy.dealsPage.metadataTitle,
    description: uiCopy.dealsPage.metadataDescription,
  };
}

export default async function DealsPage() {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  const articles = await getDealArticles();
  const localizedArticles = localizeDealArticles(articles, locale);

  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={uiCopy.dealsPage.heroNote}
        title={
          <>
            <div>
              <ScrambleText text={uiCopy.dealsPage.heroTitleLine1} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={uiCopy.dealsPage.heroTitleLine2Left} />
              <ScrambleText text={uiCopy.dealsPage.heroTitleLine2Right} className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            {uiCopy.dealsPage.heroDescriptionLine1}
            <br />
            {uiCopy.dealsPage.heroDescriptionLine2}
          </>
        }
        primaryAction={{
          href: "#content-switcher",
          label: uiCopy.dealsPage.viewArticles,
        }}
        secondaryAction={{
          href: addLocalePrefix("/tools", locale),
          label: uiCopy.dealsPage.browseTools,
        }}
        rightSlot={<PageShowcase variant="deals" />}
      />

      <Tabs defaultValue="articles" className="mt-4 gap-3 sm:mt-6">
        <div id="content-switcher" className="app-shell">
          <div className={cn("page-tabs-sticky__surface p-0 sm:p-1.5")}>
            <TabsList variant="accent" className="w-full max-w-full sm:w-fit">
              <TabsTrigger value="articles" className="min-w-[116px]">
                {uiCopy.dealsPage.tabArticles}
              </TabsTrigger>
              <TabsTrigger value="deals" className="min-w-[116px]">
                {uiCopy.dealsPage.tabDeals}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="articles">
          <DealArticlesSection articles={localizedArticles} locale={locale} />
        </TabsContent>

        <TabsContent value="deals">
          <div id="deals-board">
            <DealsExplorer deals={aiDeals} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
