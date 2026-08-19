import Image from "next/image";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface MekongSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export function MekongSection({ dict }: MekongSectionProps) {
  return (
    <section
      id="mekong"
      aria-labelledby="mekong-heading"
      className="mekong-section"
    >
      {/* Background image — A09 */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      >
        {images.mekong.src ? (
          <Image
            src={images.mekong.src}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        ) : (
          <MediaPlaceholder
            label={images.mekong.placeholderLabel}
            ratio="16/9"
            rounded={false}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="mekong-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="site-container mekong-content">
        <div
          style={{
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              color: "#34D399",
            }}
          >
            {dict.mekong.eyebrow}
          </p>

          {/* Heading */}
          <h2 id="mekong-heading" className="mekong-heading">
            {dict.mekong.title}
          </h2>

          {/* Body */}
          <p className="mekong-body">
            {dict.mekong.subtitle}
          </p>

          {/* PRE-EVENT callout chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#34D399", flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.03em",
              }}
            >
              PRE-EVENT · 20 November 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
