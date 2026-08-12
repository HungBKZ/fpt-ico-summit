/**
 * MediaPlaceholder — Graceful fallback for missing images.
 *
 * Renders a styled placeholder that:
 *  - preserves the intended aspect ratio via a padding-bottom trick;
 *  - uses a brand-compatible neutral background;
 *  - shows a label only in development (NODE_ENV check at render time);
 *  - never shows a broken <img> icon;
 *  - is easy to remove when the real image is available.
 *
 * Usage:
 *   import Image from "next/image";
 *   import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
 *   import { images } from "@/data/images";
 *
 *   {images.hero.src ? (
 *     <Image src={images.hero.src} alt={images.hero.alt} fill ... />
 *   ) : (
 *     <MediaPlaceholder label={images.hero.placeholderLabel} ratio="16/10" />
 *   )}
 */

import { cn } from "@/lib/utils";

type AspectRatio =
  | "1/1"
  | "4/3"
  | "3/2"
  | "16/9"
  | "16/10"
  | "2/1"
  | "21/9";

interface MediaPlaceholderProps {
  /** Short label shown in development only (e.g. "A01 · Hero image"). */
  label?: string;
  /** Aspect ratio of the intended image. Defaults to "3/2". */
  ratio?: AspectRatio;
  /** Extra class names for the outer wrapper. */
  className?: string;
  /** Whether to round corners. Defaults to true. */
  rounded?: boolean;
}

const ratioStyles: Record<AspectRatio, string> = {
  "1/1":   "aspect-square",
  "4/3":   "aspect-[4/3]",
  "3/2":   "aspect-[3/2]",
  "16/9":  "aspect-video",
  "16/10": "aspect-[16/10]",
  "2/1":   "aspect-[2/1]",
  "21/9":  "aspect-[21/9]",
};

const isDev = process.env.NODE_ENV !== "production";

export function MediaPlaceholder({
  label,
  ratio = "3/2",
  className,
  rounded = true,
}: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label ?? "Image pending"}
      className={cn(
        "relative w-full overflow-hidden",
        ratioStyles[ratio],
        rounded && "rounded-[var(--radius-md)]",
        className,
      )}
      style={{ backgroundColor: "var(--color-off-white)" }}
    >
      {/* Subtle grid pattern — purely decorative */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${label?.replace(/\s/g, "") ?? "placeholder"}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#grid-${label?.replace(/\s/g, "") ?? "placeholder"})`}
          style={{ color: "var(--color-border)" }}
        />
      </svg>

      {/* Centre icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <svg
          className="h-8 w-8 opacity-40"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.25}
          style={{ color: "var(--color-text-muted)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18a.75.75 0 00.75-.75V6a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75z"
          />
        </svg>

        {/* Label — visible in development only */}
        {isDev && label && (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
