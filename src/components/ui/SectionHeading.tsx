/**
 * SectionHeading — Reusable section heading block.
 *
 * Renders an optional eyebrow label, a heading, and optional supporting copy.
 * Consumers control the heading level (h2 by default) for correct outline order.
 */

import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";

interface SectionHeadingProps {
  /** Small all-caps label above the heading. */
  eyebrow?: string;
  /** Main heading text. */
  heading: string;
  /** Supporting paragraph below the heading. */
  body?: string;
  /** HTML heading element level. Defaults to h2. */
  level?: HeadingLevel;
  /** Text alignment. Defaults to left. */
  align?: "left" | "center";
  /** Whether to show the orange accent underline on the heading. Defaults to true. */
  accent?: boolean;
  /** Additional class names for the wrapper. */
  className?: string;
  /** id placed on the heading element — used for aria-labelledby on the parent section. */
  id?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  body,
  level: Tag = "h2",
  align = "left",
  accent = true,
  className,
  id,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCenter && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow" aria-hidden="false">
          {eyebrow}
        </span>
      )}

      <Tag
        id={id}
        className={cn(
          "text-3xl font-bold leading-tight tracking-tight md:text-4xl",
          accent && "heading-accent",
        )}
        style={{ color: "var(--color-navy)" }}
      >
        {heading}
      </Tag>

      {body && (
        <p
          className={cn(
            "max-w-2xl text-lg leading-relaxed",
            isCenter && "mx-auto",
          )}
          style={{ color: "var(--color-text-secondary)" }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
