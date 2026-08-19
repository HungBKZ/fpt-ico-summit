/**
 * app/[locale]/page.tsx — Localized Homepage.
 */

import { notFound } from "next/navigation";
import { isValidLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { ExperienceGrid } from "@/components/sections/ExperienceGrid";
import { ProgramOverview } from "@/components/sections/ProgramOverview";
import { ExpoSection } from "@/components/sections/ExpoSection";
import { WorkshopSection } from "@/components/sections/WorkshopSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { ScholarshipsSection } from "@/components/sections/ScholarshipsSection";
import { MekongSection } from "@/components/sections/MekongSection";
import { VenueSection } from "@/components/sections/VenueSection";
import { SouvenirSection } from "@/components/sections/SouvenirSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { RegistrationCta } from "@/components/sections/RegistrationCta";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
        <HeroSection locale={locale} dict={dict} />
        <StatsStrip locale={locale} dict={dict} />

        <PillarsSection locale={locale} dict={dict} />
        <ExperienceGrid locale={locale} dict={dict} />

        <ProgramOverview locale={locale} dict={dict} />
        <ExpoSection locale={locale} dict={dict} />
        <WorkshopSection locale={locale} dict={dict} />

        <PartnersSection locale={locale} dict={dict} />
        <ScholarshipsSection locale={locale} dict={dict} />
        <MekongSection locale={locale} dict={dict} />
        <VenueSection locale={locale} dict={dict} />

        <SouvenirSection locale={locale} dict={dict} />

        <FaqSection locale={locale} dict={dict} />
        <RegistrationCta locale={locale} dict={dict} />
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}
