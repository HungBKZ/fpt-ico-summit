/**
 * utils.ts — Shared utility helpers.
 */

/**
 * Merges class names, filtering out falsy values.
 * Keeps dependency count at zero — no clsx/cn package needed for MVP.
 *
 * @example
 *   cn("base-class", isActive && "active", undefined, "other")
 *   // → "base-class active other"
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Returns true when the registration URL is a valid, non-empty string.
 * Components should call this rather than checking the URL directly.
 */
export function isRegistrationOpen(url: string | undefined | null): boolean {
  return typeof url === "string" && url.trim().length > 0;
}

/**
 * Builds a mailto href with an optional subject line.
 */
export function mailtoHref(email: string, subject?: string): string {
  if (subject) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
  return `mailto:${email}`;
}

/**
 * Safely escapes special regex metacharacters in user query string.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
