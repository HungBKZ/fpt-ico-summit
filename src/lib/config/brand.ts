/**
 * brand.ts — Centralized public event branding configuration.
 *
 * Source of truth for public-facing event identity.
 */

export const brandConfig = {
  eventName: "Mekong Edutourism Summit",
  eventNameWithYear: "Mekong Edutourism Summit 2026",
  shortName: "Mekong Edutourism Summit",
  year: 2026,
  organizer: "FPT University Can Tho Campus",
  office: "International Cooperation Office",
} as const;

export type BrandConfig = typeof brandConfig;
