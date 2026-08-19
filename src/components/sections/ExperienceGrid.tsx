import Image from "next/image";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { images } from "@/data/images";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface ExperienceGridProps {
  locale: Locale;
  dict: Dictionary;
}

type ChipVariant = "orange" | "blue" | "teal";
type BentoVariant = "wide" | "tall" | "normal";

interface ExperienceCard {
  title: string;
  description: string;
  chip: string;
  chipVariant: ChipVariant;
  variant: BentoVariant;
  image: { src: string | null; alt: string; placeholderLabel?: string };
  objectPosition?: string;
}

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
            alt=""
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

export function ExperienceGrid({ dict }: ExperienceGridProps) {
  const experienceCards: ExperienceCard[] = [
    {
      title: dict.experience.cards.expo.title,
      description: dict.experience.cards.expo.desc,
      chip: dict.experience.cards.expo.category,
      chipVariant: "orange",
      variant: "wide",
      image: images.experienceExpo,
    },
    {
      title: dict.experience.cards.cultural.title,
      description: dict.experience.cards.cultural.desc,
      chip: dict.experience.cards.cultural.category,
      chipVariant: "teal",
      variant: "tall",
      image: images.experienceCultural,
    },
    {
      title: dict.experience.cards.studyAbroad.title,
      description: dict.experience.cards.studyAbroad.desc,
      chip: dict.experience.cards.studyAbroad.category,
      chipVariant: "blue",
      variant: "normal",
      image: images.bentoStudyAbroad,
      objectPosition: "center 30%",
    },
    {
      title: dict.experience.cards.workshop.title,
      description: dict.experience.cards.workshop.desc,
      chip: dict.experience.cards.workshop.category,
      chipVariant: "blue",
      variant: "normal",
      image: images.workshop,
      objectPosition: "center 30%",
    },
    {
      title: dict.experience.cards.performances.title,
      description: dict.experience.cards.performances.desc,
      chip: dict.experience.cards.performances.category,
      chipVariant: "orange",
      variant: "wide",
      image: images.performance,
      objectPosition: "center 35%",
    },
    {
      title: dict.experience.cards.mekong.title,
      description: dict.experience.cards.mekong.desc,
      chip: dict.experience.cards.mekong.category,
      chipVariant: "teal",
      variant: "normal",
      image: images.bentoMekongDiscovery,
      objectPosition: "center 50%",
    },
  ];

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
              eyebrow={dict.experience.eyebrow}
              heading={dict.experience.title}
              body={dict.experience.subtitle}
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
