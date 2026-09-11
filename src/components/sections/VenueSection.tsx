import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CampusLocationMap } from "@/components/sections/CampusLocationMap";
import { siteConfig } from "@/data/site";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface VenueSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export function VenueSection({ dict }: VenueSectionProps) {
  const mapsUrl = siteConfig.campusMapsUrl;

  return (
    <section
      id="venue"
      aria-labelledby="venue-heading"
      className="section--tinted"
    >
      <div className="site-container section-padding">
        <div className="venue-layout">

          {/* Left — live campus location map */}
          <CampusLocationMap
            dict={dict}
            venueName={siteConfig.venue}
            address={siteConfig.address}
            coordinates={siteConfig.coordinates}
            mapsUrl={siteConfig.campusMapsUrl}
          />

          {/* Right — venue details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="venue-heading"
                eyebrow={dict.venue.eyebrow}
                heading={dict.venue.title}
                body={dict.venue.subtitle}
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            {/* Address */}
            <div className="venue-address-block">
              <p className="venue-address-label">{dict.venue.addressLabel}</p>
              <address className="venue-address-text">
                {siteConfig.address}
              </address>
            </div>

            {/* Dates */}
            <div className="venue-address-block">
              <p className="venue-address-label">{dict.venue.dateLabel}</p>
              <p className="venue-address-text">{dict.hero.datesValue}</p>
            </div>

            {/* 360 tour CTA + Get Directions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <a
                  href={siteConfig.campus360Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-venue-360"
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  {dict.hero.cta360}
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-venue-directions"
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  {dict.venue.getDirections}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>

              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                Virtual tour hosted by FPT University Can Tho.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
