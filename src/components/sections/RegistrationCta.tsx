/**
 * RegistrationCta — Registration status / call-to-action section.
 *
 * State logic (from siteConfig, never hard-coded here):
 *  - siteConfig.registrationUrl is empty → "Registration opens soon" state.
 *  - siteConfig.registrationUrl is non-empty → "Register Now" live CTA.
 *
 * To open registration: set siteConfig.registrationUrl to the verified URL.
 * No redesign needed — the component switches state automatically.
 *
 * Rules:
 *  - No fake form.
 *  - No invented prices, quotas, deadlines, or eligibility rules.
 *  - Copy from docs/CONTENT.md §13 only.
 *
 * Server Component.
 */

import { siteConfig } from "@/data/site";
import { isRegistrationOpen, mailtoHref } from "@/lib/utils";

export function RegistrationCta() {
  const open = isRegistrationOpen(siteConfig.registrationUrl);

  return (
    <section
      id="register"
      aria-labelledby="reg-heading"
      className="reg-cta-section"
    >
      <div className="site-container">
        <div className="reg-cta-inner">

          {/* Eyebrow */}
          <p className="reg-cta-eyebrow">
            {open ? "Registration" : "Coming soon"}
          </p>

          {/* Heading */}
          <h2 id="reg-heading" className="reg-cta-heading">
            Be part of FPT ICO Summit 2026.
          </h2>

          {/* Body */}
          <p className="reg-cta-body">
            {open
              ? "Secure your place at FPT ICO Summit 2026 — three days of international education, cultural exchange and global connections."
              : "Registration information will be announced soon. Check back here for updates, or contact us with any questions."}
          </p>

          {/* CTA / status */}
          {open ? (
            <a
              href={siteConfig.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-lg"
            >
              Register Now
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
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <div className="reg-cta-status" aria-live="polite">
              <span className="reg-cta-dot" aria-hidden="true" />
              Registration opens soon
            </div>
          )}

          {/* Event date + venue reminder */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem 1.5rem",
              fontSize: "var(--text-sm)",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <span>{siteConfig.dates}</span>
            <span aria-hidden="true">·</span>
            <span>{siteConfig.venue}, Vietnam</span>
          </div>

          {/* Contact nudge */}
          <p className="reg-cta-contact">
            Questions about participation or partnership?{" "}
            <a href={mailtoHref(siteConfig.email, "FPT ICO Summit 2026 Enquiry")}>
              {siteConfig.email}
            </a>
          </p>

        </div>
      </div>
    </section>
  );
}
