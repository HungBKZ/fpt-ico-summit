/**
 * WorkshopSection — workshop overview built from centralized workshop data.
 *
 * Data source: src/data/workshops.ts.
 * Server Component.
 */

import Image from "next/image";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";
import { getConfirmedWorkshops } from "@/data/workshops";

const topics = [
  "Cross-cultural communication strategies",
  "Adapting to international academic environments",
  "Building global competence for study and work",
  "AI as a tool in multicultural contexts",
];

export function WorkshopSection() {
  const confirmedWorkshops = getConfirmedWorkshops();
  const workshop = confirmedWorkshops[0];

  return (
    <section
      id="workshop"
      aria-labelledby="workshop-heading"
      className="section--navy workshop-section"
    >
      <div className="site-container section-padding">
        <div className="workshop-layout">
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {images.workshop.src ? (
              <div style={{ position: "relative", aspectRatio: "16 / 10" }}>
                <Image
                  src={images.workshop.src}
                  alt={images.workshop.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  style={{ objectFit: "cover", objectPosition: "center 25%" }}
                />
              </div>
            ) : (
              <MediaPlaceholder
                label={images.workshop.placeholderLabel}
                ratio="16/10"
                rounded={false}
              />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="workshop-heading"
                className="section-heading--invert"
                eyebrow="Workshop"
                heading={workshop?.title ?? "Workshop to be announced"}
                body={
                  workshop?.description ??
                  "Confirmed workshop details will be announced soon."
                }
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  letterSpacing: "var(--tracking-wider)",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.72)",
                  marginBottom: "0.25rem",
                }}
              >
                Topics covered
              </p>
              {topics.map((topic) => (
                <div
                  key={topic}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                    fontSize: "var(--text-sm)",
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color: "var(--color-blue-light)",
                      flexShrink: 0,
                      marginTop: "0.1em",
                    }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {topic}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.25rem" }}>
              <span className="workshop-tag">21–22 November 2026</span>
              <span className="workshop-tag">FPT University Can Tho Campus</span>
            </div>

            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "rgba(255,255,255,0.72)",
                borderLeft: "2px solid rgba(255,255,255,0.22)",
                paddingLeft: "0.75rem",
                lineHeight: "var(--leading-normal)",
              }}
            >
              Speaker details will be announced as participation is confirmed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
