import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { toolsDirectory } from "@/data/tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getUICopy } from "@/lib/ui-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return {
    title: uiCopy.toolsPage.metadataTitle,
    description: uiCopy.toolsPage.metadataDescription,
  };
}

export default async function ToolsPage() {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={uiCopy.toolsPage.heroNote}
        title={
          <>
            <div>
              <ScrambleText text={uiCopy.toolsPage.heroTitleLine1} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={uiCopy.toolsPage.heroTitleLine2Left} />
              <ScrambleText text={uiCopy.toolsPage.heroTitleLine2Right} className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            {uiCopy.toolsPage.heroDescriptionLine1}
            <br />
            {uiCopy.toolsPage.heroDescriptionLine2}
          </>
        }
        primaryAction={{ href: addLocalePrefix("/pricing/subscriptions", locale), label: uiCopy.toolsPage.primaryAction }}
        secondaryAction={{ href: addLocalePrefix("/pricing/tokens", locale), label: uiCopy.toolsPage.secondaryAction }}
        rightSlot={<PageShowcase variant="tools" />}
      />

      <section className="app-shell mt-4 sm:mt-8">
        <div className="grid gap-4 rounded-[12px] border border-transparent bg-transparent px-0 py-0 shadow-none md:grid-cols-2 sm:border-border sm:bg-background sm:px-5 lg:px-6 xl:grid-cols-3">
          {toolsDirectory.map((tool) => (
            <Card key={tool.id} className="surface-card rounded-xl">
              <CardHeader className="gap-3 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.category}</CardDescription>
                  </div>
                  <Badge variant="outline">{tool.pricing}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  {tool.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={tool.url}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
                >
                  {uiCopy.toolsPage.visitWebsite}
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
