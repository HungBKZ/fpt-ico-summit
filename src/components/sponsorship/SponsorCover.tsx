import Image from "next/image";
import type { CSSProperties } from "react";
import type { Sponsor } from "@/data/sponsors";
import { tierTheme } from "./tier-theme";

interface SponsorCoverProps {
  sponsor: Sponsor;
  /** Tailwind sizing classes for the frame, e.g. "aspect-[2/1]" or "h-40". */
  className: string;
  sizes: string;
  /** Extra zoom on hover (only when the parent has the `group` class). */
  hoverZoom?: boolean;
}

/** Fallback gradient per tier, used when a sponsor has no cover image. */
const fallbackGradient: Record<Sponsor["tier"], string> = {
  diamond: "linear-gradient(135deg, #0B1736 0%, #24447D 55%, #3A7FD4 100%)",
  gold: "linear-gradient(135deg, #FBF3DC 0%, #F1DDA0 100%)",
  silver: "linear-gradient(135deg, #EEF1F5 0%, #D5DBE4 100%)",
};

/**
 * Decorative cover banner (alt="" + aria-hidden). Built from <span>s so it can live inside a <button>.
 * Layers: image → uniform navy tint → fade into the white card body at the bottom edge.
 *
 * COVER IMAGE GUIDE for new sponsors: aspect ≥ 2.4:1, at least 1600px wide.
 * Keep text and logos away from the edges — they can be cropped depending on the frame.
 * Use `coverPosition` (object-position) and `coverZoom` to choose the visible area.
 */
export function SponsorCover({ sponsor, className, sizes, hoverZoom = true }: SponsorCoverProps) {
  const zoom = sponsor.coverZoom ?? 1;
  const position = sponsor.coverPosition ?? "center";
  const theme = tierTheme[sponsor.tier];

  const imageStyle = {
    objectPosition: position,
    transformOrigin: position,
    "--cover-zoom": zoom,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={`relative block overflow-hidden ${className}`}
      style={{ background: fallbackGradient[sponsor.tier] }}
    >
      {sponsor.coverUrl ? (
        <>
          <Image
            src={sponsor.coverUrl}
            alt=""
            fill
            sizes={sizes}
            className={`object-cover transition-transform duration-700 ease-out [transform:scale(var(--cover-zoom))] motion-reduce:transition-none ${
              hoverZoom ? "group-hover:[transform:scale(calc(var(--cover-zoom)*1.04))]" : ""
            }`}
            style={imageStyle}
          />
          <span className="absolute inset-0 bg-[#0b1736]/25" />
        </>
      ) : (
        <span
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle at 85% 20%, ${theme.tint} 0, transparent 45%)`,
          }}
        />
      )}
      <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white to-transparent" />
    </span>
  );
}
