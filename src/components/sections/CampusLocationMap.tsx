import type { Dictionary } from "@/i18n/types";

interface CampusLocationMapProps {
  dict: Dictionary;
  venueName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  mapsUrl: string;
}

/**
 * Live campus location — a real, embedded Google Map (no API key required)
 * framed with an elegant overlay card. Accurate address/coordinates only;
 * no illustrative or fabricated map elements.
 */
export function CampusLocationMap({
  dict,
  venueName,
  address,
  coordinates,
  mapsUrl,
}: CampusLocationMapProps) {
  const embedSrc = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=17&output=embed`;

  return (
    <div
      className="relative h-[380px] w-full overflow-hidden rounded-2xl border sm:h-[420px]"
      style={{
        borderColor: "var(--color-border)",
        boxShadow: "0 20px 45px -20px rgba(11, 23, 54, 0.35)",
      }}
    >
      <iframe
        src={embedSrc}
        title={venueName}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />

      {/* Legibility scrim behind the overlay card */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgba(11,23,54,0.85) 0%, rgba(11,23,54,0.45) 55%, transparent 100%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p
            className="truncate text-base font-bold text-white sm:text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {venueName}
          </p>
          <p className="mt-1 line-clamp-2 max-w-sm text-xs text-white/80 sm:text-sm">
            {address}
          </p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={dict.venue.mapAriaLabel}
          className="btn-primary shrink-0"
        >
          {dict.venue.openInMaps}
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
