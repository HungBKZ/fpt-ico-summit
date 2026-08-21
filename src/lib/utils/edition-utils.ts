/**
 * src/lib/utils/edition-utils.ts
 *
 * Pure utility functions for deriving valid Summit day keys from SummitEdition dates.
 * No hardcoded dates — all derivation uses edition startDate/endDate/timezone.
 */

import type { SummitEdition } from "@/lib/db/models/summit-edition";

/**
 * Derives valid summit day keys (YYYY-MM-DD) from SummitEdition start/end dates
 * in the edition's timezone.
 */
export function getEditionDayKeys(edition: SummitEdition): string[] {
  const tz = edition.timezone || "Asia/Ho_Chi_Minh";
  const days: string[] = [];

  // Clone start date and iterate day by day
  const cursor = new Date(edition.startDate);
  const end = new Date(edition.endDate);

  // Safety: max 30 days to prevent infinite loops
  let guard = 0;
  while (cursor <= end && guard < 30) {
    const dateStr = cursor.toLocaleDateString("en-CA", { timeZone: tz }); // "YYYY-MM-DD"
    days.push(dateStr);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }

  return days;
}

/**
 * Validates that a dayKey belongs to the given edition's date range.
 */
export function isValidDayKey(dayKey: string, edition: SummitEdition): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
  const validDays = getEditionDayKeys(edition);
  return validDays.includes(dayKey);
}

/**
 * Formats a dayKey for display: "2026-11-21" → "21 Nov" using locale-aware formatting.
 */
export function formatDayKeyLabel(dayKey: string, locale: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Returns the current day key in the edition timezone, or null if today is outside the edition range.
 */
export function getCurrentDayKeyIfInRange(edition: SummitEdition): string | null {
  const tz = edition.timezone || "Asia/Ho_Chi_Minh";
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const validDays = getEditionDayKeys(edition);
  return validDays.includes(todayStr) ? todayStr : null;
}
