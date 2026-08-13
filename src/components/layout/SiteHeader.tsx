"use client";

/**
 * SiteHeader — Accessible, responsive site header.
 *
 * Needs "use client" only for: scroll detection, menu open state, keyboard/click handlers.
 * Hover effects use CSS classes (nav-link, btn-primary) — no onMouse* handlers.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { isRegistrationOpen } from "@/lib/utils";

const navLinks = [
  { label: "About",       href: "#about" },
  { label: "Program",     href: "#program" },
  { label: "Explore",     href: "#explore" },
  { label: "Partners",    href: "#partners" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "Venue",       href: "#venue" },
  { label: "FAQ",         href: "#faq" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const hasRegistration = isRegistrationOpen(siteConfig.registrationUrl);

  // Sticky shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--color-warm-white)",
        borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "box-shadow var(--transition-base), border-color var(--transition-base)",
      }}
    >
      <div className="site-container" ref={menuRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "4rem",
            gap: "1.5rem",
          }}
        >
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-orange)",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.02em",
                flexShrink: 0,
              }}
            >
              FPT
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--color-navy)",
                lineHeight: 1.2,
              }}
            >
              ICO Summit{" "}
              <span style={{ color: "var(--color-orange)" }}>2026</span>
            </span>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden md:flex">
            <ul
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.125rem",
              }}
            >
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="nav-link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Desktop CTA ───────────────────────────────────────────── */}
          <div className="hidden md:flex" style={{ flexShrink: 0 }}>
            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Register Now
              </a>
            ) : (
              <span
                aria-label="Registration opens soon"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.5rem 1.25rem",
                  border: "1.5px solid var(--color-border-strong)",
                  color: "var(--color-text-muted)",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  borderRadius: "var(--radius-full)",
                  cursor: "default",
                  whiteSpace: "nowrap",
                }}
              >
                Registration opens soon
              </span>
            )}
          </div>

          {/* ── Mobile hamburger ──────────────────────────────────────── */}
          <button
            ref={toggleRef}
            type="button"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "var(--color-navy)",
              flexShrink: 0,
            }}
          >
            <span aria-hidden="true">
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </span>
          </button>
        </div>

        {/* ── Mobile menu panel ─────────────────────────────────────────── */}
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          style={{
            display: menuOpen ? "block" : "none",
            borderTop: "1px solid var(--color-border)",
            paddingBlock: "1rem",
          }}
        >
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="nav-link"
                  style={{ fontSize: "var(--text-base)", padding: "0.625rem 0.75rem" }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1rem", paddingInline: "0.75rem" }}>
            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: "100%", fontSize: "var(--text-base)", padding: "0.75rem" }}
              >
                Register Now
              </a>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                  padding: "0.5rem",
                }}
              >
                Registration opens soon
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
