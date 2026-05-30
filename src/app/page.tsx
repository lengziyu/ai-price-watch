import Link from "next/link";
import { ArrowRightIcon, GiftIcon } from "lucide-react";

import { HomeContentOverview } from "@/components/home/home-content-overview";
import { subscriptionPlans } from "@/data/subscriptions";
import { buttonVariants } from "@/components/ui/button";
import { SubscriptionExplorer } from "@/components/pricing/subscription-explorer";
import { AnimeReveal } from "@/components/shared/anime-reveal";
import { HeroMesh } from "@/components/shared/hero-mesh";
import { ScrambleText } from "@/components/shared/scramble-text";
import { HeroShowcase } from "@/components/shared/hero-showcase";
import { getDealArticles } from "@/lib/admin-store";
import { localizeDealArticles } from "@/lib/deal-article-localization";
import { addLocalePrefix } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getUICopy } from "@/lib/ui-copy";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const uiCopy = getUICopy(locale);
  const articles = await getDealArticles();
  const localizedArticles = localizeDealArticles(articles, locale);

  return (
    <div className="pb-8 sm:pb-16">
      <section className="hero-stage hero-mesh-stage hero-aura -mt-[84px] w-full bg-background pt-[96px] sm:-mt-[104px] sm:pt-[120px]">
        <HeroMesh />
        <div className="app-shell py-6 sm:py-8 lg:py-11">
          <div className="grid items-center gap-4 sm:gap-6 lg:grid-cols-[1fr_0.95fr]">
            <AnimeReveal
              selector=":scope > *"
              stagger={90}
              className="flex flex-col gap-6.5 sm:gap-7.5"
            >
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/75 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="size-2 rounded-full bg-primary" />
                <span>{uiCopy.home.heroPills[0]}</span>
                <span>·</span>
                <span>{uiCopy.home.heroPills[1]}</span>
                <span>·</span>
                <span>{uiCopy.home.heroPills[2]}</span>
                <span>·</span>
                <span>{uiCopy.home.heroPills[3]}</span>
              </div>

              <div className="text-[2.4rem] font-semibold leading-[0.91] tracking-[-0.046em] text-foreground [&>div+div]:mt-2.5 sm:max-w-[700px] sm:text-[2.76rem] sm:[&>div+div]:mt-3.5 lg:text-[3.2rem]">
                <div>
                  <ScrambleText text={uiCopy.home.heroTitleLine1} />
                </div>
                <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <ScrambleText text={uiCopy.home.heroTitleLine2Left} />
                  <ScrambleText
                    text={uiCopy.home.heroTitleLine2Right}
                    className="gradient-title"
                  />
                </div>
              </div>

              <p className="text-[13.5px] leading-[1.88] text-muted-foreground sm:max-w-[620px] sm:text-[14px] sm:leading-[1.7]">
                {uiCopy.home.heroDescriptionLine1}
                <br />
                {uiCopy.home.heroDescriptionLine2}
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
                <Link
                  href={addLocalePrefix("/pricing/subscriptions", locale)}
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                  })}
                >
                  <span className="hero-gradient-text">{uiCopy.home.compareButton}</span>
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
                <Link
                  href={addLocalePrefix("/deals", locale)}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className:
                      "hero-gradient-button min-w-0 px-3 text-[13px] sm:px-6 sm:text-sm",
                  })}
                >
                  <span className="hero-gradient-text">{uiCopy.home.dealsButton}</span>
                  <GiftIcon data-icon="inline-end" />
                </Link>
              </div>
            </AnimeReveal>

            <AnimeReveal className="hidden lg:block" distance={30} delay={160}>
              <HeroShowcase locale={locale} />
            </AnimeReveal>
          </div>
        </div>
      </section>

      <HomeContentOverview articles={localizedArticles} locale={locale} />

      <section className="app-shell mt-4 sm:mt-8">
        <SubscriptionExplorer
          plans={subscriptionPlans}
          embedded
          disableStickyTabs
          maxRows={10}
        />
        <div className="mt-4 flex justify-center sm:mt-5">
          <Link
            href={addLocalePrefix("/pricing/subscriptions", locale)}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "min-w-[220px] rounded-[12px] border-primary/18 bg-primary/[0.04] px-6 text-primary hover:bg-primary/[0.08]",
            })}
          >
            {locale === "en" ? "View Full Subscription Comparison" : "查看完整会员订阅比价"}
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </section>
    </div>
  );
}
