/**
 * src/lib/config/ics-rules.ts
 *
 * Centralized reference rules for ICS (International Cooperation System) participation mapping.
 *
 * IMPORTANT ARCHITECTURAL BOUNDARY:
 * The FPT ICO Summit website is NOT the official ICS scoring system.
 * Official ICS calculation and awarding belong to an external SRO system.
 * This platform exports a REFERENCE ONLY value (+10 per attended optional session)
 * for FPT University Can Tho students to assist SRO administrators in manual review.
 */

export interface IcsReferenceRule {
  code: string;
  categoryEn: string;
  categoryVi: string;
  unitEn: string;
  unitVi: string;
  referencePointsPerSession: number;
}

export const ICS_REFERENCE_RULES: Record<string, IcsReferenceRule> = {
  STU03: {
    code: "STU03",
    categoryEn: "International Activity at Campus",
    categoryVi: "Hoạt động Quốc tế tại Trường",
    unitEn: "Session",
    unitVi: "Buổi",
    referencePointsPerSession: 10,
  },
} as const;

export const DEFAULT_ICS_RULE = ICS_REFERENCE_RULES.STU03;
