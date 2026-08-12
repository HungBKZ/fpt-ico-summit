/**
 * HeroSection — Above-the-fold hero for FPT ICO Summit 2026.
 *
 * Layout:
 *  - Full-bleed navy background with a dark gradient overlay.
 *  - Right-side hero image (A01) rendered with next/image fill + priority.
 *  - Left: eyebrow · H1 · support copy · meta line · two CTAs.
 *  - Gracefully handles src: null via MediaPlaceholder.
 *  - Registration CTA shows "Registration opens soon" state when URL is empty.
 *  - Server Component — no interactivity needed here.
 *
 * Content source: docs/CONTENT.md §2.
 */

import Image from "next/image";
import { images } from "@/data/images";
import { siteConfig } from "@/data/site";
import { isRegistrationOpen } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";

export function HeroSection() {
  const hasRegistration = isRegistrationOpen(siteConfig.registrationUrl);

  return (
    <section
      id="hero"
      aria-label="FPT ICO Summit 2026 introduction"
      className="hero-section"
    >
      {/* ── Background image (right-aligned, fades left into navy) ──────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        {images.hero.src ? (
          <Image
            src={images.hero.src}
            alt=""               /* decorative; real alt is in the section heading */
            fill
            priority             /* LCP image — preload */
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
        ) : (
          /* Placeholder fills the hero background when image is null */
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

      {/* ── Gradient overlay — ensures text contrast on any image ────────── */}
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
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              color: "var(--color-orange-light)",
            }}
          >
            FPT University Can Tho · International Cooperation Office
          </p>

          {/* H1 */}
          <h1 className="hero-h1">
            Connecting{" "}
            <span className="accent">Cultures.</span>
            <br />
            Creating Global{" "}
            <span className="accent">Opportunities.</span>
          </h1>

          {/* Support copy */}
          <p
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-normal)",
              color: "rgba(255,255,255,0.82)",
              maxWidth: "52ch",
            }}
          >
            FPT ICO Summit 2026 brings students, universities, consulates and
            global partners together for international education, cultural
            exchange and future-ready learning.
          </p>

          {/* Meta line — date · venue */}
          <div className="hero-meta">
            <span>{siteConfig.dates}</span>
            <span className="hero-meta-dot" aria-hidden="true" />
            <span>{siteConfig.venue}, Vietnam</span>
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            {/* Primary — scroll to about / program */}
            <a href="#about" className="btn-primary-lg">
              Explore the Summit
            </a>

            {/* Secondary — 360 campus tour */}
            <a
              href={siteConfig.campus360Url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white"
            >
              {/* Globe icon */}
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
              Explore Campus in 360°
              <span className="sr-only">(opens in a new tab)</span>
            </a>

            {/* Registration state */}
            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white"
              >
                Register Now
              </a>
            ) : (
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 500,
                  paddingInline: "0.25rem",
                }}
                aria-label="Registration opens soon"
              >
                Registration opens soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom fade into page background ────────────────────────────── */}
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
