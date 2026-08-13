/**
 * page.tsx — Homepage root.
 *
 * Phase 1: SiteHeader + SiteFooter shell.
 * Phase 2: HeroSection + StatsStrip.
 * Phase 3: PillarsSection + ExperienceGrid.
 * Phase 4: ProgramOverview + ExpoSection + WorkshopSection.
 * Phase 5: PartnersSection + MekongSection + VenueSection.
 * Phase 6: FaqSection + RegistrationCta.
 */

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
import { FaqSection } from "@/components/sections/FaqSection";
import { RegistrationCta } from "@/components/sections/RegistrationCta";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
        {/* Phase 2 */}
        <HeroSection />
        <StatsStrip />

        {/* Phase 3 */}
        <PillarsSection />
        <ExperienceGrid />

        {/* Phase 4 */}
        <ProgramOverview />
        <ExpoSection />
        <WorkshopSection />

        {/* Phase 5 */}
        <PartnersSection />
        <ScholarshipsSection />
        <MekongSection />
        <VenueSection />

        {/* Phase 6 */}
        <FaqSection />
        <RegistrationCta />
      </main>

      <SiteFooter />
    </>
  );
}
