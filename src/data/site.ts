/**
 * site.ts — Stable site-wide configuration and locked event facts.
 *
 * Rule: Do not add values that have not been confirmed.
 * If registrationUrl is empty, the UI must render "Registration opens soon".
 */

export const siteConfig = {
  /** Public event name — never use the older "Mekong Global Summit" name in UI. */
  name: "FPT ICO Summit 2026",

  /** Working domain (update when live). */
  domain: "https://fpticosummit.com",

  /** Locked public date range. */
  dates: "20–22 November 2026",

  /** Venue name shown in UI. */
  venue: "FPT University Can Tho Campus",

  /** Full postal address. */
  address: "600 Nguyen Van Cu Noi Dai, An Binh, Can Tho City, Vietnam",

  /** ICO contact email. */
  email: "FPTUCT.HTQT@fe.edu.vn",

  /** External 360 campus tour — open in new tab, no iframe for MVP. */
  campus360Url: "https://cantho.fpt.edu.vn/360-tour/",

  /** Social links for ICO contact and messaging. */
  facebookPageUrl:
    "https://www.facebook.com/profile.php?id=61577438391152&locale=vi_VN",
  messengerUrl:
    "https://www.facebook.com/messages/t/61577438391152/",

  /**
   * Registration URL.
   * Leave as empty string until a verified URL is supplied.
   * Components should check: registrationUrl || null → show "opens soon" state.
   */
  registrationUrl: "",

  /** Page metadata used in layout.tsx. */
  meta: {
    title: "FPT ICO Summit 2026 | FPT University Can Tho",
    description:
      "FPT ICO Summit 2026 brings students, universities, consulates and global partners together for international education, cultural exchange and future-ready learning. 20–22 November 2026, FPT University Can Tho Campus, Vietnam.",
  },

  /** Social / Open Graph — supply a Cloudinary URL when asset A14 is ready. */
  ogImage: "",
} as const;

export type SiteConfig = typeof siteConfig;
