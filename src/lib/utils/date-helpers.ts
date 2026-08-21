/**
 * src/lib/utils/date-helpers.ts
 *
 * Deterministic date utilities for Asia/Ho_Chi_Minh timezone handling.
 * Prevents client/server timezone serialization shifts (e.g. 30/09 -> 29/09).
 */

const HO_CHI_MINH_TZ = "Asia/Ho_Chi_Minh";

/**
 * Parses YYYY-MM-DD input from HTML date controls and normalizes it to end-of-day
 * in Asia/Ho_Chi_Minh timezone (23:59:59.999) stored as UTC Date object.
 */
export function parseInputDateToUtc(dateStr?: string | null): Date | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;

  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return undefined;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;

  // Create date at end of day (23:59:59.999) in UTC adjusted for UTC+7 (Asia/Ho_Chi_Minh)
  // Asia/Ho_Chi_Minh is UTC+7 -> 23:59:59.999 ICT = 16:59:59.999 UTC
  const utcDate = new Date(Date.UTC(year, month, day, 16, 59, 59, 999));
  return utcDate;
}

/**
 * Formats a Date object cleanly for HTML date input controls (YYYY-MM-DD)
 * using Asia/Ho_Chi_Minh local calendar date.
 */
export function formatDateForInput(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  // Convert to Asia/Ho_Chi_Minh string and format YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: HO_CHI_MINH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Formats a Date object into human-readable text in Asia/Ho_Chi_Minh timezone.
 */
export function formatDateAsiaHoChiMinh(
  dateInput?: Date | string | null,
  locale: string = "en"
): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    timeZone: HO_CHI_MINH_TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Determines whether an application deadline has passed according to Asia/Ho_Chi_Minh timezone.
 */
export function isDeadlineExpiredAsiaHoChiMinh(
  deadlineInput?: Date | string | null
): boolean {
  if (!deadlineInput) return false; // Absent deadline = no expiration
  const deadline = new Date(deadlineInput);
  if (isNaN(deadline.getTime())) return false;

  const now = new Date();
  return deadline.getTime() < now.getTime();
}
