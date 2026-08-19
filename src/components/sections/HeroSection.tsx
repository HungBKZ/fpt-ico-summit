"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { images } from "@/data/images";
import { siteConfig } from "@/data/site";
import { isRegistrationOpen } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface HeroSectionProps {
  locale: Locale;
  dict: Dictionary;
}

export function HeroSection({ dict }: HeroSectionProps) {
  const hasRegistration = isRegistrationOpen(siteConfig.registrationUrl);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY <= 900) {
            setParallaxY(window.scrollY * 0.14);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="hero"
      aria-label="FPT ICO Summit 2026 introduction"
      className="hero-section"
    >
      {/* ── Background image ──────── */}
      <div
        aria-hidden="true"
        className="hero-bg-layer"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          transform: `translate3d(0, ${parallaxY}px, 0)`,
          willChange: "transform",
        }}
      >
        {images.hero.src ? (
          <Image
            src={images.hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <MediaPlaceholder
              label={images.hero.placeholderLabel}
              ratio="16/9"
              rounded={false}
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      {/* ── Gradient overlay ────────── */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="site-container hero-content" style={{ paddingBlock: "5rem 4rem" }}>
        <div
          style={{
            maxWidth: "640px",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          {/* Eyebrow */}
          <p
            className="hero-eyebrow-animate"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              color: "var(--color-blue-light)",
            }}
          >
            {dict.hero.eyebrow}
          </p>

          {/* H1 */}
          <h1 className="hero-h1 hero-h1-animate">
            {dict.hero.titleLine1}{" "}
            <span className="accent">{dict.hero.titleAccent1}</span>
            <br />
            {dict.hero.titleLine2}{" "}
            <span className="accent">{dict.hero.titleAccent2}</span>
          </h1>

          {/* Support copy */}
          <p
            className="hero-desc-animate"
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-normal)",
              color: "rgba(255,255,255,0.82)",
              maxWidth: "52ch",
            }}
          >
            {dict.hero.description}
          </p>

          {/* Meta line — date · venue */}
          <div className="hero-meta hero-meta-animate">
            <span>{dict.hero.datesValue}</span>
            <span className="hero-meta-dot" aria-hidden="true" />
            <span>{dict.hero.venueValue}</span>
          </div>

          {/* CTAs */}
          <div
            className="hero-cta-animate"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            {/* Primary — scroll to explore */}
            <a href="#explore" className="btn-blue-lg">
              {dict.hero.ctaExplore}
            </a>

            {/* Secondary — 360 campus tour */}
            <a
              href={siteConfig.campus360Url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white"
            >
              <svg
                aria-hidden="true"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
              </svg>
              {dict.hero.cta360}
              <span className="sr-only">(opens in a new tab)</span>
            </a>

            {/* Registration state */}
            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-orange-lg"
              >
                {dict.hero.ctaRegister}
              </a>
            ) : (
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 500,
                  paddingInline: "0.25rem",
                }}
                aria-label={dict.nav.registrationOpensSoon}
              >
                {dict.nav.registrationOpensSoon}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom fade ────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "5rem",
          background:
            "linear-gradient(to bottom, transparent, var(--color-warm-white))",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </section>
  );
}
