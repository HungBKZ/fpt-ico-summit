"use client";

/**
 * LanguageSwitcher — Accessible EN | VI language toggle.
 *
 * Requirements:
 *  - Royal blue / navy styling (var(--color-navy, #0B1736)).
 *  - Active locale clearly visible, inactive clickable.
 *  - Preserves current hash/anchor link and scroll position when switching.
 *  - Accessible with aria-label and keyboard navigation.
 */

import { usePathname, useRouter } from "next/navigation";
import { Locale, locales } from "@/i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  ariaLabel?: string;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  ariaLabel = "Switch language",
  className = "",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    let newPath = pathname || `/${targetLocale}`;
    for (const loc of locales) {
      if (newPath === `/${loc}` || newPath.startsWith(`/${loc}/`)) {
        newPath = newPath.replace(`/${loc}`, `/${targetLocale}`);
        break;
      }
    }
    if (!newPath.startsWith(`/${targetLocale}`)) {
      newPath = `/${targetLocale}`;
    }

    const targetUrl = `${newPath}${hash}`;
    router.push(targetUrl, { scroll: false });

    // Restore scroll position in place so page doesn't jump to the bottom
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        if (hash) {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            return;
          }
        }
        window.scrollTo({ top: currentScrollY, behavior: "instant" as ScrollBehavior });
      });
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.375rem",
        borderRadius: "var(--radius-full, 9999px)",
        backgroundColor: "rgba(11, 23, 54, 0.04)",
        border: "1px solid rgba(11, 23, 54, 0.12)",
      }}
    >
      {locales.map((loc, idx) => {
        const isActive = loc === currentLocale;
        return (
          <span key={loc} style={{ display: "inline-flex", alignItems: "center" }}>
            {idx > 0 && (
              <span
                aria-hidden="true"
                style={{
                  color: "rgba(11, 23, 54, 0.25)",
                  fontSize: "0.75rem",
                  marginInline: "0.15rem",
                  userSelect: "none",
                }}
              >
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSwitch(loc)}
              aria-current={isActive ? "true" : undefined}
              aria-label={`Switch to ${loc === "en" ? "English" : "Vietnamese"}`}
              style={{
                background: isActive ? "var(--color-navy, #0B1736)" : "transparent",
                color: isActive ? "#FFFFFF" : "var(--color-navy, #0B1736)",
                border: "none",
                borderRadius: "var(--radius-full, 9999px)",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.04em",
                cursor: isActive ? "default" : "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
                lineHeight: 1,
              }}
            >
              {loc.toUpperCase()}
            </button>
          </span>
        );
      })}
    </div>
  );
}
