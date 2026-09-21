"use client";

import { useCallback, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { sponsorTierOrder } from "@/data/sponsorship";
import type { Sponsor, SponsorTier } from "@/data/sponsors";
import { SponsorCard } from "./SponsorCard";
import { SponsorModal } from "./SponsorModal";
import { TierBadge } from "./TierBadge";

interface SponsorGridProps {
  sponsors: Sponsor[];
  locale: Locale;
  dict: Dictionary;
}

const tierGrid: Record<SponsorTier, string> = {
  diamond: "grid-cols-1 items-stretch lg:grid-cols-2",
  gold: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  silver: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

/** Sponsors grouped by tier (empty tiers are hidden) + the detail modal. */
export function SponsorGrid({ sponsors, locale, dict }: SponsorGridProps) {
  const t = dict.sponsorship;
  const [active, setActive] = useState<Sponsor | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((sponsor: Sponsor, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActive(sponsor);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    // Return focus to the element that opened the modal.
    triggerRef.current?.focus();
  }, []);

  if (sponsors.length === 0) {
    return (
      <p
        className="m-0 rounded-xl px-6 py-10 text-center text-base font-semibold"
        style={{
          backgroundColor: "var(--color-bg-page)",
          border: "1px dashed var(--color-border-strong)",
          color: "var(--color-navy)",
          fontFamily: "var(--font-display)",
        }}
      >
        {t.emptyTitle}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {sponsorTierOrder.map((tierId) => {
          const items = sponsors.filter((s) => s.tier === tierId);
          if (items.length === 0) return null;

          return (
            <div key={tierId}>
              <h4 className="m-0 mb-3">
                <TierBadge tier={tierId} label={t.tierNames[tierId]} />
              </h4>
              <ul className={`m-0 grid list-none gap-3 p-0 ${tierGrid[tierId]}`}>
                {items.map((sponsor, index) => {
                  // Odd count (>1) on 2-column layout: centre the last card on its own row.
                  const centerLast =
                    tierId === "diamond" && items.length > 1 && items.length % 2 === 1 && index === items.length - 1;
                  return (
                  <li
                    key={sponsor.id}
                    className={`flex ${centerLast ? "lg:col-span-2 lg:w-[calc(50%-0.5rem)] lg:justify-self-center" : ""}`}
                  >
                    <SponsorCard sponsor={sponsor} locale={locale} dict={dict} onOpen={open} />
                  </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <SponsorModal sponsor={active} locale={locale} dict={dict} onClose={close} />
    </>
  );
}
