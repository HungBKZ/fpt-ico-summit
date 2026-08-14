/**
 * SiteFooter — Server Component.
 * Hover effects use CSS classes (footer-link, footer-link-accent) — no JS handlers.
 */

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { images } from "@/data/images";
import { mailtoHref } from "@/lib/utils";

const footerLinks = [
  { label: "About",        href: "#about" },
  { label: "Program",      href: "#program" },
  { label: "Explore",      href: "#explore" },
  { label: "Partners",     href: "#partners" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "Venue",        href: "#venue" },
  { label: "FAQ",          href: "#faq" },
  { label: "Registration", href: "#register" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: "var(--color-navy)",
        color: "var(--color-text-inverse)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="site-container" style={{ paddingBlock: "3.5rem 2rem" }}>

        {/* ── Top grid ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link
              href="/"
              aria-label={`${siteConfig.name} — home`}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src={images.summitLogoWhite.src!}
                alt={images.summitLogoWhite.alt}
                width={160}
                height={48}
                style={{
                  height: "2.75rem",
                  width: "auto",
                  maxWidth: "160px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Link>

            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "rgba(255,255,255,0.6)",
                lineHeight: "var(--leading-normal)",
                maxWidth: "22ch",
              }}
            >
              FPT University Can Tho Campus
              <br />
              International Cooperation Office
            </p>

            <p style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.5)" }}>
              {siteConfig.dates}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <p
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "0.875rem",
              }}
            >
              Navigate
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {footerLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="footer-link"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact column */}
          <div>
            <p
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "0.875rem",
              }}
            >
              Contact
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href={mailtoHref(siteConfig.email, "FPT ICO Summit 2026 Enquiry")}
                className="footer-link"
                style={{ fontSize: "var(--text-sm)", wordBreak: "break-all" }}
              >
                {siteConfig.email}
              </a>

              <address
                style={{
                  fontStyle: "normal",
                  fontSize: "var(--text-sm)",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {siteConfig.address}
              </address>

              <a
                href={siteConfig.facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                style={{ fontSize: "var(--text-sm)" }}
              >
                Facebook Page
              </a>

              <a
                href={siteConfig.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-accent"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                }}
              >
                Message ICO
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

              {/* 360 tour CTA */}
              <a
                href={siteConfig.campus360Url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-accent"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                }}
              >
                Explore Campus in 360°
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
            </div>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.4)" }}>
            &copy; {year} {siteConfig.name}. FPT University Can Tho Campus — International Cooperation Office.
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.3)" }}>
            {siteConfig.venue}, Vietnam
          </p>
        </div>

      </div>
    </footer>
  );
}
