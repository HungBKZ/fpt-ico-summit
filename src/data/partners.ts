/**
 * partners.ts — Partner registry.
 *
 * Rules (AGENTS.md §4 + §9):
 *  - Public UI MUST only render entries where status === "confirmed".
 *  - Never display pending, invited, or hidden partners publicly.
 *  - Logo must be null if no official asset has been provided.
 *  - website may be omitted if not yet confirmed.
 *  - Do not add a partner entry unless the user explicitly instructs it.
 */

export type PartnerStatus = "confirmed" | "pending" | "invited" | "hidden";

export type PartnerType =
  | "university"
  | "consulate"
  | "organization"
  | "sponsor";

export type Partner = {
  /** Display name. */
  name: string;
  /** Country / region the partner represents. */
  country: string;
  /** Categorisation for grouping in the UI. */
  type: PartnerType;
  /**
   * Official logo URL (Cloudinary delivery URL preferred).
   * null = no asset yet — render a text/name placeholder.
   * Do NOT fabricate or download logos.
   */
  logo: string | null;
  /** Visibility status. Public UI filters to "confirmed" only. */
  status: PartnerStatus;
  /** Official partner website URL. Optional. */
  website?: string;
};

/**
 * All partner entries live here.
 *
 * Currently empty — add entries only when the user supplies confirmed details.
 */
export const partners: Partner[] = [];

/**
 * Helper: returns only publicly displayable partners.
 * Import and call this in any component that renders partner logos.
 */
export function getConfirmedPartners(): Partner[] {
  return partners.filter((p) => p.status === "confirmed");
}

/**
 * Helper: returns confirmed partners grouped by type.
 */
export function getConfirmedPartnersByType(): Record<PartnerType, Partner[]> {
  const confirmed = getConfirmedPartners();
  return {
    university:   confirmed.filter((p) => p.type === "university"),
    consulate:    confirmed.filter((p) => p.type === "consulate"),
    organization: confirmed.filter((p) => p.type === "organization"),
    sponsor:      confirmed.filter((p) => p.type === "sponsor"),
  };
}
