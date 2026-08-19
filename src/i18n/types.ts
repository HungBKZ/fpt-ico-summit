/**
 * i18n/types.ts — Localization types and helpers.
 */

import { Locale } from "./config";

export type LocalizedText = {
  en: string;
  vi: string;
};

export type Dictionary = {
  nav: {
    about: string;
    program: string;
    explore: string;
    partners: string;
    scholarships: string;
    venue: string;
    faq: string;
    registerNow: string;
    registrationOpensSoon: string;
    switchLanguage: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleAccent1: string;
    titleLine2: string;
    titleAccent2: string;
    description: string;
    ctaExplore: string;
    cta360: string;
    ctaRegister: string;
    dateLabel: string;
    venueLabel: string;
    datesValue: string;
    venueValue: string;
  };
  stats: {
    stat1: { number: string; label: string; desc: string };
    stat2: { number: string; label: string; desc: string };
    stat3: { number: string; label: string; desc: string };
    stat4: { number: string; label: string; desc: string };
  };
  pillars: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: {
      p1: { title: string; desc: string };
      p2: { title: string; desc: string };
      p3: { title: string; desc: string };
      p4: { title: string; desc: string };
    };
  };
  experience: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: {
      expo: { category: string; title: string; desc: string };
      cultural: { category: string; title: string; desc: string };
      studyAbroad: { category: string; title: string; desc: string };
      workshop: { category: string; title: string; desc: string };
      performances: { category: string; title: string; desc: string };
      mekong: { category: string; title: string; desc: string };
    };
  };
  program: {
    eyebrow: string;
    title: string;
    subtitle: string;
    slots: { morning: string; afternoon: string; evening: string };
    continuousTitle: string;
    continuousSubtitle: string;
  };
  expo: { eyebrow: string; title: string; subtitle: string };
  workshops: { eyebrow: string; title: string; subtitle: string };
  partners: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabs: { all: string; universities: string; consulates: string };
    emptyState: string;
  };
  scholarships: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabs: { all: string; university: string; consulate: string };
    emptyState: string;
  };
  mekong: { eyebrow: string; title: string; subtitle: string; cta360: string };
  venue: {
    eyebrow: string;
    title: string;
    subtitle: string;
    addressLabel: string;
    dateLabel: string;
    datesValue: string;
    getDirections: string;
  };
  souvenirs: { eyebrow: string; title: string; subtitle: string };
  faq: { eyebrow: string; title: string; subtitle: string };
  registration: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    scanQr: string;
    datesLabel: string;
    venueLabel: string;
    datesValue: string;
    venueValue: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    contact: string;
    email: string;
    address: string;
    socials: string;
    facebook: string;
    messenger: string;
    copyright: string;
  };
  meta: { title: string; description: string };
};

/**
 * Safely extracts localized string for the active locale.
 * Falls back to English if the translation is missing.
 */
export function getLocalizedText(
  value: string | LocalizedText | undefined | null,
  locale: Locale
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || "";
}
