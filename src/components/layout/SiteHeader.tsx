"use client";

/**
 * SiteHeader — Accessible, responsive site header with i18n support.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { isRegistrationOpen } from "@/lib/utils";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ClientAuthControl } from "@/components/layout/ClientAuthControl";

interface SiteHeaderProps {
  locale: Locale;
  dict: Dictionary;
}

/** Section anchors tracked by the scrollspy, in page order. Keep in sync with `navSections`. */
const SECTION_IDS = ["about", "partners", "explore", "program", "packages", "sponsorship", "scholarships", "venue", "faq"];

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const moreDropdownRef = useRef<HTMLLIElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const hasRegistration = isRegistrationOpen(siteConfig.registrationUrl);

  // Single list in the same order as the sections appear on the page.
  // `primary` items sit in the desktop bar; the rest go to the "More" dropdown.
  // The mobile menu shows everything in page order.
  const navSections = [
    { label: dict.nav.about, id: "about", primary: true },
    { label: dict.nav.partners, id: "partners", primary: true },
    { label: dict.nav.explore, id: "explore", primary: false },
    { label: dict.nav.program, id: "program", primary: true },
    { label: dict.nav.packages || (locale === "vi" ? "Gói tham gia" : "Packages"), id: "packages", primary: true },
    { label: dict.nav.sponsorship, id: "sponsorship", primary: true },
    { label: dict.nav.scholarships, id: "scholarships", primary: false },
    { label: dict.nav.venue, id: "venue", primary: false },
    { label: dict.nav.faq, id: "faq", primary: false },
  ].map((item) => ({ ...item, href: `#${item.id}` }));

  const primaryNavLinks = navSections.filter((item) => item.primary);
  const moreNavLinks = navSections.filter((item) => !item.primary);
  const allNavLinks = navSections;
  const isMoreActive = moreNavLinks.some((item) => item.id === activeSection);

  // Sticky header transition on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lightweight IntersectionObserver scrollspy
  useEffect(() => {
    const elements = SECTION_IDS
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

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleMoreOutside(e: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleMoreOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleMoreOutside);
    };
  }, [moreOpen]);

  // Close "More" dropdown on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [moreOpen]);

  // Keyboard support for the "More" menu: arrows move between items.
  const focusMoreItem = (target: "first" | "last" | "next" | "prev") => {
    const items = Array.from(moreMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      target === "first" ? 0 : target === "last" ? items.length - 1 : target === "next" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next].focus();
  };

  // Focus the first item when the menu is opened from the keyboard.
  const openMoreFromKey = () => {
    setMoreOpen(true);
    requestAnimationFrame(() => focusMoreItem("first"));
  };

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

  // Close mobile menu on outside click
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
            gap: "1.25rem",
            transition: "height 250ms ease",
          }}
        >
          {/* ── Temporary Event Wordmark ─────────────────────────────── */}
          <Link
            href={`/${locale}`}
            aria-label={`${siteConfig.name} — home`}
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.15,
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontWeight: 700,
                fontSize: scrolled ? "0.9375rem" : "1.0625rem",
                color: "var(--color-navy)",
                letterSpacing: "-0.015em",
                whiteSpace: "nowrap",
                transition: "font-size 250ms ease",
              }}
            >
              Mekong Edutourism Summit
            </span>
            <span
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "var(--color-orange)",
                letterSpacing: "0.04em",
              }}
            >
              2026
            </span>
          </Link>

          {/* ── Compact Desktop Nav with More Dropdown ───────────────── */}
          <nav aria-label="Main navigation" className="hidden lg:flex" style={{ flex: 1, justifyContent: "center" }}>
            <ul
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                whiteSpace: "nowrap",
              }}
            >
              {primaryNavLinks.map(({ label, href, id }) => {
                const isActive = activeSection === id;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className="nav-link"
                      data-active={isActive ? "true" : "false"}
                      aria-current={isActive ? "location" : undefined}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}

              {/* More ▾ Dropdown */}
              <li
                ref={moreDropdownRef}
                style={{ position: "relative" }}
                onBlur={(e) => {
                  // Close when keyboard focus leaves the dropdown.
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMoreOpen(false);
                }}
              >
                <button
                  ref={moreButtonRef}
                  type="button"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      openMoreFromKey();
                    }
                  }}
                  onClick={() => setMoreOpen((prev) => !prev)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  className="nav-link"
                  data-active={isMoreActive ? "true" : "false"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{dict.nav.more || (locale === "vi" ? "Thêm" : "More")}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      transition: "transform 150ms ease",
                      transform: moreOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {moreOpen && (
                  <div
                    ref={moreMenuRef}
                    role="menu"
                    onKeyDown={(e) => {
                      const map: Record<string, "next" | "prev" | "first" | "last"> = {
                        ArrowDown: "next",
                        ArrowUp: "prev",
                        Home: "first",
                        End: "last",
                      };
                      const action = map[e.key];
                      if (action) {
                        e.preventDefault();
                        focusMoreItem(action);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: "175px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(11, 23, 54, 0.10)",
                      boxShadow: "0 10px 25px -5px rgba(11, 23, 54, 0.12), 0 4px 10px rgba(11, 23, 54, 0.04)",
                      padding: "0.4rem",
                      zIndex: 60,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    {moreNavLinks.map(({ label, href, id }) => {
                      const isActive = activeSection === id;
                      return (
                        <a
                          key={href}
                          href={href}
                          role="menuitem"
                          aria-current={isActive ? "location" : undefined}
                          onClick={() => setMoreOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "var(--text-sm)",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? "var(--color-blue)" : "var(--color-navy)",
                            backgroundColor: isActive ? "rgba(26, 94, 168, 0.08)" : "transparent",
                            textDecoration: "none",
                            transition: "background-color 150ms ease, color 150ms ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = "rgba(26, 94, 168, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span>{label}</span>
                          {isActive && (
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "999px",
                                backgroundColor: "var(--color-blue)",
                              }}
                            />
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* ── Desktop Controls: Switcher + Sign In + Primary CTA ─────── */}
          <div className="hidden lg:flex" style={{ flexShrink: 0, alignItems: "center", gap: "0.875rem" }}>
            <LanguageSwitcher currentLocale={locale} ariaLabel={dict.nav.switchLanguage} />
            <ClientAuthControl locale={locale} dict={dict} hideCreateAccount={true} />

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

          {/* ── Mobile Hamburger Toggle ───────────────────────────────── */}
          <button
            ref={toggleRef}
            type="button"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden"
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

        {/* ── Full Mobile Menu Panel ─────────────────────────────────── */}
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          className="mobile-menu-panel"
          style={{
            display: menuOpen ? "block" : "none",
            borderTop: "1px solid rgba(26, 94, 168, 0.12)",
            padding: "1rem 0.75rem 1.25rem",
            backgroundColor: "rgba(250, 250, 248, 0.98)",
            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
            boxShadow: "0 12px 32px -8px rgb(11 23 54 / 0.16)",
            maxHeight: "calc(100vh - 5rem)",
            overflowY: "auto",
          }}
        >
          {/* Primary & Secondary Links List */}
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {allNavLinks.map(({ label, href, id }) => {
              const isActive = activeSection === id;
              return (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="nav-link"
                    data-active={isActive ? "true" : "false"}
                    aria-current={isActive ? "location" : undefined}
                    style={{ fontSize: "var(--text-base)", padding: "0.625rem 0.75rem" }}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Account Area + Primary CTA + Language Switcher */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(11, 23, 54, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {/* Account Area: Sign In & Create Account or Session */}
            <ClientAuthControl
              locale={locale}
              dict={dict}
              mobileLayout={true}
              onNavigate={() => setMenuOpen(false)}
            />

            {/* Primary Action Button: Register Now */}
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

            {/* Language Switcher */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "0.5rem",
                borderTop: "1px dashed rgba(11, 23, 54, 0.08)",
              }}
            >
              <LanguageSwitcher currentLocale={locale} ariaLabel={dict.nav.switchLanguage} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
