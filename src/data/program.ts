/**
 * program.ts — Confirmed program schedule for FPT ICO Summit 2026.
 *
 * SOURCE OF TRUTH: This file reflects the confirmed schedule.
 * Do not revert to any earlier Word planning document.
 * Do not publish session times until confirmed.
 *
 * Structure:
 *  - programDays: the 3-day schedule (date, label, sessions per time slot)
 *  - continuousActivities: activities running across both Summit days (21–22 Nov)
 *  - expoZones: the International Expo zone categories
 */

// ---------------------------------------------------------------------------
// Day schedule
// ---------------------------------------------------------------------------

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface ProgramActivity {
  title: string;
}

export interface ProgramDay {
  /** ISO date string — used for display only, not for logic. */
  date: string;
  /** Short label rendered as a badge/eyebrow. */
  dayLabel: string;
  /** Day theme title. */
  title: string;
  /** One-sentence description of the day's character. */
  description: string;
  /** Thematic icon key — resolved to an SVG in the component. */
  icon: "compass" | "flag" | "star";
  /** Activities grouped by time slot. Only include slots that have content. */
  slots: Partial<Record<TimeSlot, ProgramActivity[]>>;
}

export const programDays: ProgramDay[] = [
  {
    date: "20 November 2026",
    dayLabel: "Day 1",
    title: "Mekong Discovery",
    description:
      "Welcome activities and cultural experiences introduce international guests to Can Tho and the Mekong Delta.",
    icon: "compass",
    slots: {
      // Full-day experience — no morning/afternoon split published yet.
    },
  },
  {
    date: "21 November 2026",
    dayLabel: "Day 2",
    title: "Summit Day 1",
    description:
      "The official summit opens with ceremony and cultural performance, followed by networking, activities and the International Expo.",
    icon: "flag",
    slots: {
      morning: [
        { title: "Check-in" },
        { title: "Opening Ceremony" },
        { title: "Opening cultural performance by FPT University" },
      ],
      afternoon: [
        { title: "Cultural performances by participating countries and FPT University" },
        { title: "Networking" },
        { title: "Lucky Spin" },
        { title: "Cultural Quiz" },
      ],
    },
  },
  {
    date: "22 November 2026",
    dayLabel: "Day 3",
    title: "Summit Day 2",
    description:
      "The summit concludes with performances, networking, an awards ceremony, Friendship Concert and International Fashion Show.",
    icon: "star",
    slots: {
      morning: [
        { title: "Check-in" },
      ],
      afternoon: [
        { title: "Cultural performances by participating countries and FPT University" },
        { title: "Networking" },
        { title: "Lucky Spin" },
        { title: "Cultural Quiz" },
      ],
      evening: [
        { title: "Awards Ceremony" },
        { title: "Friendship Concert" },
        { title: "International Fashion Show" },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Continuous activities — run throughout 21 & 22 November
// ---------------------------------------------------------------------------

export interface ContinuousActivity {
  title: string;
  description: string;
  icon: "globe" | "book" | "award" | "chat";
}

export const continuousActivities: ContinuousActivity[] = [
  {
    title: "International Expo",
    description:
      "Meet international education partners and explore programs, pathways and global opportunities.",
    icon: "globe",
  },
  {
    title: "Study Abroad Consultation",
    description:
      "Access practical guidance on admissions, exchange programs and international study pathways.",
    icon: "book",
  },
  {
    title: "Scholarship Interviews",
    description:
      "Connect directly with partner institutions and learn about scholarship opportunities.",
    icon: "award",
  },
  {
    title: "Workshop: Cross-Cultural Communication in the AI Era",
    description:
      "Build communication and adaptability skills for international study and multicultural work.",
    icon: "chat",
  },
];

// ---------------------------------------------------------------------------
// Expo zones — used in the Expo section
// ---------------------------------------------------------------------------

export interface ExpoZone {
  label: string;
  description: string;
}

export const expoZones: ExpoZone[] = [
  {
    label: "International Partner Zone",
    description:
      "Meet education partners and explore programs, pathways and global opportunities.",
  },
  {
    label: "Cultural Experience Zone",
    description:
      "Immerse in cultural traditions, crafts and performances from participating communities.",
  },
  {
    label: "Consulate Zone",
    description:
      "Connect with consulate representatives and learn about international opportunities.",
  },
  {
    label: "FPT Showcase",
    description:
      "Discover FPT University's international programs, research and student achievements.",
  },
  {
    label: "Main Stage & Networking",
    description:
      "Attend key program moments and connect with peers, educators and partners.",
  },
];
