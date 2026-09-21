import type { SponsorTierId } from "@/data/sponsorship";

interface TierBadgeProps {
  tier: SponsorTierId;
  label: string;
  /** "sm" for cards, "md" for headings and the modal. */
  size?: "sm" | "md";
}

/** Tier badge. Diamond gets a faceted gem, shine sweep and sparkles; Gold/Silver get a metallic gradient with a subtler shine. */
export function TierBadge({ tier, label, size = "md" }: TierBadgeProps) {
  const sizeClass =
    size === "sm" ? "px-2.5 py-0.5 text-[0.6875rem]" : "px-3.5 py-1 text-xs";

  if (tier === "diamond") {
    return (
      <span className={`diamond-badge ${sizeClass}`}>
        <svg
          aria-hidden="true"
          className="diamond-badge__gem"
          width={size === "sm" ? 12 : 14}
          height={size === "sm" ? 12 : 14}
          viewBox="0 0 24 24"
        >
          <path d="M6 3h12l4 6-10 12L2 9z" fill="#E6F3FF" />
          <path d="M2 9h20L12 21z" fill="#9DD0FF" />
          <path d="M6 3l3 6 3-6 3 6 3-6M9 9l3 12 3-12" fill="none" stroke="#3A7FD4" strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <span>{label}</span>
        <span aria-hidden="true" className="diamond-badge__spark" style={{ top: 3, right: 9 }} />
        <span aria-hidden="true" className="diamond-badge__spark" style={{ bottom: 3, right: 22, width: 4, height: 4, animationDelay: "1.1s" }} />
      </span>
    );
  }

  return (
    <span className={`metal-badge metal-badge--${tier} ${sizeClass}`}>
      <svg
        aria-hidden="true"
        width={size === "sm" ? 11 : 13}
        height={size === "sm" ? 11 : 13}
        viewBox="0 0 24 24"
        fill="currentColor"
        opacity="0.85"
      >
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />
      </svg>
      <span>{label}</span>
    </span>
  );
}
