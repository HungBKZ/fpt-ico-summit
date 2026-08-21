"use client";

/**
 * SiteHeader — Accessible, responsive site header with i18n support.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { images } from "@/data/images";
import { isRegistrationOpen } from "@/lib/utils";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ClientAuthControl } from "@/components/layout/ClientAuthControl";

interface SiteHeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const hasRegistration = isRegistrationOpen(siteConfig.registrationUrl);

  const navLinks = [
    { label: dict.nav.about,        href: "#about" },
    { label: dict.nav.program,      href: "#program" },
    { label: dict.nav.explore,      href: "#explore" },
    { label: dict.nav.partners,     href: "#partners" },
    { label: dict.nav.scholarships,  href: "#scholarships" },
    { label: dict.nav.venue,        href: "#venue" },
    { label: dict.nav.faq,          href: "#faq" },
  ];

  // Sticky header transition on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lightweight IntersectionObserver scrollspy
  useEffect(() => {
    const sectionIds = ["about", "program", "explore", "partners", "scholarships", "venue", "faq"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
        backgroundColor: scrolled ? "rgba(250, 250, 248, 0.88)" : "rgba(250, 250, 248, 0.98)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: scrolled ? "1px solid rgba(26, 94, 168, 0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 8px 24px -4px rgb(11 23 54 / 0.12)" : "none",
        transition: "height 250ms ease, background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease",
      }}
    >
      <div className="site-container" ref={menuRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: scrolled ? "3.875rem" : "4.5rem",
            gap: "1.5rem",
            transition: "height 250ms ease",
          }}
        >
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href={`/${locale}`}
            aria-label={`${siteConfig.name} — home`}
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <Image
              src={images.summitLogoColor.src!}
              alt={images.summitLogoColor.alt}
              width={260}
              height={70}
              priority
              style={{
                height: scrolled ? "2.65rem" : "3.15rem",
                width: "auto",
                maxWidth: "260px",
                objectFit: "contain",
                display: "block",
                transition: "height 250ms ease",
              }}
            />
          </Link>

          {/* ── Desktop nav with scrollspy ───────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden lg:flex" style={{ flex: 1, justifyContent: "center" }}>
            <ul
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                whiteSpace: "nowrap",
              }}
            >
              {navLinks.map(({ label, href }) => {
                const sectionId = href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className="nav-link"
                      data-active={isActive ? "true" : "false"}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Desktop Controls (Switcher + Auth + CTA) ────────────────────── */}
          <div className="hidden md:flex" style={{ flexShrink: 0, alignItems: "center", gap: "0.875rem" }}>
            <LanguageSwitcher currentLocale={locale} ariaLabel={dict.nav.switchLanguage} />
            <ClientAuthControl locale={locale} dict={dict} />

            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
                style={{ gap: "0.375rem" }}
              >
                {dict.nav.registerNow}
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "transform 200ms ease" }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            ) : (
              <span
                aria-label={dict.nav.registrationOpensSoon}
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
                {dict.nav.registrationOpensSoon}
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
              transition: "border-color 150ms ease, background-color 150ms ease",
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
          className="mobile-menu-panel"
          style={{
            display: menuOpen ? "block" : "none",
            borderTop: "1px solid rgba(26, 94, 168, 0.12)",
            paddingBlock: "1rem",
            backgroundColor: "rgba(250, 250, 248, 0.98)",
            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
            boxShadow: "0 12px 32px -8px rgb(11 23 54 / 0.16)",
          }}
        >
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navLinks.map(({ label, href }) => {
              const sectionId = href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="nav-link"
                    data-active={isActive ? "true" : "false"}
                    style={{ fontSize: "var(--text-base)", padding: "0.625rem 0.75rem" }}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div
            style={{
              marginTop: "1rem",
              paddingInline: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "0.25rem" }}>
              <LanguageSwitcher currentLocale={locale} ariaLabel={dict.nav.switchLanguage} />
            </div>

            {hasRegistration ? (
              <a
                href={siteConfig.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: "100%", fontSize: "var(--text-base)", padding: "0.75rem", gap: "0.5rem" }}
              >
                {dict.nav.registerNow}
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
                {dict.nav.registrationOpensSoon}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
