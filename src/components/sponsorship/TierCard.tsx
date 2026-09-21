import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SponsorTierInfo } from "@/data/sponsorship";
import { CheckIcon } from "./icons";
import { tierTheme } from "./tier-theme";

interface TierCardProps {
  tier: SponsorTierInfo;
  locale: Locale;
  dict: Dictionary;
  ctaHref: string;
}

interface Spark {
  top: string;
  left: string;
  size: number;
  delay: string;
  /** Drift direction while fading out. */
  dx: string;
  dy: string;
}

/** Effect strength: Diamond (10 sparks) > Gold (2 sparks) > Silver (no sparks, sheen only). */
const sparks: Record<SponsorTierInfo["id"], Spark[]> = {
  diamond: [
    { top: "10%", left: "8%", size: 14, delay: "0s", dx: "-10px", dy: "-12px" },
    { top: "18%", left: "86%", size: 10, delay: "0.35s", dx: "12px", dy: "-10px" },
    { top: "48%", left: "94%", size: 16, delay: "0.7s", dx: "14px", dy: "0px" },
    { top: "78%", left: "88%", size: 11, delay: "0.2s", dx: "10px", dy: "12px" },
    { top: "88%", left: "12%", size: 13, delay: "0.9s", dx: "-12px", dy: "12px" },
    { top: "52%", left: "3%", size: 9, delay: "0.5s", dx: "-14px", dy: "0px" },
    { top: "4%", left: "48%", size: 12, delay: "1.2s", dx: "0px", dy: "-12px" },
    { top: "94%", left: "52%", size: 12, delay: "0.1s", dx: "0px", dy: "12px" },
    { top: "30%", left: "96%", size: 8, delay: "1.4s", dx: "12px", dy: "-6px" },
    { top: "66%", left: "2%", size: 8, delay: "1s", dx: "-12px", dy: "6px" },
  ],
  gold: [
    { top: "12%", left: "88%", size: 10, delay: "0s", dx: "8px", dy: "-8px" },
    { top: "84%", left: "8%", size: 9, delay: "0.7s", dx: "-8px", dy: "8px" },
  ],
  silver: [],
};

function formatFee(feeVnd: number, locale: Locale): string {
  return locale === "vi"
    ? `${feeVnd.toLocaleString("vi-VN")} VNĐ`
    : `${feeVnd.toLocaleString("en-US")} VND`;
}

export function TierCard({ tier, locale, dict, ctaHref }: TierCardProps) {
  const t = dict.sponsorship;
  const theme = tierTheme[tier.id];
  const name = t.tierNames[tier.id];

  return (
    <article
      aria-labelledby={`tier-${tier.id}-name`}
      className={`tier-card tier-card--${tier.id} relative flex flex-col overflow-hidden rounded-2xl bg-white`}
      style={{ border: "1px solid var(--color-border)" }}
    >
      {/* Hover-only decorative sparks (styled per tier in globals.css) */}
      {sparks[tier.id].map((spark, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="tier-card__spark"
          style={
            {
              top: spark.top,
              left: spark.left,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              "--dx": spark.dx,
              "--dy": spark.dy,
            } as CSSProperties
          }
        />
      ))}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3
            id={`tier-${tier.id}-name`}
            className="m-0 text-xl font-bold uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
          >
            {name}
          </h3>
          {tier.featured && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: theme.accent }}
            >
              {t.featured}
            </span>
          )}
        </div>

        <div>
          <p
            className="m-0 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t.feeLabel}
          </p>
          <p
            className="m-0 mt-0.5 text-xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: theme.text }}
          >
            {formatFee(tier.feeVnd, locale)}
          </p>
        </div>

        <div className="flex-1 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p
            className="m-0 mb-2.5 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t.keyBenefitsLabel}
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {tier.highlights.map((item) => (
              <li
                key={item.en}
                className="flex items-start gap-2 text-[0.8125rem] leading-snug"
                style={{ color: "var(--color-text-primary)" }}
              >
                <span className="mt-0.5">
                  <CheckIcon size={14} color={theme.accent} />
                </span>
                <span>{item[locale]}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full"
        >
          {dict.packages.cta}
        </a>
      </div>
    </article>
  );
}
