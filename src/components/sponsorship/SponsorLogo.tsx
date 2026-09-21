import Image from "next/image";
import type { Sponsor } from "@/data/sponsors";
import { tierTheme } from "./tier-theme";

interface SponsorLogoProps {
  sponsor: Sponsor;
  name: string;
  /** Tailwind size classes for the frame, e.g. "h-20 w-full". */
  className: string;
  sizes: string;
  /** Monogram frame size for sponsors without a logo. */
  monogramClassName?: string;
}

/** Logo with object-contain; falls back to a monogram when no logo exists. */
export function SponsorLogo({ sponsor, name, className, sizes, monogramClassName }: SponsorLogoProps) {
  if (sponsor.logoUrl) {
    return (
      <span className={`relative block ${className}`}>
        <Image
          src={sponsor.logoUrl}
          alt={name}
          fill
          sizes={sizes}
          unoptimized={sponsor.logoUrl.endsWith(".svg")}
          className="object-contain"
        />
      </span>
    );
  }

  const theme = tierTheme[sponsor.tier];
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-xl font-bold ${monogramClassName ?? "h-16 w-16 text-2xl"}`}
      style={{
        backgroundColor: theme.tint,
        color: theme.text,
        border: `1px solid ${theme.accent}`,
        fontFamily: "var(--font-display)",
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
