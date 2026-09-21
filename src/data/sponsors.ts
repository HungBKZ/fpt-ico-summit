/**
 * sponsors.ts — Current sponsors and the data-access function used by the UI.
 *
 * All UI must get sponsors through `getSponsors()`. To move to MongoDB later,
 * change only the body of `getSponsors()` (keep the `Sponsor` shape).
 *
 * HOW TO ADD A REAL SPONSOR
 *   1. Put the logo in `public/sponsors/<id>/` (kebab-case file name).
 *   2. Add an object to `REAL_SPONSORS` below. Only fill fields you actually have —
 *      every optional field is hidden by the UI when missing.
 *   3. Never invent facts, speakers, booths or links.
 * HOW TO EDIT / REMOVE: edit or delete the object in `REAL_SPONSORS`.
 * HOW TO TURN OFF PREVIEW DATA: set `SHOW_MOCK_SPONSORS = false` (or delete `MOCK_SPONSORS`).
 */

import type { LocalizedText } from "@/i18n/types";
import type { SponsorTierId } from "@/data/sponsorship";

export type SponsorTier = SponsorTierId;

/**
 * A sponsor shown on the public site.
 * Only `id`, `tier`, `order` and `name` are required; everything else is optional
 * and is rendered conditionally (no empty labels, no placeholders).
 */
export interface Sponsor {
  id: string;
  tier: SponsorTier;
  /** Sort order within the same tier (ascending). */
  order: number;
  name: LocalizedText;
  /** Full legal name, kept in Vietnamese (not translated). Shown small in the modal only. */
  legalName?: string;
  /** Parent organisation, e.g. "FPT University". */
  affiliation?: LocalizedText;
  /** Local path in /public or a Cloudinary URL of cloud `dvucotc8z`. Missing → monogram. */
  logoUrl?: string;
  /** White logo variant for navy backgrounds (currently unused; sections are light). */
  logoLightUrl?: string;
  websiteUrl?: string;
  /**
   * Decorative cover banner (Diamond card + modal header; Gold card when present).
   * Guide: aspect >= 2.4:1, at least 1600px wide, keep text/logos away from the edges.
   */
  coverUrl?: string;
  /** CSS object-position choosing the visible area, e.g. "right center". */
  coverPosition?: string;
  /** Extra zoom (>1) around `coverPosition`, to crop out unwanted areas of the banner. */
  coverZoom?: number;
  description?: LocalizedText;
  /** Short facts shown as chips (max 3 on the Diamond card, full list in the modal). */
  facts?: { vi: string[]; en: string[] };
  tags?: { vi: string[]; en: string[] };
  socials?: { facebook?: string; youtube?: string; tiktok?: string; linkedin?: string };
  /** What the sponsor does at the Summit (speaker, workshop topic, booth). Only when confirmed. */
  highlight?: LocalizedText;
  /** true = preview data, NOT a real sponsor. Shown with a "Sample" badge. */
  isMock?: boolean;
}

