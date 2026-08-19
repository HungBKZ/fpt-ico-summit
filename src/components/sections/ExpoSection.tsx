import Image from "next/image";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";
import { getConfirmedExpoItems } from "@/data/expo";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getLocalizedText } from "@/i18n/types";

interface ExpoSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export function ExpoSection({ locale, dict }: ExpoSectionProps) {
  const expoItems = getConfirmedExpoItems();

  return (
    <section
      id="expo"
      aria-labelledby="expo-heading"
      className="section--navy"
    >
      <div className="site-container section-padding">
        <div className="expo-layout" style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="expo-heading"
                className="section-heading--invert"
                eyebrow={dict.expo.eyebrow}
                heading={dict.expo.title}
                body={dict.expo.subtitle}
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["42 planned areas", dict.hero.datesValue].map((fact) => (
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

        <div className="expo-zones-grid" role="list" aria-label="Expo zones">
          {expoItems.map((zone, index) => {
            const titleStr = getLocalizedText(zone.title, locale);
            const descStr = getLocalizedText(zone.description, locale);
            return (
              <RevealOnScroll key={zone.id} delay={index * 80}>
                <div className="expo-zone-card" role="listitem">
                  <p className="expo-zone-number">Zone {String(index + 1).padStart(2, "0")}</p>
                  <h3 className="expo-zone-title">{titleStr}</h3>
                  <p className="expo-zone-desc">{descStr}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
