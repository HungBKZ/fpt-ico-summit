"use client";

import { useRef, useState } from "react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/data/faq";
import { mailtoHref } from "@/lib/utils";
import { siteConfig } from "@/data/site";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { getLocalizedText } from "@/i18n/types";

interface FaqSectionProps {
  locale: Locale;
  dict: Dictionary;
}

function FaqAccordionItem({
  index,
  questionStr,
  answerStr,
  id,
  isOpen,
  onToggle,
}: {
  index: number;
  questionStr: string;
  answerStr: string;
  id: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerId = `faq-trigger-${id}`;
  const panelId  = `faq-panel-${id}`;

  const handleToggle = () => {
    const panel = panelRef.current;
    if (!panel) { onToggle(); return; }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isOpen) {
      onToggle();
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
            onToggle();
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
        <span className="faq-trigger-content">
          <span className="faq-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="faq-question-text">{questionStr}</span>
        </span>
        <span className="faq-chevron-wrap">
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
        </span>
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
          {answerStr}
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ locale, dict }: FaqSectionProps) {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            <RevealOnScroll>
              <SectionHeading
                id="faq-heading"
                eyebrow={dict.faq.eyebrow}
                heading={dict.faq.title}
                level="h2"
                align="left"
                accent={true}
              />
            </RevealOnScroll>

            <p style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-normal)",
              maxWidth: "38ch",
            }}>
              {dict.faq.subtitle}
            </p>

            <a
              href={mailtoHref(siteConfig.email, "FPT ICO Summit 2026 Enquiry")}
              className="faq-contact-card"
            >
              <span className="faq-contact-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16v16H4z" opacity="0" />
                  <path d="M22 6l-10 7L2 6" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="faq-contact-label">
                  {locale === "vi" ? "Vẫn còn thắc mắc?" : "Still have questions?"}
                </span>
                <span className="faq-contact-email">{siteConfig.email}</span>
              </span>
              <svg
                aria-hidden="true"
                className="faq-contact-arrow"
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
          </div>

          {/* Right — accordion */}
          <div
            className="faq-list"
            role="list"
          >
            {faqItems.map((item, index) => {
              const qStr = getLocalizedText(item.question, locale);
              const aStr = getLocalizedText(item.answer, locale);
              return (
                <RevealOnScroll key={item.id} delay={index * 70}>
                  <div role="listitem">
                    <FaqAccordionItem
                      index={index}
                      id={item.id}
                      questionStr={qStr}
                      answerStr={aStr}
                      isOpen={openId === item.id}
                      onToggle={() => toggle(item.id)}
                    />
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
