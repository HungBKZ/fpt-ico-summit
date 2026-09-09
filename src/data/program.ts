/**
 * program.ts — Authoritative schedule for FPT ICO Summit 2026.
 *
 * SOURCE OF TRUTH: Participation Agenda Summary (authoritative for DATE / TIME / PROGRAM SEQUENCE).
 * Official Summit: 20–22 November 2026.
 * Full-stay partner arrival: 19 November 2026.
 */

import type { LocalizedText } from "@/i18n/types";

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface ProgramActivity {
  /** Optional time string, e.g. "08:00", "08:00–17:00", "17:30–18:00" */
  time?: string;
  /** Activity title */
  title: string | LocalizedText;
  /** Activity description or extra context */
  description?: string | LocalizedText;
  /** Visible optional flag, e.g. Tourism Connection Forum */
  isOptional?: boolean;
}

export interface ProgramDay {
  /** ISO date string / display date */
  date: string | LocalizedText;
  /** Short label rendered as a badge/eyebrow */
  dayLabel: string | LocalizedText;
  /** Day theme title */
  title: string | LocalizedText;
  /** Subtitle or character of the day */
  subtitle: string | LocalizedText;
  /** One-sentence description of the day's character */
  description: string | LocalizedText;
  /** Thematic icon key — resolved to an SVG in the component */
  icon: "flag" | "star" | "compass";
  /** Activities grouped by time slot */
  slots: Partial<Record<TimeSlot, ProgramActivity[]>>;
}

/**
 * 19 Nov: Partner Logistics & Set-up notice (Pre-Summit).
 * Not an official Summit public event day, but available for partner logistics.
 */
export const partnerArrivalNotice = {
  date: {
    en: "19 November 2026",
    vi: "19 tháng 11, 2026",
  },
  tag: {
    en: "19 Nov · Pre-Summit Logistics",
    vi: "19/11 · Hậu cần Tiền Hội nghị",
  },
  title: {
    en: "Arrival / Check-in / Partner Set-up",
    vi: "Đón tiếp / Nhận phòng / Chuẩn bị Đối tác",
  },
  description: {
    en: "Designated for arrival, check-in, and partner booth set-up before the official Summit begins. Not an official Summit public event day.",
    vi: "Dành riêng cho công tác đón tiếp, nhận phòng và chuẩn bị gian hàng đối tác trước thềm Hội nghị chính thức. Không phải ngày sự kiện công chúng.",
  },
};

/**
 * Official Summit days: 20–22 November 2026.
 */
