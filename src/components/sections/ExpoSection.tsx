/**
 * ExpoSection — International Expo overview.
 *
 * Layout (desktop): intro text + zone cards full-width below.
 * Image slot (A05) on the right of the intro; MediaPlaceholder when null.
 *
 * Content source: docs/CONTENT.md §8, src/data/program.ts expoZones.
 * Server Component.
 */

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";
import { expoZones } from "@/data/program";

export function ExpoSection() {
  return (
    <section
      id="expo"
      aria-labelledby="expo-heading"
      style={{ backgroundColor: "var(--color-off-white)" }}
    >
      <div className="site-container section-padding">

        {/* ── Intro layout: text left, image right ───────────────────────── */}
        <div className="expo-layout" style={{ marginBottom: "3rem" }}>

          {/* Left — heading + intro copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <SectionHeading
              id="expo-heading"
              eyebrow="International Expo"
              heading="One summit. Multiple ways to connect globally."
              body="The International Expo is planned as the central connection space of FPT ICO Summit 2026, bringing education, culture and international engagement together on campus."
              level="h2"
              align="left"
              accent={true}
            />

            {/* Quick-fact chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["42 planned areas", "21–22 November"].map((fact) => (
                <span
                  key={fact}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.3rem 0.875rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--color-navy)",
                  }}
                >
                  {fact}
                </span>
              ))}
            </div>
          </div>

          {/* Right — A05 image */}
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {images.experienceExpo.src ? (
              <div style={{ position: "relative", aspectRatio: "3 / 2" }}>
                <Image
                  src={images.experienceExpo.src}
                  alt={images.experienceExpo.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <MediaPlaceholder
                label={images.experienceExpo.placeholderLabel}
                ratio="3/2"
                rounded={false}
              />
            )}
          </div>
        </div>

        {/* ── Zone cards ─────────────────────────────────────────────────── */}
        <div className="expo-zones-grid" role="list" aria-label="Expo zones">
          {expoZones.map((zone, index) => (
            <div key={zone.label} className="expo-zone-card" role="listitem">
              <p className="expo-zone-number">Zone {String(index + 1).padStart(2, "0")}</p>
              <h3 className="expo-zone-title">{zone.label}</h3>
              <p className="expo-zone-desc">{zone.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
