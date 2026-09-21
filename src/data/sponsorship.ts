/**
 * sponsorship.ts — Sponsorship tiers and benefit comparison.
 *
 * Display order is fixed: Diamond → Gold → Silver.
 * Every benefit cell is one of: included (✓), excluded (—) or a text value.
 * Do not add unconfirmed benefits or fees here.
 */

import type { LocalizedText } from "@/i18n/types";

export type SponsorTierId = "diamond" | "gold" | "silver";

/** Fixed display order of the tiers. */
export const sponsorTierOrder: readonly SponsorTierId[] = ["diamond", "gold", "silver"];

export type BenefitValue =
  | { kind: "included" }
  | { kind: "excluded" }
  | { kind: "text"; text: LocalizedText };

export interface BenefitRow {
  id: string;
  label: LocalizedText;
  values: Record<SponsorTierId, BenefitValue>;
}

export interface BenefitGroup {
  id: string;
  title: LocalizedText;
  rows: BenefitRow[];
}

export interface SponsorTierInfo {
  id: SponsorTierId;
  /** Sponsorship fee in VND. */
  feeVnd: number;
  featured: boolean;
  highlights: LocalizedText[];
}

const yes: BenefitValue = { kind: "included" };
const no: BenefitValue = { kind: "excluded" };
const txt = (vi: string, en: string): BenefitValue => ({ kind: "text", text: { vi, en } });
const label = (vi: string, en: string): LocalizedText => ({ vi, en });

const all = (value: BenefitValue): Record<SponsorTierId, BenefitValue> => ({
  diamond: value,
  gold: value,
  silver: value,
});

export const sponsorTiers: SponsorTierInfo[] = [
  {
    id: "diamond",
    feeVnd: 50_000_000,
    featured: true,
    highlights: [
      label("5 vé mời dành cho nhà tài trợ", "5 sponsor guest passes"),
      label("Gian hàng Prime, tự chọn vị trí", "Prime booth with first choice of location"),
      label("1 diễn giả + chủ đề ưu tiên", "1 speaker slot with priority topic"),
      label("Logo lớn nhất, vị trí cao cấp", "Largest logo in premium placement"),
    ],
  },
  {
    id: "gold",
    feeVnd: 30_000_000,
    featured: false,
    highlights: [
      label("3 vé mời dành cho nhà tài trợ", "3 sponsor guest passes"),
      label("Gian hàng Premium", "Premium booth"),
      label("1 diễn giả", "1 speaker slot"),
      label("Video ngắn trong chương trình", "Short video in the programme"),
    ],
  },
  {
    id: "silver",
    feeVnd: 20_000_000,
    featured: false,
    highlights: [
      label("2 vé mời dành cho nhà tài trợ", "2 sponsor guest passes"),
      label("Gian hàng Standard", "Standard booth"),
      label("Logo trên website và trong chương trình", "Logo on website and in the programme"),
      label("1 bài đăng mạng xã hội", "1 social media post"),
    ],
  },
];

