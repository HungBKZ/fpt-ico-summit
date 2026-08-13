/**
 * ExperienceGrid — Bento-style "Experience the Summit" section.
 *
 * Desktop layout (3-col grid):
 *   [International Expo — wide, span 2] [Cultural Village — tall, span 2 rows]
 *   [Study Abroad]  [Cross-Cultural Workshop]
 *   [Live Performances — wide, span 2]  [Mekong Discovery]
 *
 * Tablet: 2-col, all cards equal height.
 * Mobile: single column stack.
 *
 * Content source: docs/CONTENT.md §5.
 * Server Component.
 */

import Image from "next/image";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";

/* ── Experience card data ────────────────────────────────────────────────── */

type ChipVariant = "orange" | "blue" | "teal";
type BentoVariant = "wide" | "tall" | "normal";

interface ExperienceCard {
  title: string;
  description: string;
  chip: string;
  chipVariant: ChipVariant;
  variant: BentoVariant;
  image: { src: string | null; alt: string; placeholderLabel?: string };
  /** CSS object-position for the background image. Defaults to "center center". */
  objectPosition?: string;
  anchorHref?: string;
}

const experienceCards: ExperienceCard[] = [
  {
    title: "International Expo",
    description:
      "Meet international education partners and explore programs, pathways and global opportunities in one place.",
    chip: "Expo",
    chipVariant: "orange",
    variant: "wide",
    image: images.experienceExpo,
  },
  {
    title: "Cultural Village",
    description:
      "Discover traditions, languages, performances, crafts and interactive cultural experiences from participating communities.",
    chip: "Culture",
    chipVariant: "teal",
    variant: "tall",
    image: images.experienceCultural,
  },
  {
    title: "Study Abroad & Scholarships",
    description:
      "Access practical information about admissions, scholarships, exchange opportunities and future study pathways.",
    chip: "Education",
    chipVariant: "blue",
    variant: "normal",
    image: images.bentoStudyAbroad,
    // Consultation scene — keep faces/upper body in frame
    objectPosition: "center 30%",
  },
  {
    title: "Cross-Cultural Workshop",
    description:
      "Build communication and adaptability skills for international study and multicultural work in the AI era.",
    chip: "Workshop",
    chipVariant: "blue",
    variant: "normal",
    image: images.workshop,
    // Speaker/audience — bias upward to keep faces/stage in frame
    objectPosition: "center 30%",
  },
  {
    title: "Live Performances",
    description:
      "Celebrate cultural expression through music, traditional performance, fashion and student-led showcases.",
    chip: "Performances",
    chipVariant: "orange",
    variant: "wide",
    image: images.performance,
    // Performers on stage — slight upward bias preserves costumes and faces
    objectPosition: "center 35%",
  },
  {
    title: "Mekong Discovery",
    description:
      "Experience the culture and hospitality of Can Tho and the Mekong Delta as part of the summit journey.",
    chip: "Mekong",
    chipVariant: "teal",
    variant: "normal",
    image: images.bentoMekongDiscovery,
    // Landscape/river scene — center keeps horizon and context visible
    objectPosition: "center 50%",
  },
];

/* ── Sub-component: individual bento card ───────────────────────────────── */

function BentoCard({ card }: { card: ExperienceCard }) {
  const variantClass =
    card.variant === "wide"
      ? "bento-card bento-card--wide"
      : card.variant === "tall"
        ? "bento-card bento-card--tall"
        : "bento-card";

  return (
    <article className={variantClass} aria-label={card.title}>
      {/* Background image or placeholder */}
      <div className="bento-card__image">
        {card.image.src ? (
          <Image
            src={card.image.src}
            alt=""           /* decorative — title/desc in content layer */
            fill
            sizes={
              card.variant === "wide"
                ? "(min-width: 1024px) 66vw, 100vw"
                : card.variant === "tall"
                  ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            style={{
              objectFit: "cover",
              objectPosition: card.objectPosition ?? "center center",
            }}
          />
        ) : (
          <MediaPlaceholder
            label={card.image.placeholderLabel}
            ratio={card.variant === "wide" ? "16/9" : card.variant === "tall" ? "3/2" : "4/3"}
            rounded={false}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="bento-card__overlay" aria-hidden="true" />

      {/* Text content */}
      <div className="bento-card__content">
        <span className={`bento-card__chip bento-card__chip--${card.chipVariant}`}>
          {card.chip}
        </span>
        <h3 className="bento-card__title">{card.title}</h3>
        <p className="bento-card__desc">{card.description}</p>
      </div>
    </article>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function ExperienceGrid() {
  return (
    <section
      id="explore"
      aria-labelledby="experience-heading"
      className="section--navy"
    >
      <div className="site-container section-padding">

        {/* Section header */}
        <div style={{ marginBottom: "3rem" }}>
          <RevealOnScroll>
            <SectionHeading
              id="experience-heading"
              className="section-heading--invert"
              eyebrow="Experience the Summit"
              heading="Six ways to discover, connect and grow."
              body="FPT ICO Summit 2026 is built around experiences — each one designed to bring students, educators and global partners together in a meaningful way."
              level="h2"
              align="left"
              accent={true}
            />
          </RevealOnScroll>
        </div>

        {/* Bento grid */}
        <div className="bento-grid" role="list">
          {experienceCards.map((card, index) => (
            <div key={card.title} role="listitem">
              <RevealOnScroll delay={index * 80}>
                <BentoCard card={card} />
              </RevealOnScroll>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
