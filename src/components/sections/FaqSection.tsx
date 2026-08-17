"use client";

/**
 * FaqSection — Accessible FAQ accordion.
 *
 * Accessibility:
 *  - Each trigger is a <button> with aria-expanded and aria-controls.
 *  - Answer panel has matching id and role="region" with aria-labelledby.
 *  - Keyboard: Enter/Space toggle; no arrow-key navigation needed for simple list.
 *  - Focus ring inherits the global :focus-visible rule.
 *  - Panel height animated via requestAnimationFrame for smooth open/close.
 *  - Respects prefers-reduced-motion — animation skipped via CSS override.
 *
 * Content source: src/data/faq.ts — no answers invented.
 * "use client" required only for open/close state and animation.
 */

import { useRef, useState } from "react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems, type FaqItem } from "@/data/faq";
import { mailtoHref } from "@/lib/utils";
import { siteConfig } from "@/data/site";

/* ── Single accordion item ───────────────────────────────────────────────── */

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerId = `faq-trigger-${item.id}`;
  const panelId  = `faq-panel-${item.id}`;

  /* Animate height: 0 → scrollHeight on open, reverse on close */
  const handleToggle = () => {
    const panel = panelRef.current;
    if (!panel) { onToggle(); return; }

    // Check reduced-motion preference at runtime to skip animation if needed
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isOpen) {
      onToggle(); // flip state first so React removes height:0 inline style
      if (reduced) return;
      requestAnimationFrame(() => {
        const target = panel.scrollHeight;
        panel.style.height = "0px";
        panel.style.overflow = "hidden";
        requestAnimationFrame(() => {
          panel.style.transition = "height 240ms ease";
          panel.style.height = `${target}px`;
          const cleanup = () => {
            panel.style.cssText = "";
            panel.removeEventListener("transitionend", cleanup);
          };
          panel.addEventListener("transitionend", cleanup);
        });
      });
    } else {
      if (reduced) { onToggle(); return; }
      const current = panel.scrollHeight;
      panel.style.height = `${current}px`;
      panel.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.style.transition = "height 200ms ease";
          panel.style.height = "0px";
          const cleanup = () => {
            panel.removeEventListener("transitionend", cleanup);
            panel.style.cssText = "";
            onToggle(); // flip state after animation so panel collapses visually first
          };
          panel.addEventListener("transitionend", cleanup);
        });
      });
    }
  };

  return (
    <div
      className="faq-item"
      data-open={isOpen ? "true" : "false"}
    >
      <button
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="faq-trigger"
        onClick={handleToggle}
      >
        <span>{item.question}</span>
        {/* Chevron icon */}
        <svg
          className="faq-chevron"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-labelledby={triggerId}
        className="faq-panel"
        style={isOpen ? undefined : { height: 0, overflow: "hidden" }}
      >
        <div className="faq-panel-inner">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section--tinted"
    >
      <div className="site-container section-padding">
        <div className="faq-layout">

          {/* Left — intro */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="faq-heading"
                eyebrow="FAQ"
                heading="Frequently Asked Questions"
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            <p style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-normal)",
              maxWidth: "36ch",
            }}>
              Can&apos;t find what you&apos;re looking for? Reach out directly and we&apos;ll
              get back to you.
            </p>

            <a
              href={mailtoHref(siteConfig.email, "FPT ICO Summit 2026 Enquiry")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-blue)",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
            >
              {siteConfig.email}
              {/* Arrow icon */}
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
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Right — accordion */}
          <div
            className="faq-list"
            role="list"
          >
            {faqItems.map((item, index) => (
              <RevealOnScroll key={item.id} delay={index * 70}>
                <div role="listitem">
                  <FaqItem
                    item={item}
                    isOpen={openId === item.id}
                    onToggle={() => toggle(item.id)}
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
