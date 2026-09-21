import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { siteConfig } from "@/data/site";
import { sponsorTiers } from "@/data/sponsorship";
import { getSponsors } from "@/data/sponsors";
import { TierCard } from "@/components/sponsorship/TierCard";
import { BenefitsTable } from "@/components/sponsorship/BenefitsTable";
import { SponsorGrid } from "@/components/sponsorship/SponsorGrid";

interface SponsorshipSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export async function SponsorshipSection({ locale, dict }: SponsorshipSectionProps) {
  const t = dict.sponsorship;
  const sponsors = await getSponsors();

  return (
    <section
      id="sponsorship"
      aria-labelledby="sponsorship-heading"
      style={{
        padding: "4rem 0",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="site-container">
        <div style={{ maxWidth: "760px", marginBottom: "2rem" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-blue)",
              marginBottom: "0.75rem",
            }}
          >
            {t.eyebrow}
          </p>
          <h2
            id="sponsorship-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "var(--color-navy)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}
          >
            {t.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Part A — tiers (Diamond first on mobile and desktop) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          {sponsorTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} locale={locale} dict={dict} ctaHref={siteConfig.facebookPageUrl} />
          ))}
        </div>

        <div className="mt-10">
          <BenefitsTable locale={locale} dict={dict} />
        </div>

        {/* Part B — current sponsors */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <h3
            className="m-0 text-lg font-bold sm:text-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
          >
            {t.sponsorsTitle}
          </h3>
          <p className="mb-5 mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t.sponsorsSubtitle}
          </p>
          <SponsorGrid sponsors={sponsors} locale={locale} dict={dict} />
        </div>
        {/* Organizer contact — same block as the Packages section */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.75rem 1.5rem",
            backgroundColor: "var(--color-bg-page)",
            border: "1px solid var(--color-border)",
            borderRadius: "18px",
            textAlign: "center",
            maxWidth: "760px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-navy)",
              marginBottom: "0.5rem",
            }}
          >
            {dict.packages.centralCta?.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              maxWidth: "620px",
              margin: "0 auto 1.25rem",
            }}
          >
            {dict.packages.centralCta?.description}
          </p>
          <a
            href={siteConfig.facebookPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            {dict.packages.centralCta?.button ?? dict.packages.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
