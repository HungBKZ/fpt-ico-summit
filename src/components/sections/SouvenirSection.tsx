/**
 * SouvenirSection — Official Summit Merchandise / Food & Souvenirs.
 *
 * Layout (desktop): text left, tote mockup image right.
 * Uses toteMockup (C2) as the primary visual — a clean transparent PNG.
 *
 * Language rules:
 *  - Neutral: "Official Summit merchandise", "Event souvenirs".
 *  - Do NOT claim every attendee receives the tote bag.
 *  - Do NOT invent prices, availability, or distribution details.
 *
 * Server Component.
 */

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { images } from "@/data/images";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const highlights = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    label: "Official Summit merchandise",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    label: "Souvenir showcase on-site",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    label: "Event keepsakes and cultural items",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    label: "Food and refreshments at the venue",
  },
];

export function SouvenirSection() {
  return (
    <section
      id="souvenirs"
      aria-labelledby="souvenir-heading"
      style={{ backgroundColor: "var(--color-off-white)", position: "relative", overflow: "hidden" }}
    >
      {/* Subtle diagonal brand motif */}
      <div className="brand-motif brand-motif--subtle" aria-hidden="true" />

      <div className="site-container section-padding" style={{ position: "relative", zIndex: 1 }}>
        <div className="souvenir-layout">

          {/* Text column */}
          <RevealOnScroll className="souvenir-text" delay={0}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <SectionHeading
              id="souvenir-heading"
              eyebrow="Souvenirs & Food"
              heading="Take a piece of the summit home."
              body="FPT ICO Summit 2026 will feature official event merchandise and a range of food and refreshment options on campus throughout the event."
              level="h2"
              align="left"
              accent={true}
            />

            {/* Highlight list */}
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {highlights.map((item) => (
                <li
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-blue-subtle)",
                      color: "var(--color-blue)",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>

            {/* Neutral chip */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className="souvenir-chip">21–22 November 2026</span>
              <span className="souvenir-chip">FPT University Can Tho Campus</span>
            </div>

            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                borderLeft: "2px solid var(--color-border)",
                paddingLeft: "0.75rem",
                lineHeight: "var(--leading-normal)",
              }}
            >
              Merchandise details and availability will be confirmed closer to the event date.
            </p>
            </div>
          </RevealOnScroll>

          {/* Image column — tote bag mockup (C2) */}
          <RevealOnScroll className="souvenir-image" delay={100}>
            <Image
              src={images.toteMockup.src!}
              alt={images.toteMockup.alt}
              width={520}
              height={520}
              style={{
                width: "100%",
                maxWidth: "460px",
                height: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 20px 40px rgba(11,23,54,0.18))",
              }}
            />
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
}