export const programDays: ProgramDay[] = [
  {
    date: {
      en: "20 November 2026",
      vi: "20 tháng 11, 2026",
    },
    dayLabel: {
      en: "20 Nov",
      vi: "20 Nov",
    },
    title: {
      en: "Main Summit Day",
      vi: "Ngày Hội nghị Chính",
    },
    subtitle: {
      en: "Priority attendance day",
      vi: "Ngày tham dự trọng tâm",
    },
    description: {
      en: "The official summit opens with the exhibition opening, official opening ceremony, welcome luncheon, workshops, consultations, and networking.",
      vi: "Khai mạc chính thức với hoạt động mở cửa triển lãm, lễ khai mạc trọng thể, tiệc trưa chào mừng, hội thảo chuyên đề, tư vấn và kết nối quốc tế.",
    },
    icon: "flag",
    slots: {
      morning: [
        {
          time: "08:00–17:00",
          title: {
            en: "Workshops & Booth",
            vi: "Hội thảo Chuyên đề & Hoạt động Gian hàng",
          },
        },
        {
          time: "08:00",
          title: {
            en: "Exhibition & Booth Opening",
            vi: "Khai mạc Triển lãm & Mở cửa Gian hàng",
          },
        },
        {
          time: "10:00",
          title: {
            en: "Official Opening Ceremony",
            vi: "Lễ Khai mạc Chính thức",
          },
        },
        {
          time: "12:00",
          title: {
            en: "Welcome Luncheon",
            vi: "Tiệc trưa Chào mừng",
          },
        },
      ],
      afternoon: [
        {
          time: "14:00–17:00",
          title: {
            en: "International Exhibition / Consultation / Networking",
            vi: "Triển lãm Quốc tế / Tư vấn Du học / Giao lưu & Kết nối",
          },
        },
      ],
      evening: [
        {
          time: "Evening",
          title: {
            en: "Tourism Connection Forum",
            vi: "Diễn đàn Kết nối Du lịch",
          },
          isOptional: true,
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
      en: "21 Nov",
      vi: "21 Nov",
    },
    title: {
      en: "Follow-up Summit Day, Closing & Farewell",
      vi: "Ngày Hội nghị Tiếp nối, Bế mạc & Giao lưu Chia tay",
    },
    subtitle: {
      en: "Exhibition, sessions, partnership signings & farewell reception",
      vi: "Triển lãm, phiên chuyên đề, lễ ký kết hợp tác và tiệc chiêu đãi chia tay",
    },
    description: {
      en: "Ongoing exhibition and consultations, in-depth academic workshops, formal signing ceremony, closing ceremony and the farewell reception.",
      vi: "Tiếp nối triển lãm và tư vấn, các phiên hội thảo chuyên sâu, Lễ Ký kết Thỏa thuận, Lễ Bế mạc & Vinh danh và Tiệc Chiêu đãi Chia tay.",
    },
    icon: "star",
    slots: {
      morning: [
        {
          time: "Morning",
          title: {
            en: "International Exhibition / Consultation / Workshops",
            vi: "Triển lãm Quốc tế / Tư vấn / Hội thảo Học thuật",
          },
        },
      ],
      afternoon: [
        {
          time: "Afternoon",
          title: {
            en: "Consultation & Sessions",
            vi: "Tư vấn & Các phiên Chuyên đề",
          },
        },
        {
          time: "08:00–17:00",
          title: {
            en: "Booth",
            vi: "Hoạt động Gian hàng Triển lãm",
          },
        },
        {
          time: "17:00–17:30",
          title: {
            en: "Signing Ceremony",
            vi: "Lễ Ký kết Thỏa thuận Hợp tác",
          },
        },
        {
          time: "17:30–18:00",
          title: {
            en: "Closing Ceremony & Recognition",
            vi: "Lễ Bế mạc & Vinh danh",
          },
        },
      ],
      evening: [
        {
          time: "18:00–19:30",
          title: {
            en: "Farewell Reception",
            vi: "Tiệc Chiêu đãi Chia tay (Farewell Reception)",
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
      en: "22 Nov",
      vi: "22 Nov",
    },
    title: {
      en: "Mekong Discovery Day",
      vi: "Ngày Khám phá Mekong",
    },
    subtitle: {
      en: "Off-campus cultural experience",
      vi: "Trải nghiệm văn hóa ngoài khuôn viên",
    },
    description: {
      en: "Participating delegates explore the vibrant culture of the Mekong Delta through a floating market journey and a visit to Con Son Islet before departing.",
      vi: "Các đại biểu trải nghiệm văn hóa sông nước miền Tây qua hành trình khám phá chợ nổi và tham quan Cồn Sơn trước khi hoàn tất khởi hành.",
    },
    icon: "compass",
    slots: {
      morning: [
        {
          time: "Morning",
          title: {
            en: "Floating Market Experience",
            vi: "Trải nghiệm Chợ nổi Nam Bộ",
          },
        },
        {
          time: "Later Morning / Midday",
          title: {
            en: "Con Son Islet Visit",
            vi: "Hành trình Tham quan Cồn Sơn",
          },
        },
      ],
      afternoon: [
        {
          time: "After Excursion",
          title: {
            en: "Departure / Check-out",
            vi: "Hoàn tất Trả phòng & Khởi hành",
          },
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Continuous activities — run throughout 20 & 21 November (Main Summit days)
// ---------------------------------------------------------------------------

export interface ContinuousActivity {
  title: string | LocalizedText;
  description: string | LocalizedText;
  icon: "globe" | "book" | "award" | "chat";
}

export const continuousActivities: ContinuousActivity[] = [
  {
    title: {
      en: "International Expo & Booths",
      vi: "Triển lãm Quốc tế & Gian hàng",
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
      en: "Academic & Future Career Workshops",
      vi: "Hội thảo Học thuật & Nghề nghiệp Tương lai",
    },
    description: {
      en: "Build intercultural communication, adaptability skills and discover emerging trends for global careers.",
      vi: "Trang bị kỹ năng giao tiếp đa văn hóa, khả năng thích ứng và khám phá xu hướng nghề nghiệp toàn cầu.",
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
