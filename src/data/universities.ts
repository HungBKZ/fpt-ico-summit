/**
 * universities.ts — University partners and country taxonomy.
 */

import type { Locale } from "@/i18n/config";

export type InstitutionStatus = "confirmed" | "pending" | "invited" | "hidden";

export type CountryKey =
  | "THAILAND"
  | "CHINA"
  | "KOREA"
  | "AUSTRALIA"
  | "JAPAN"
  | "USA";

export const countryLabels: Record<CountryKey, { en: string; vi: string }> = {
  THAILAND:  { en: "Thailand",  vi: "Thái Lan" },
  CHINA:     { en: "China",     vi: "Trung Quốc" },
  KOREA:     { en: "Korea",     vi: "Hàn Quốc" },
  AUSTRALIA: { en: "Australia", vi: "Úc" },
  JAPAN:     { en: "Japan",     vi: "Nhật Bản" },
  USA:       { en: "USA",       vi: "Hoa Kỳ" },
};

export function getCountryLabel(key: CountryKey, locale: Locale): string {
  return countryLabels[key]?.[locale] || countryLabels[key]?.en || key;
}

export type UniversityEntry = {
  id: string;
  name: string;
  country: CountryKey;
  status: InstitutionStatus;
  website?: string;
};

export const universities: UniversityEntry[] = [];

export function getConfirmedUniversities(): UniversityEntry[] {
  return universities.filter((entry) => entry.status === "confirmed");
}

export const universityCountryKeys: CountryKey[] = [
  "THAILAND",
  "CHINA",
  "KOREA",
  "AUSTRALIA",
  "JAPAN",
  "USA",
];