export const benefitGroups: BenefitGroup[] = [
  {
    id: "access",
    title: label("Tham dự & Kết nối", "Event Access & Networking"),
    rows: [
      {
        id: "summit-pass",
        label: label("Vé tham dự Summit chính thức", "Official Summit pass"),
        values: all(yes),
      },
      {
        id: "guest-passes",
        label: label("Vé mời dành cho nhà tài trợ", "Sponsor guest passes"),
        values: { diamond: txt("5", "5"), gold: txt("3", "3"), silver: txt("2", "2") },
      },
      {
        id: "networking",
        label: label("Hoạt động kết nối (networking)", "Networking activities"),
        values: {
          diamond: txt("Ưu tiên tham gia", "Priority participation"),
          gold: yes,
          silver: yes,
        },
      },
    ],
  },
  {
    id: "exhibition",
    title: label("Triển lãm & Tương tác", "Exhibition & Engagement"),
    rows: [
      {
        id: "booth",
        label: label("Gian hàng", "Booth"),
        values: {
          diamond: txt("Prime", "Prime"),
          gold: txt("Premium", "Premium"),
          silver: txt("Standard", "Standard"),
        },
      },
      {
        id: "booth-priority",
        label: label("Ưu tiên vị trí gian hàng", "Booth location priority"),
        values: {
          diamond: txt("Ưu tiên cao nhất, tự chọn vị trí", "Highest priority, own choice of location"),
          gold: txt("Sau Kim Cương", "After Diamond"),
          silver: txt("Sau Vàng & Kim Cương", "After Gold & Diamond"),
        },
      },
      {
        id: "workshop-speaker",
        label: label("Workshop / Diễn giả", "Workshop / Speaker"),
        values: {
          diamond: txt("1 diễn giả + chủ đề ưu tiên", "1 speaker + priority topic"),
          gold: txt("1 diễn giả", "1 speaker"),
          silver: no,
        },
      },
      {
        id: "study-abroad",
        label: label(
          "Tư vấn du học / hoạt động kích hoạt",
          "Study-abroad counselling / activation activities",
        ),
        values: all(yes),
      },
    ],
  },
  {
    id: "brand",
    title: label("Nhận diện thương hiệu", "Brand Visibility"),
    rows: [
      {
        id: "logo-website",
        label: label("Logo trên website sự kiện", "Logo on the event website"),
        values: all(yes),
      },
      {
        id: "logo-booklet",
        label: label("Logo trong chương trình / e-booklet", "Logo in the programme / e-booklet"),
        values: all(yes),
      },
      {
        id: "logo-led",
        label: label("Logo trên màn hình LED", "Logo on LED screens"),
        values: {
          diamond: txt("Vị trí ưu tiên", "Priority placement"),
          gold: yes,
          silver: yes,
        },
      },
      {
        id: "logo-backdrop",
        label: label("Logo trên backdrop", "Logo on the backdrop"),
        values: {
          diamond: txt("Vị trí ưu tiên", "Priority placement"),
          gold: yes,
          silver: yes,
        },
      },
      {
        id: "logo-checkin",
        label: label("Logo tại khu vực check-in", "Logo at the check-in area"),
        values: all(yes),
      },
      {
        id: "standee-banner",
        label: label("Standee / Banner tại sự kiện", "Standee / Banner at the event"),
        values: {
          diamond: txt(
            "Banner + khu check-in + photobooth",
            "Banner + check-in area + photobooth",
          ),
          gold: txt("Banner tại khu triển lãm", "Banner in the exhibition area"),
          silver: txt("Standee + brochure tại gian hàng", "Standee + brochure at the booth"),
        },
      },
    ],
  },
  {
    id: "media",
    title: label("Truyền thông", "Media & Communication"),
    rows: [
      {
        id: "social-posts",
        label: label("Đăng bài mạng xã hội", "Social media posts"),
        values: {
          diamond: txt("3 bài", "3 posts"),
          gold: txt("2 bài", "2 posts"),
          silver: txt("1 bài", "1 post"),
        },
      },
      {
        id: "video-logo",
        label: label("Video / Logo trong chương trình", "Video / Logo in the programme"),
        values: {
          diamond: txt("Video ưu tiên", "Priority video"),
          gold: txt("Video ngắn", "Short video"),
          silver: txt("Logo", "Logo"),
        },
      },
      {
        id: "pre-event",
        label: label("Truyền thông trước sự kiện", "Pre-event communication"),
        values: {
          diamond: txt("Nhà tài trợ nổi bật", "Featured sponsor"),
          gold: yes,
          silver: yes,
        },
      },
      {
        id: "post-event",
        label: label("Ghi nhận sau sự kiện", "Post-event recognition"),
        values: {
          diamond: txt("Ghi nhận nổi bật", "Featured recognition"),
          gold: yes,
          silver: yes,
        },
      },
    ],
  },
  {
    id: "recognition",
    title: label("Đối tác & Ghi nhận", "Partnership & Recognition"),
    rows: [
      {
        id: "title",
        label: label("Danh hiệu", "Title"),
        values: {
          diamond: txt("Đối tác Kim Cương", "Diamond Partner"),
          gold: txt("Đối tác Vàng", "Gold Partner"),
          silver: txt("Đối tác Bạc", "Silver Partner"),
        },
      },
      {
        id: "logo-size",
        label: label("Kích thước / mức hiển thị logo", "Logo size / visibility level"),
        values: {
          diamond: txt("Lớn nhất, vị trí cao cấp", "Largest, premium placement"),
          gold: txt("Lớn", "Large"),
          silver: txt("Tiêu chuẩn", "Standard"),
        },
      },
      {
        id: "website-recognition",
        label: label("Ghi nhận trên website chính thức", "Recognition on the official website"),
        values: { diamond: txt("Ưu tiên", "Priority"), gold: yes, silver: yes },
      },
      {
        id: "certificate",
        label: label("Chứng nhận / Thư cảm ơn", "Certificate / Thank-you letter"),
        values: all(yes),
      },
    ],
  },
];
