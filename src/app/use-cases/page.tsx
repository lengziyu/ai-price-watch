import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { UseCasesBoard } from "@/components/use-cases/use-cases-board";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getUICopy } from "@/lib/ui-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return {
    title: uiCopy.useCasesPage.metadataTitle,
    description: uiCopy.useCasesPage.metadataDescription,
  };
}

type UseCasesPageProps = {
  searchParams?: Promise<{
    group?: string;
  }>;
};

export default async function UseCasesPage({ searchParams }: UseCasesPageProps) {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  const params = (await searchParams) ?? {};

  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={uiCopy.useCasesPage.heroNote}
        title={
          <>
            <div>
              <ScrambleText text={uiCopy.useCasesPage.heroTitleLine1} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={uiCopy.useCasesPage.heroTitleLine2Left} />
              <ScrambleText text={uiCopy.useCasesPage.heroTitleLine2Right} className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            {uiCopy.useCasesPage.heroDescriptionLine1}
            <br />
            {uiCopy.useCasesPage.heroDescriptionLine2}
          </>
        }
        primaryAction={{ href: "#use-cases-board", label: uiCopy.useCasesPage.primaryAction }}
        secondaryAction={{ href: addLocalePrefix("/pricing/subscriptions", locale), label: uiCopy.useCasesPage.secondaryAction }}
        rightSlot={<PageShowcase variant="use-cases" />}
      />

      <UseCasesBoard
        key={params.group ?? "all"}
        defaultGroup={params.group}
        locale={locale}
      />
    </div>
  );
}
