/**
 * RegistrationCta — Registration section.
 *
 * Layout (desktop): left — eyebrow, heading, date/venue, Register Now, QR.
 *                   right — hanging badge mockup (C1).
 * Mobile: stacked — heading → CTA → QR → badge visual.
 *
 * State logic: siteConfig.registrationUrl non-empty → live CTA + QR visible.
 *
 * Rules:
 *  - QR must remain fully visible; never cropped, overlaid, or distorted.
 *  - No invented ticket types, fees, deadlines, quotas, or eligibility.
 *  - Server Component.
 */

import Image from "next/image";
import { siteConfig } from "@/data/site";
import { images } from "@/data/images";
import { isRegistrationOpen, mailtoHref } from "@/lib/utils";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function RegistrationCta() {
  const open = isRegistrationOpen(siteConfig.registrationUrl);

  return (
    <section
      id="register"
      aria-labelledby="reg-heading"
      className="reg-cta-section"
    >
      {/* Diagonal brand motif — decorative, aria-hidden */}
      <div className="brand-motif" aria-hidden="true" />

      <div className="site-container" style={{ position: "relative", zIndex: 1 }}>
        <div
          className="reg-layout"
          style={{ paddingBlock: "var(--space-section-lg)" }}
        >

          {/* ── LEFT: content column ───────────────────────────────────── */}
          <RevealOnScroll className="reg-left" delay={0}>
            <div>

            {/* Eyebrow */}
            <p className="reg-cta-eyebrow">
              {open ? "Registration is open" : "Coming soon"}
            </p>

            {/* Heading */}
            <h2
              id="reg-heading"
              className="reg-cta-heading"
              style={{ textAlign: "left", maxWidth: "none" }}
            >
              Be part of FPT ICO Summit 2026.
            </h2>

            {/* Body */}
            <p
              className="reg-cta-body"
              style={{ textAlign: "left", maxWidth: "48ch" }}
            >
              {open
                ? "Secure your place at FPT ICO Summit 2026 — three days of international education, cultural exchange and global connections."
                : "Registration information will be announced soon. Check back here for updates, or contact us with any questions."}
            </p>

            {/* Date + venue */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "1.25rem" }}>
              <p style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "rgba(255,255,255,0.82)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {siteConfig.dates}
              </p>
              <p style={{
                fontSize: "var(--text-sm)",
                color: "rgba(255,255,255,0.50)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingLeft: "1.3rem",  /* align under text, past the icon */
              }}>
                {siteConfig.venue}, Vietnam
              </p>
            </div>

            {/* CTA */}
            {open ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginTop: "1.5rem" }}>
                <a
                  href={siteConfig.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-orange-lg cta-attention-once"
                >
                  Register Now
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            ) : (
              <div className="reg-cta-status" style={{ alignSelf: "flex-start", marginTop: "1.5rem" }}>
                <span className="reg-cta-dot" aria-hidden="true" />
                Registration opens soon
              </div>
            )}

            {/* QR — shown when open; white padding keeps it scannable */}
            {open && (
              <div className="reg-qr-block" style={{ marginTop: "1.5rem" }}>
                <p className="reg-qr-label">Scan to register</p>
                <div className="reg-qr-image">
                  <Image
                    src={images.registrationQr.src!}
                    alt={images.registrationQr.alt}
                    width={140}
                    height={140}
                    style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

            {/* Contact nudge */}
            <p className="reg-cta-contact" style={{ marginTop: "1.5rem" }}>
              Questions about participation or partnership?{" "}
              <a href={mailtoHref(siteConfig.email, "FPT ICO Summit 2026 Enquiry")}>
                {siteConfig.email}
              </a>
            </p>
            </div>
          </RevealOnScroll>

          {/* ── RIGHT: hanging badge mockup (C1) ──────────────────────── */}
          <RevealOnScroll className="reg-right" delay={120}>
            <Image
              src={images.badgeHanging.src!}
              alt={images.badgeHanging.alt}
              width={440}
              height={560}
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                display: "block",
                objectFit: "contain",
                filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.50))",
              }}
            />
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
}
