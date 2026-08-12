/**
 * images.ts — Centralised photographic asset registry.
 *
 * Rules:
 *  - ALL image src values must live here; never scatter URLs inside components.
 *  - Set src: null for any asset not yet uploaded to Cloudinary.
 *  - Components must render <MediaPlaceholder> when src is null.
 *  - placeholderLabel is shown only in development as a layout aid.
 *  - alt text must describe the intended final content.
 *  - When an asset is ready, paste its Cloudinary delivery URL into src.
 *
 * Asset IDs match docs/ASSETS.md (A01–A14).
 * Cloud name: dvucotc8z
 */

export type SiteImage = {
  /** Cloudinary delivery URL, or null if not yet available. */
  src: string | null;
  /** Descriptive alt text for the intended final image. */
  alt: string;
  /** Optional photographer / source / license note. */
  credit?: string;
  /** Short label displayed in the placeholder tile (dev aid only). */
  placeholderLabel?: string;
};

export const images = {
  /**
   * A01 — Hero
   * Section: Hero above the fold
   * Ratio: 16:10 or 3:2  |  Min: 2400 px wide
   * Cloudinary: fpt-ico-summit/homepage/hero/
   */
  hero: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502398/hero-fpt-cultural-performance-01_gd9e83.png",
    alt: "Cultural performance at FPT University",
    placeholderLabel: "A01 · Hero image",
  } satisfies SiteImage,

  /**
   * A02 — Connect Cultures
   * Section: Pillars / About
   * Ratio: 4:3  |  Min: 1600 px wide
   * Cloudinary: fpt-ico-summit/homepage/pillars/
   */
  pillarCultures: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502397/Connect-Cultures_bncwsl.jpg",
    alt: "Students connecting through international cultural exchange",
    placeholderLabel: "A02 · Connect Cultures",
  } satisfies SiteImage,

  /**
   * A03 — Global Study / Consultation
   * Section: Pillars / Experience
   * Ratio: 4:3  |  Min: 1600 px wide
   * Cloudinary: fpt-ico-summit/homepage/pillars/
   */
  pillarStudy: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502398/Study-Abroad_clj0n9.jpg",
    alt: "Students exploring international study opportunities",
    placeholderLabel: "A03 · Global Study / Consultation",
  } satisfies SiteImage,

  /**
   * A04 — Global Partnership / Institutional
   * Section: About / credibility
   * Ratio: 4:3 or 3:2  |  Source: internal FPT photo preferred
   * Cloudinary: fpt-ico-summit/homepage/pillars/
   */
  pillarPartnership: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502398/meeting_rw4o6t.jpg",
    alt: "International partnership meeting at FPT University",
    placeholderLabel: "A04 · Global Partnership",
  } satisfies SiteImage,

  /**
   * A05 — International Expo
   * Section: Experience grid
   * Ratio: 3:2  |  Min: 1800 px wide
   * Cloudinary: fpt-ico-summit/homepage/experience/
   */
  experienceExpo: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502397/booth-trien-lam_nv9oxe.jpg",
    alt: "International education exhibition booth",
    placeholderLabel: "A05 · International Expo",
  } satisfies SiteImage,

  /**
   * A06 — Cultural Village
   * Section: Experience grid
   * Ratio: 4:3
   * Cloudinary: fpt-ico-summit/cultural/
   */
  experienceCultural: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502398/van-hoa-qt_tnwtma.jpg",
    alt: "International cultural exchange activities",
    placeholderLabel: "A06 · Cultural Village",
  } satisfies SiteImage,

  /**
   * A07 — Workshop / Academic learning
   * Section: Workshop
   * Ratio: 16:10 or 3:2  |  Min: 1800 px wide
   * Cloudinary: fpt-ico-summit/program/
   */
  workshop: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502400/speaker-audience_hcfbsz.jpg",
    alt: "Guest speaker presenting to a student audience",
    placeholderLabel: "A07 · Workshop",
  } satisfies SiteImage,

  /**
   * A08 — Cultural Performance
   * Section: Experience / Program
   * Ratio: 3:2
   * Cloudinary: fpt-ico-summit/cultural/
   */
  performance: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786502397/bieu-dien-van-hoa_tj0dyb.jpg",
    alt: "International cultural performance",
    placeholderLabel: "A08 · Cultural Performance",
  } satisfies SiteImage,

  /**
   * A09 — Mekong / Can Tho — MUST HAVE
   * Section: Mekong storytelling section
   * Ratio: 16:9 or 2:1 panoramic  |  Min: 2400 px wide
   * Cloudinary: fpt-ico-summit/mekong/
   * Note: Do not caption a generic Mekong photo as a specific Can Tho landmark.
   */
  mekong: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786506842/A09-bieu-dien-nhac-cu-tren-cho-noi_wlbuws.webp",
    alt: "Traditional musical performance on a boat in the Mekong Delta",
    placeholderLabel: "A09 · Mekong / Can Tho",
  } satisfies SiteImage,

  /**
   * A10 — FPT University Can Tho Campus — MUST HAVE
   * Section: Venue
   * Ratio: 16:9  |  Min: 2000 px wide  |  Source: official FPT image preferred
   * Cloudinary: fpt-ico-summit/campus/
   */
  campus: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786506842/A10-CT_wonoya.jpg",
    alt: "Main building of FPT University Can Tho Campus",
    placeholderLabel: "A10 · FPT Can Tho Campus",
  } satisfies SiteImage,

  /**
   * A14 — Open Graph / social sharing preview
   * Ratio: 1200×630
   * Cloudinary: fpt-ico-summit/social/
   */
  ogHome: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786512975/A14-ICO-Summit_ldtgju.png",
    alt: "FPT ICO Summit 2026 social preview image for the event homepage",
    placeholderLabel: "A14 · OG / Social preview",
  } satisfies SiteImage,

  // ---------------------------------------------------------------------------
  // Bento grid supplementary assets
  // ---------------------------------------------------------------------------

  /**
   * B01 — Study Abroad Consultation
   * Section: Experience grid — Study Abroad & Scholarships card
   * Ratio: 4:3 (normal bento card)
   * Cloudinary: fpt-ico-summit/homepage/experience/
   */
  bentoStudyAbroad: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786508950/B01-Tu-van_bw9v6q.jpg",
    alt: "Students receiving study abroad consultation",
    placeholderLabel: "B01 · Study Abroad Consultation",
  } satisfies SiteImage,

  /**
   * B02 — Mekong Discovery
   * Section: Experience grid — Mekong Discovery card
   * Ratio: 4:3 (normal bento card)
   * Cloudinary: fpt-ico-summit/mekong/
   */
  bentoMekongDiscovery: {
    src: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786508951/B2-mekong-delta_fwwoyl.jpg",
    alt: "Mekong Delta cultural discovery experience",
    placeholderLabel: "B02 · Mekong Discovery",
  } satisfies SiteImage,
} as const;

export type Images = typeof images;
export type ImageKey = keyof Images;
