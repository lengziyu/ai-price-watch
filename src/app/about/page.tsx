import type { Metadata } from "next";

import { PageHero } from "@/components/shared/page-hero";
import { PageShowcase } from "@/components/shared/page-showcase";
import { ScrambleText } from "@/components/shared/scramble-text";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { siteConfig } from "@/lib/site";
import { getUICopy } from "@/lib/ui-copy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return {
    title: uiCopy.aboutPage.metadataTitle,
    description: uiCopy.aboutPage.metadataDescription,
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  return (
    <div className="pb-8 sm:pb-16">
      <PageHero
        note={uiCopy.aboutPage.heroNote}
        title={
          <>
            <div>
              <ScrambleText text={uiCopy.aboutPage.heroTitleLine1} />
            </div>
            <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <ScrambleText text={uiCopy.aboutPage.heroTitleLine2Left} />
              <ScrambleText text={uiCopy.aboutPage.heroTitleLine2Right} className="gradient-title" />
            </div>
          </>
        }
        description={
          <>
            {uiCopy.aboutPage.heroDescriptionLine1}
            <br />
            {uiCopy.aboutPage.heroDescriptionLine2}
          </>
        }
        primaryAction={{ href: addLocalePrefix("/pricing/subscriptions", locale), label: uiCopy.aboutPage.primaryAction }}
        secondaryAction={{ href: addLocalePrefix("/deals", locale), label: uiCopy.aboutPage.secondaryAction }}
        rightSlot={<PageShowcase variant="about" />}
      />

      <section className="app-shell mt-4 sm:mt-8">
        <div className="flex flex-col gap-6 rounded-[12px] border border-transparent bg-transparent px-0 py-0 shadow-none sm:border-border sm:bg-background sm:px-5 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border lg:col-span-2">
            <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
              <CardTitle>{siteConfig.name}</CardTitle>
              <CardDescription>{siteConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-0 pb-0 text-sm leading-7 text-muted-foreground sm:px-6 sm:pb-6">
              <p>
                {uiCopy.aboutPage.profileParagraph1}
              </p>
              <p>
                {uiCopy.aboutPage.profileParagraph2}
              </p>
            </CardContent>
          </Card>

          <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border">
            <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
              <CardTitle>{uiCopy.aboutPage.dataPrinciplesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-0 pb-0 text-sm leading-7 text-muted-foreground sm:px-6 sm:pb-6">
              {uiCopy.footer.trustBullets.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card rounded-xl border-transparent bg-transparent shadow-none sm:border-border">
          <CardHeader className="px-0 py-0 sm:px-6 sm:py-5">
            <CardTitle>{uiCopy.aboutPage.faqTitle}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <Accordion>
              <AccordionItem value="static-data">
                <AccordionTrigger>{uiCopy.aboutPage.faqItems[0].question}</AccordionTrigger>
                <AccordionContent>
                  {uiCopy.aboutPage.faqItems[0].answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="accuracy">
                <AccordionTrigger>{uiCopy.aboutPage.faqItems[1].question}</AccordionTrigger>
                <AccordionContent>
                  {uiCopy.aboutPage.faqItems[1].answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gray-market">
                <AccordionTrigger>{uiCopy.aboutPage.faqItems[2].question}</AccordionTrigger>
                <AccordionContent>
                  {uiCopy.aboutPage.faqItems[2].answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        </div>
      </section>
    </div>
  );
}
