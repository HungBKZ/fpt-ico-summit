/**
 * expo.ts — International Expo zones and items.
 */

import type { LocalizedText } from "@/i18n/types";

export type ExpoItemStatus = "confirmed" | "pending" | "invited" | "hidden";

export type ExpoItem = {
  id: string;
  title: string | LocalizedText;
  description: string | LocalizedText;
  status: ExpoItemStatus;
};

export const expoItems: ExpoItem[] = [
  {
    id: "international-partner-zone",
    title: {
      en: "International Partner Zone",
      vi: "Khu vực Đối tác Quốc tế",
    },
    description: {
      en: "A dedicated showcase space for higher education institutions and global partners to connect directly with students.",
      vi: "Không gian gian hàng dành riêng cho các cơ sở giáo dục đại học và đối tác toàn cầu kết nối trực tiếp với sinh viên.",
    },
    status: "confirmed",
  },
  {
    id: "consulate-zone",
    title: {
      en: "Consulate Zone",
      vi: "Khu vực Lãnh sự quán",
    },
    description: {
      en: "A dedicated space highlighting international engagement, cultural connections, and public diplomacy in the summit experience.",
      vi: "Khu vực đặc biệt tôn vinh sự kết nối quốc tế, giao lưu văn hóa và hoạt động ngoại giao tại hội nghị.",
    },
    status: "confirmed",
  },
  {
    id: "cultural-zone",
    title: {
      en: "Cultural Zone",
      vi: "Khu vực Văn hóa",
    },
    description: {
      en: "Interactive cultural discovery through traditions, performances, participation, and cross-cultural exchange.",
      vi: "Trải nghiệm văn hóa tương tác qua các hoạt động truyền thống, biểu diễn nghệ thuật và giao lưu đa quốc gia.",
    },
    status: "confirmed",
  },
  {
    id: "food-and-souvenirs",
    title: {
      en: "Food & Souvenirs",
      vi: "Ẩm thực & Quà lưu niệm",
    },
    description: {
      en: "A welcoming area centered on local flavours, regional identity, and memorable keepsakes from the Mekong experience.",
      vi: "Không gian trải nghiệm ấm cúng hội tụ hương vị địa phương, bản sắc vùng miền và các món quà lưu niệm đậm chất Mekong.",
    },
    status: "confirmed",
  },
  {
    id: "fpt-showcase-main-stage",
    title: {
      en: "FPT Showcase / Main Stage",
      vi: "FPT Showcase / Sân khấu Chính",
    },
    description: {
      en: "A presentation and performance space for the host institution, student stories, cultural showcases, and public-facing highlights.",
      vi: "Không gian trình diễn của đơn vị chủ nhà, tôn vinh câu chuyện sinh viên, điểm nhấn văn hóa và các sự kiện chính.",
    },
    status: "confirmed",
  },
];

export function getConfirmedExpoItems(): ExpoItem[] {
  return expoItems.filter((item) => item.status === "confirmed");
}
