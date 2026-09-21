"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Sponsor } from "@/data/sponsors";
import { SponsorCover } from "./SponsorCover";
import { SponsorLogo } from "./SponsorLogo";
import { TierBadge } from "./TierBadge";
import { tierTheme } from "./tier-theme";

interface SponsorModalProps {
  sponsor: Sponsor | null;
  locale: Locale;
  dict: Dictionary;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const socialLabels: Record<keyof NonNullable<Sponsor["socials"]>, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/**
 * Sponsor detail dialog. Centered card on desktop, bottom sheet on mobile.
 * Esc / X / backdrop click close it; background scroll is locked; Tab is trapped.
 * The opener (SponsorGrid) restores focus on close.
 */
export function SponsorModal({ sponsor, locale, dict, onClose }: SponsorModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sponsor) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === first || current === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sponsor, onClose]);

  if (!sponsor) return null;

  const t = dict.sponsorship;
  const theme = tierTheme[sponsor.tier];
  const name = sponsor.name[locale];
  const affiliation = sponsor.affiliation?.[locale];
  const description = sponsor.description?.[locale];
  const highlight = sponsor.highlight?.[locale];
  const facts = sponsor.facts?.[locale] ?? [];
  const tags = sponsor.tags?.[locale] ?? [];
  const legalName = sponsor.legalName;
  const socials = (Object.keys(socialLabels) as (keyof typeof socialLabels)[]).flatMap((key) => {
    const href = sponsor.socials?.[key];
    return href ? [{ key, href }] : [];
  });
  const titleId = `sponsor-modal-title-${sponsor.id}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="partner-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0b1736]/70 backdrop-blur-xs sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="partner-modal-panel relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] outline-none sm:rounded-2xl"
      >
        {/* Sticky so the close button stays reachable while the sheet scrolls */}
        <div className="sticky top-0 z-20 h-0">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[var(--color-navy)] shadow-md backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-blue)]"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <SponsorCover
          sponsor={sponsor}
          className="h-32 w-full sm:h-40"
          sizes="(min-width: 640px) 576px, 100vw"
          hoverZoom={false}
        />

        <div className="flex flex-col gap-4 px-5 pb-5 sm:px-7 sm:pb-7">
          <div
            className="-mt-10 flex h-20 w-32 items-center justify-center rounded-xl bg-white p-2.5 shadow-md"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <SponsorLogo
              sponsor={sponsor}
              name={name}
              className="h-full w-full"
              sizes="128px"
              monogramClassName="h-16 w-16 text-3xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex flex-wrap items-center gap-2">
              <TierBadge tier={sponsor.tier} label={t.tierNames[sponsor.tier]} />
              {sponsor.isMock && (
                <span
                  className="rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase"
                  style={{ backgroundColor: "var(--color-bg-alt)", color: "var(--color-text-secondary)" }}
                >
                  {t.sampleBadge}
                </span>
              )}
            </span>
            <h3
              id={titleId}
              className="m-0 text-2xl font-bold leading-snug"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
            >
              {name}
            </h3>
            {legalName && (
              <p className="m-0 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {legalName}
              </p>
            )}
            {affiliation && (
              <p className="m-0 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                {affiliation}
              </p>
            )}
          </div>

          {description && (
            <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {description}
            </p>
          )}

          {facts.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {facts.map((fact) => (
                <li
                  key={fact}
                  className="rounded-xl px-3 py-1 text-xs font-semibold leading-snug"
                  style={{ backgroundColor: theme.tint, color: theme.text }}
                >
                  {fact}
                </li>
              ))}
            </ul>
          )}

          {tags.length > 0 && (
            <div>
              <p className="m-0 mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                {t.tagsLabel}
              </p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: "var(--color-bg-alt)", color: "var(--color-navy)", border: "1px solid var(--color-border)" }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {highlight && (
            <div className="rounded-xl p-4" style={{ backgroundColor: theme.tint }}>
              <p className="m-0 mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>
                {t.highlightLabel}
              </p>
              <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--color-navy)" }}>
                {highlight}
              </p>
            </div>
          )}

          {(sponsor.websiteUrl || socials.length > 0) && (
            <div
              className="flex flex-wrap items-center gap-3 pt-5"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {sponsor.websiteUrl && (
                <a
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {t.visitWebsiteCta}
                </a>
              )}
              {socials.length > 0 && (
                <ul aria-label={t.socialsLabel} className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {socials.map(({ key, href }) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--color-bg-alt)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-blue)]"
                        style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-navy)" }}
                      >
                        {socialLabels[key]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
