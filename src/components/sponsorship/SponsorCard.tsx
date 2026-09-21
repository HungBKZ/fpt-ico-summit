import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Sponsor } from "@/data/sponsors";
import { SponsorCover } from "./SponsorCover";
import { SponsorLogo } from "./SponsorLogo";
import { TierBadge } from "./TierBadge";
import { tierTheme } from "./tier-theme";

interface SponsorCardProps {
  sponsor: Sponsor;
  locale: Locale;
  dict: Dictionary;
  onOpen: (sponsor: Sponsor, trigger: HTMLElement) => void;
}

const baseClass =
  "group flex w-full cursor-pointer rounded-2xl bg-white text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]";

function SampleBadge({ label }: { label: string }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase"
      style={{ backgroundColor: "var(--color-bg-alt)", color: "var(--color-text-secondary)" }}
    >
      {label}
    </span>
  );
}

/** One clickable sponsor tile. Size and content depend on the tier. */
export function SponsorCard({ sponsor, locale, dict, onOpen }: SponsorCardProps) {
  const t = dict.sponsorship;
  const theme = tierTheme[sponsor.tier];
  const name = sponsor.name[locale];
  const description = sponsor.description?.[locale];
  const affiliation = sponsor.affiliation?.[locale];
  const facts = sponsor.facts?.[locale]?.slice(0, 3) ?? [];
  const allTags = sponsor.tags?.[locale] ?? [];
  const tags = allTags.slice(0, 4);
  const extraTags = allTags.length - tags.length;
  const ariaLabel = `${t.viewDetails}: ${name}`;
  const handle = (e: React.MouseEvent<HTMLButtonElement>) => onOpen(sponsor, e.currentTarget);

  if (sponsor.tier === "diamond") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        className={`${baseClass} flex-col overflow-hidden hover:shadow-[0_18px_40px_-16px_rgba(58,127,212,0.55)]`}
        style={{
          border: "2px solid transparent",
          background:
            "linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #9DD0FF 0%, #1A5EA8 50%, #7FB4F0 100%) border-box",
          boxShadow: "0 12px 32px -16px rgba(26, 94, 168, 0.4)",
        }}
      >
        <span className="relative block">
          <SponsorCover
            sponsor={sponsor}
            className="aspect-[3/1] w-full"
            sizes="(min-width: 1024px) 560px, 100vw"
          />
          <span className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <TierBadge tier="diamond" label={t.tierNames.diamond} size="sm" />
            {sponsor.isMock && <SampleBadge label={t.sampleBadge} />}
          </span>
        </span>

        <span className="relative flex flex-1 flex-col gap-2.5 px-5 pb-5">
          <span
            className="-mt-8 flex h-16 w-28 items-center justify-center rounded-xl bg-white p-1.5 shadow-md"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <SponsorLogo
              sponsor={sponsor}
              name={name}
              className="h-full w-full"
              sizes="112px"
              monogramClassName="h-11 w-11 text-xl"
            />
          </span>
          <span
            className="text-lg font-bold leading-snug"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
          >
            {name}
          </span>
          {affiliation && (
            <span className="-mt-2 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              {affiliation}
            </span>
          )}
          {description && (
            <span className="line-clamp-3 text-[0.8125rem] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {description}
            </span>
          )}
          {facts.length > 0 && (
            <span className="flex flex-wrap gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-lg px-2.5 py-0.5 text-[0.6875rem] font-semibold leading-snug"
                  style={{ backgroundColor: theme.tint, color: theme.text }}
                >
                  {fact}
                </span>
              ))}
            </span>
          )}
          {tags.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
                  style={{ backgroundColor: "var(--color-bg-alt)", color: "var(--color-navy)", border: "1px solid var(--color-border)" }}
                >
                  {tag}
                </span>
              ))}
              {extraTags > 0 && (
                <span className="rounded-md px-2 py-0.5 text-[0.6875rem] font-bold" style={{ color: "var(--color-text-muted)" }}>
                  +{extraTags}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
    );
  }

  if (sponsor.tier === "gold") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        className={`${baseClass} flex-col overflow-hidden`}
        style={{ border: `1px solid ${theme.accent}` }}
      >
        <SponsorCover
          sponsor={sponsor}
          className="aspect-[3/1] w-full"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        />
        <span className="flex flex-1 flex-col items-start gap-3 px-5 pb-5">
          <span
            className="-mt-8 flex h-16 w-28 items-center justify-center rounded-xl bg-white p-2 shadow"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <SponsorLogo
              sponsor={sponsor}
              name={name}
              className="h-full w-full"
              sizes="112px"
              monogramClassName="h-11 w-11 text-xl"
            />
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <TierBadge tier="gold" label={t.tierNames.gold} size="sm" />
            {sponsor.isMock && <SampleBadge label={t.sampleBadge} />}
          </span>
          <span
            className="text-base font-bold leading-snug"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-navy)" }}
          >
            {name}
          </span>
          {description && (
            <span className="line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {description}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      className={`${baseClass} flex-col items-center gap-3 p-4 text-center`}
      style={{ border: "1px solid var(--color-border)" }}
    >
      <SponsorLogo
        sponsor={sponsor}
        name={name}
        className="h-14 w-full"
        sizes="(min-width: 1024px) 22vw, 45vw"
        monogramClassName="h-14 w-14 text-xl"
      />
      <span className="text-sm font-semibold leading-snug" style={{ color: "var(--color-navy)" }}>
        {name}
      </span>
      {sponsor.isMock && <SampleBadge label={t.sampleBadge} />}
    </button>
  );
}
