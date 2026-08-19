/**
 * workshops.ts — Summit workshops registry.
 */

import type { LocalizedText } from "@/i18n/types";

export type WorkshopStatus = "confirmed" | "pending" | "invited" | "hidden";

export type Workshop = {
  id: string;
  title: string | LocalizedText;
  description: string | LocalizedText;
  status: WorkshopStatus;
};

export const workshops: Workshop[] = [
  {
    id: "cross-cultural-communication-ai-era",
    title: {
      en: "Cross-Cultural Communication in the AI Era",
      vi: "Giao tiếp Đa văn hóa trong Kỷ nguyên AI",
    },
    description: {
      en: "The workshop explores how students can communicate across cultures, adapt to international environments, and leverage AI effectively in multicultural study and work.",
      vi: "Hội thảo khai phá phương thức giao tiếp đa văn hóa, khả năng thích ứng môi trường quốc tế và ứng dụng hiệu quả trí tuệ nhân tạo trong học tập và làm việc toàn cầu.",
    },
    status: "confirmed",
  },
];

export function getConfirmedWorkshops(): Workshop[] {
  return workshops.filter((workshop) => workshop.status === "confirmed");
}