const REAL_SPONSORS: Sponsor[] = [
  {
    id: "fsb",
    tier: "diamond",
    order: 1,
    name: {
      vi: "Viện Quản trị & Công nghệ FSB",
      en: "FPT School of Business & Technology (FSB)",
    },
    affiliation: { vi: "Trường Đại học FPT", en: "FPT University" },
    logoUrl: "/sponsors/fsb/fsb-logo.png",
    websiteUrl: "https://fsb.edu.vn/",
    // The banner already contains an FSB logo on its left edge: crop it out (our logo chip replaces it).
    coverUrl: "/sponsors/fsb/fsb-cover.png",
    coverPosition: "right center",
    coverZoom: 1.35,
    description: {
      vi: "Hơn 20 năm kinh nghiệm đào tạo quản trị tổ chức và doanh nghiệp, với các chương trình MBA liên kết quốc tế.",
      en: "Over 20 years of experience in organizational and business management education, with internationally partnered MBA programs.",
    },
    facts: {
      // TODO: "Top #24 MBA Đông Á" must be confirmed by FSB / the Organizing Committee before official publication.
      vi: ["Top #24 MBA Đông Á", "Hơn 20 năm kinh nghiệm", "4 cơ sở: Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ"],
      en: ["Top #24 MBA in East Asia", "20+ years of experience", "4 campuses: Hanoi, HCMC, Da Nang, Can Tho"],
    },
    tags: {
      vi: ["Leeds Beckett MBA", "CU Denver MBA", "SEMBA · PaMBA · MSE · MIT", "Global MiniMBA", "AI Strategy for Leaders"],
      en: ["Leeds Beckett MBA", "CU Denver MBA", "SEMBA · PaMBA · MSE · MIT", "Global MiniMBA", "AI Strategy for Leaders"],
    },
    socials: {
      facebook: "https://www.facebook.com/fsb.fpt.edu.vn",
      youtube: "https://www.youtube.com/@fsbfpt",
      tiktok: "https://www.tiktok.com/@fsbfpt",
    },
    // No `highlight`: speakers / workshop topics / booth are not yet provided by the Organizing Committee.
  },
  {
    // TODO: the English description and facts are a provisional translation —
    // Soha Travel / the Organizing Committee must confirm them before official publication.
    id: "soha-travel",
    tier: "diamond",
    order: 2,
    name: { vi: "Soha Travel", en: "Soha Travel" },
    legalName: "Công ty Cổ phần Lữ hành Quốc tế & Event Soha Travel",
    logoUrl: "/sponsors/soha-travel/soha-travel-logo.png",
    websiteUrl: "https://sohatravel.net/",
    // Keep the slogan on the left; zoom into the top-left so the phone number / website
    // printed at the bottom-right of the banner are cropped out.
    coverUrl: "/sponsors/soha-travel/soha-travel-cover.jpg",
    coverPosition: "left top",
    coverZoom: 1.5,
    description: {
      vi: "Đơn vị lữ hành và tổ chức sự kiện tại Cần Thơ, cung cấp tour trong nước và quốc tế, vé máy bay, cho thuê xe và các chương trình học tập – trải nghiệm thực tế.",
      en: "A Can Tho-based travel and event company offering domestic and international tours, flight tickets, car rental, and educational field-experience programs.",
    },
    facts: {
      vi: [
        "Trụ sở tại Cần Thơ, cùng văn phòng tại An Giang, TP.HCM, Thái Nguyên và Bến Tre",
        "Có giấy phép kinh doanh lữ hành nội địa và quốc tế",
      ],
      en: [
        "Headquartered in Can Tho, with offices in An Giang, Ho Chi Minh City, Thai Nguyen and Ben Tre",
        "Licensed for domestic and international travel services",
      ],
    },
    tags: {
      vi: ["Tour trong nước", "Tour nước ngoài", "Tour học sinh", "Tour doanh nghiệp", "Học tập & trải nghiệm thực tế", "Cho thuê xe", "Vé máy bay", "Tổ chức sự kiện"],
      en: ["Domestic tours", "International tours", "Student tours", "Corporate tours", "Learning & field experience programs", "Car rental", "Flight tickets", "Event organization"],
    },
    socials: {
      facebook: "https://www.facebook.com/Congtysohatravel/",
      youtube: "https://www.youtube.com/@sohatravelcantho23",
      tiktok: "https://www.tiktok.com/@soha_travel_can_tho",
    },
    // No `highlight`: speakers / workshop topics / booth are not yet provided by the Organizing Committee.
  },
];

/* ══════════════════════════════════════════════════════════════════════
 * ⚠️  DỮ LIỆU MẪU — CHỈ ĐỂ XEM TRƯỚC GIAO DIỆN  ⚠️
 * Các mục bên dưới KHÔNG phải nhà tài trợ thật.
 * PHẢI đặt SHOW_MOCK_SPONSORS = false (hoặc xoá MOCK_SPONSORS)
 * TRƯỚC KHI ĐƯA LÊN PRODUCTION.
 * ══════════════════════════════════════════════════════════════════════ */
const SHOW_MOCK_SPONSORS = true;

const lorem = {
  vi: "Nội dung mẫu: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
  en: "Sample content: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
};

const MOCK_SPONSORS: Sponsor[] = [
  {
    id: "mock-gold-1",
    tier: "gold",
    order: 1,
    name: { vi: "Nhà tài trợ Vàng (mẫu) 1", en: "Sample Gold Sponsor 1" },
    description: lorem,
    isMock: true,
  },
  {
    id: "mock-gold-2",
    tier: "gold",
    order: 2,
    name: { vi: "Nhà tài trợ Vàng (mẫu) 2", en: "Sample Gold Sponsor 2" },
    description: lorem,
    isMock: true,
  },
  {
    id: "mock-silver-1",
    tier: "silver",
    order: 1,
    name: { vi: "Nhà tài trợ Bạc (mẫu) 1", en: "Sample Silver Sponsor 1" },
    isMock: true,
  },
  {
    id: "mock-silver-2",
    tier: "silver",
    order: 2,
    name: { vi: "Nhà tài trợ Bạc (mẫu) 2", en: "Sample Silver Sponsor 2" },
    isMock: true,
  },
  {
    id: "mock-silver-3",
    tier: "silver",
    order: 3,
    name: { vi: "Nhà tài trợ Bạc (mẫu) 3", en: "Sample Silver Sponsor 3" },
    isMock: true,
  },
];

const tierRank: Record<SponsorTier, number> = { diamond: 0, gold: 1, silver: 2 };

/** Sorted by tier (Diamond → Gold → Silver), then by `order`. */
export async function getSponsors(): Promise<Sponsor[]> {
  const list = SHOW_MOCK_SPONSORS ? [...REAL_SPONSORS, ...MOCK_SPONSORS] : REAL_SPONSORS;
  return [...list].sort((a, b) => tierRank[a.tier] - tierRank[b.tier] || a.order - b.order);
}
