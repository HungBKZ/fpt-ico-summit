/**
 * site.ts — Stable site-wide configuration and locked event facts.
 *
 * Rule: Do not add values that have not been confirmed.
 * If registrationUrl is empty, the UI must render "Registration opens soon".
 */

import { brandConfig } from "@/lib/config/brand";
import { images } from "@/data/images";

// Canonical URL resolution guardrails:
// - Production: uses NEXT_PUBLIC_SITE_URL if explicitly set and valid, or confirmed VERCEL_PROJECT_PRODUCTION_URL only when VERCEL_ENV is "production".
// - Preview: returns "" to safely omit metadataBase and canonical alternates (prevents self-canonicalizing to ephemeral preview URLs).
// - Development: returns "" to omit canonical.
// - Never blindly falls back to VERCEL_URL or unconfirmed domains.
const getSiteUrl = (): string => {
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "";
};

export const siteConfig = {
  /** Public event name. */
  name: brandConfig.eventNameWithYear,

  /** Configured public domain (empty if unconfigured; avoids claiming unconfirmed domains). */
  domain: getSiteUrl(),

  /** Locked public date range. */
  dates: "20–22 November 2026",

  /** Venue name shown in UI. */
  venue: "FPT University Can Tho Campus",

  /** Full postal address. */
  address: "600 Nguyen Van Cu Noi Dai, An Binh, Can Tho City, Vietnam",

  /** Campus coordinates, verified via the official Google Maps listing. */
  coordinates: {
    lat: 10.0124518,
    lng: 105.7324316,
  },

  /** Official Google Maps short link for the campus — used for "Get Directions" / "Open in Google Maps". */
  campusMapsUrl: "https://maps.app.goo.gl/kGQm6Yv4wX4f25627",

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
   * Registration URL — verified Google Form, registration is OPEN.
   * Components check isRegistrationOpen(registrationUrl) to switch between
   * "Register Now" and "Registration opens soon" states automatically.
   */
  registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSe9hxiepFkN2hutpK0iqGX0w_eL3OAoWhij32MvKysZH-rtdQ/viewform?usp=sharing&ouid=104117891867085264024",

  /** Page metadata used in layout.tsx. */
  meta: {
    title: `${brandConfig.eventNameWithYear} | FPT University Can Tho`,
    description:
      "Mekong Edutourism Summit 2026 connects international education, culture, tourism and global partners through online, hybrid and Summit activities across the Mekong region.",
  },

  /** Social / Open Graph — approved neutral FPT Can Tho campus visual used temporarily until official 1200x630 Mekong OG asset is provided. */
  ogImage: images.campus.src || "",
} as const;

export type SiteConfig = typeof siteConfig;
