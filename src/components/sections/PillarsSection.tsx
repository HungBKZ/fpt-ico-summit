import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface PillarsSectionProps {
  locale: Locale;
  dict: Dictionary;
}

type PillarAccent = "blue" | "navy";

export function PillarsSection({ dict }: PillarsSectionProps) {
  const pillars: {
    title: string;
    body: string;
    accent: PillarAccent;
    icon: React.ReactNode;
  }[] = [
    {
      title: dict.pillars.items.p1.title,
      body: dict.pillars.items.p1.desc,
      accent: "blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
        </svg>
      ),
    },
    {
      title: dict.pillars.items.p2.title,
      body: dict.pillars.items.p2.desc,
      accent: "blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      title: dict.pillars.items.p3.title,
      body: dict.pillars.items.p3.desc,
      accent: "navy",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
    {
      title: dict.pillars.items.p4.title,
      body: dict.pillars.items.p4.desc,
      accent: "blue",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="pillars-heading"
      className="section--tinted"
    >
      <div className="site-container section-padding">
        <div className="pillars-grid">

          {/* Left — intro text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="pillars-heading"
                className="section-heading--tinted"
                eyebrow={dict.pillars.eyebrow}
                heading={dict.pillars.title}
                body={dict.pillars.subtitle}
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            {/* Decorative detail */}
            <div
              aria-hidden="true"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                paddingTop: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "2.5rem",
                  height: "2px",
                  backgroundColor: "var(--color-blue)",
                  borderRadius: "var(--radius-full)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                }}
              >
                {dict.hero.datesValue} · {dict.hero.venueValue}
              </span>
            </div>
          </div>

          {/* Right — pillar cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="pillar-cards">
              {pillars.map((pillar, index) => (
                <RevealOnScroll key={pillar.title} delay={index * 90}>
                  <article
                    className={`pillar-card pillar-card--${pillar.accent}`}
                  >
                    <div className={`pillar-icon pillar-icon--${pillar.accent}`}>
                      {pillar.icon}
                    </div>
                    <h3 className="pillar-card-title">{pillar.title}</h3>
                    <p className="pillar-card-body">{pillar.body}</p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
