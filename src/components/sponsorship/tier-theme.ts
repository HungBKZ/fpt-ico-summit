import type { SponsorTierId } from "@/data/sponsorship";

/** Tier colours, chosen to sit inside the navy / blue palette. */
export interface TierTheme {
  /** Accent for bars, icons and borders. */
  accent: string;
  /** Accessible text colour on the tint background (≥ 4.5:1). */
  text: string;
  /** Light tint for badges and highlighted cells. */
  tint: string;
}

export const tierTheme: Record<SponsorTierId, TierTheme> = {
  diamond: { accent: "#1A5EA8", text: "#0F4A87", tint: "#EAF2FB" },
  gold: { accent: "#C9962B", text: "#7A5606", tint: "#FBF3DC" },
  silver: { accent: "#8593A6", text: "#4A5568", tint: "#EEF1F5" },
};
