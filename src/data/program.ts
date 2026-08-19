/**
 * program.ts — Confirmed program schedule for FPT ICO Summit 2026.
 *
 * SOURCE OF TRUTH: This file reflects the confirmed schedule.
 * Do not revert to any earlier Word planning document.
 * Do not publish session times until confirmed.
 */

import type { LocalizedText } from "@/i18n/types";

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface ProgramActivity {
  title: string | LocalizedText;
}

export interface ProgramDay {
  /** ISO date string — used for display only, not for logic. */
  date: string | LocalizedText;
  /** Short label rendered as a badge/eyebrow. */
  dayLabel: string | LocalizedText;
  /** Day theme title. */
  title: string | LocalizedText;
  /** One-sentence description of the day's character. */
  description: string | LocalizedText;
  /** Thematic icon key — resolved to an SVG in the component. */
  icon: "compass" | "flag" | "star";
  /** Activities grouped by time slot. Only include slots that have content. */
  slots: Partial<Record<TimeSlot, ProgramActivity[]>>;
}

export const programDays: ProgramDay[] = [
  {
    date: {
      en: "20 November 2026",
      vi: "20 tháng 11, 2026",
    },
    dayLabel: {
      en: "PRE-EVENT",
      vi: "TIỀN SỰ KIỆN",
    },
    title: {
      en: "Mekong Discovery",
      vi: "Mekong Discovery",
    },
    description: {
      en: "Welcome activities and cultural experiences introduce international guests to Can Tho and the Mekong Delta.",
      vi: "Hoạt động chào mừng và trải nghiệm văn hóa giới thiệu nét đẹp Cần Thơ và vùng sông nước Mekong đến đại biểu quốc tế.",
    },
    icon: "compass",
    slots: {
      morning: [
        {
          title: {
            en: "Welcome & Registration",
            vi: "Đón tiếp & Đăng ký",
          },
        },
      ],
      afternoon: [
        {
          title: {
            en: "Traditional Craft Villages",
            vi: "Làng nghề truyền thống",
          },
        },
        {
          title: {
            en: "Southern Cultural Experience",
            vi: "Trải nghiệm văn hóa Nam Bộ",
          },
        },
      ],
      evening: [
        {
          title: {
            en: "Welcome Dinner",
            vi: "Tiệc chào mừng",
          },
        },
      ],
    },
  },
  {
    date: {
      en: "21 November 2026",
      vi: "21 tháng 11, 2026",
    },
    dayLabel: {
      en: "DAY 1",
      vi: "NGÀY 1",
    },
    title: {
      en: "Summit Day 1",
      vi: "Summit Day 1",
    },
    description: {
      en: "The official summit opens with an opening ceremony and cultural performances, followed by networking, activities and the International Expo.",
      vi: "Sự kiện chính thức khai mạc với Lễ Khai mạc và biểu diễn nghệ thuật, tiếp nối là các hoạt động giao lưu, trải nghiệm và Triển lãm Quốc tế.",
    },
    icon: "flag",
    slots: {
      morning: [
        {
          title: {
            en: "Check-in",
            vi: "Check-in",
          },
        },
        {
          title: {
            en: "Opening Ceremony",
            vi: "Lễ Khai mạc",
          },
        },
        {
          title: {
            en: "Opening cultural performance by FPT University",
            vi: "Biểu diễn văn hóa mở màn bởi Đại học FPT",
          },
        },
      ],
      afternoon: [
        {
          title: {
            en: "Cultural performances by participating countries and FPT University",
            vi: "Biểu diễn văn hóa từ các quốc gia tham gia và Đại học FPT",
          },
        },
        {
          title: {
            en: "Networking",
            vi: "Giao lưu & Kết nối",
          },
        },
        {
          title: {
            en: "Lucky Spin",
            vi: "Vòng quay may mắn",
          },
        },
        {
          title: {
            en: "Cultural Quiz",
            vi: "Đố vui văn hóa",
          },
        },
      ],
    },
  },
  {
    date: {
      en: "22 November 2026",
      vi: "22 tháng 11, 2026",
    },
    dayLabel: {
      en: "DAY 2",
      vi: "NGÀY 2",
    },
    title: {
      en: "Summit Day 2",
      vi: "Summit Day 2",
    },
    description: {
      en: "The summit concludes with performances, networking, an awards ceremony, Friendship Concert and International Fashion Show.",
      vi: "Ngày hội khép lại với các hoạt động giao lưu, Lễ Bế mạc & Trao giải, Đêm nhạc Hữu nghị và Trình diễn Thời trang Quốc tế.",
    },
    icon: "star",
    slots: {
      morning: [
        {
          title: {
            en: "Check-in",
            vi: "Check-in",
          },
        },
      ],
      afternoon: [
        {
          title: {
            en: "Cultural performances by participating countries and FPT University",
            vi: "Biểu diễn văn hóa từ các quốc gia tham gia và Đại học FPT",
          },
        },
        {
          title: {
            en: "Networking",
            vi: "Giao lưu & Kết nối",
          },
        },
        {
          title: {
            en: "Lucky Spin",
            vi: "Vòng quay may mắn",
          },
        },
        {
          title: {
            en: "Cultural Quiz",
            vi: "Đố vui văn hóa",
          },
        },
      ],
      evening: [
        {
          title: {
            en: "Awards Ceremony",
            vi: "Lễ Bế mạc & Trao giải",
          },
        },
        {
          title: {
            en: "Friendship Concert",
            vi: "Đêm nhạc Hữu nghị",
          },
        },
        {
          title: {
            en: "International Fashion Show",
            vi: "Trình diễn Thời trang Quốc tế",
          },
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Continuous activities — run throughout 21 & 22 November
// ---------------------------------------------------------------------------

export interface ContinuousActivity {
  title: string | LocalizedText;
  description: string | LocalizedText;
  icon: "globe" | "book" | "award" | "chat";
}

export const continuousActivities: ContinuousActivity[] = [
  {
    title: {
      en: "International Expo",
      vi: "Triển lãm Quốc tế",
    },
    description: {
      en: "Meet international education partners and explore programs, pathways and global opportunities.",
      vi: "Gặp gỡ các đối tác giáo dục quốc tế và khám phá các chương trình du học, lộ trình học tập toàn cầu.",
    },
    icon: "globe",
  },
  {
    title: {
      en: "Study Abroad Consultation",
      vi: "Tư vấn Du học & Chuyển tiếp",
    },
    description: {
      en: "Access practical guidance on admissions, exchange programs and international study pathways.",
      vi: "Nhận hướng dẫn chi tiết về thông tin tuyển sinh, chương trình trao đổi và các lộ trình học tập quốc tế.",
    },
    icon: "book",
  },
  {
    title: {
      en: "Scholarship Interviews",
      vi: "Phỏng vấn & Tư vấn Học bổng",
    },
    description: {
      en: "Connect directly with partner institutions and learn about scholarship opportunities.",
      vi: "Kết nối trực tiếp với đại diện các trường đối tác và tìm hiểu các chương trình học bổng hấp dẫn.",
    },
    icon: "award",
  },
  {
    title: {
      en: "Workshop: Cross-Cultural Communication in the AI Era",
      vi: "Hội thảo: Giao tiếp Đa văn hóa trong Kỷ nguyên AI",
    },
    description: {
      en: "Build communication and adaptability skills for international study and multicultural work.",
      vi: "Trang bị kỹ năng giao tiếp và năng lực thích ứng cho môi trường học tập và làm việc quốc tế.",
    },
    icon: "chat",
  },
];

// ---------------------------------------------------------------------------
// Expo zones — used in the Expo section
// ---------------------------------------------------------------------------

export interface ExpoZone {
  label: string | LocalizedText;
  description: string | LocalizedText;
}

export const expoZones: ExpoZone[] = [
  {
    label: {
      en: "International Partner Zone",
      vi: "Khu vực Đối tác Quốc tế",
    },
    description: {
      en: "Meet education partners and explore programs, pathways and global opportunities.",
      vi: "Gặp gỡ các đối tác giáo dục và khám phá các chương trình du học, trao đổi sinh viên.",
    },
  },
  {
    label: {
      en: "Cultural Experience Zone",
      vi: "Khu vực Trải nghiệm Văn hóa",
    },
    description: {
      en: "Immerse in cultural traditions, crafts and performances from participating communities.",
      vi: "Hòa mình vào không gian văn hóa truyền thống, làng nghề và biểu diễn nghệ thuật.",
    },
  },
  {
    label: {
      en: "Consulate Zone",
      vi: "Khu vực Lãnh sự quán",
    },
    description: {
      en: "Connect with consulate representatives and learn about international opportunities.",
      vi: "Kết nối với đại diện các cơ quan lãnh sự và tìm hiểu các chính sách, cơ hội ngoại giao.",
    },
  },
  {
    label: {
      en: "FPT Showcase",
      vi: "Khu vực Triển lãm FPT",
    },
    description: {
      en: "Discover FPT University's international programs, research and student achievements.",
      vi: "Khám phá các chương trình quốc tế, nghiên cứu và thành tựu sinh viên Đại học FPT.",
    },
  },
  {
    label: {
      en: "Main Stage & Networking",
      vi: "Sân khấu Chính & Giao lưu",
    },
    description: {
      en: "Attend key program moments and connect with peers, educators and partners.",
      vi: "Tham dự các điểm nhấn chương trình và kết nối cùng bạn bè, thầy cô và đại biểu đối tác.",
    },
  },
];
