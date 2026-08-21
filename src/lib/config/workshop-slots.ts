/**
 * src/lib/config/workshop-slots.ts
 *
 * Predefined 20 Workshop slots configuration for FPT ICO Summit 2026.
 */

export interface WorkshopSlotDefinition {
  slotId: string; // e.g. "WS_2026_01"
  sequence: number; // 1..20
  dateKey: string; // "2026-11-21" | "2026-11-22"
  sessionGroup: {
    en: string;
    vi: string;
  };
  startTime: string; // "08:30"
  endTime: string; // "09:00"
}

export const WORKSHOP_SLOTS: WorkshopSlotDefinition[] = [
  // ── 21 NOV — MORNING ────────────────────────────────────────────────────────
  { slotId: "WS_2026_01", sequence: 1,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Morning", vi: "21/11 — Buổi sáng" }, startTime: "08:30", endTime: "09:00" },
  { slotId: "WS_2026_02", sequence: 2,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Morning", vi: "21/11 — Buổi sáng" }, startTime: "09:00", endTime: "09:30" },
  { slotId: "WS_2026_03", sequence: 3,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Morning", vi: "21/11 — Buổi sáng" }, startTime: "09:30", endTime: "10:00" },
  // 10:00–10:15 BREAK
  { slotId: "WS_2026_04", sequence: 4,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Morning", vi: "21/11 — Buổi sáng" }, startTime: "10:15", endTime: "10:45" },
  { slotId: "WS_2026_05", sequence: 5,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Morning", vi: "21/11 — Buổi sáng" }, startTime: "10:45", endTime: "11:15" },

  // ── 21 NOV — AFTERNOON ──────────────────────────────────────────────────────
  { slotId: "WS_2026_06", sequence: 6,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Afternoon", vi: "21/11 — Buổi chiều" }, startTime: "13:30", endTime: "14:00" },
  { slotId: "WS_2026_07", sequence: 7,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Afternoon", vi: "21/11 — Buổi chiều" }, startTime: "14:00", endTime: "14:30" },
  { slotId: "WS_2026_08", sequence: 8,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Afternoon", vi: "21/11 — Buổi chiều" }, startTime: "14:30", endTime: "15:00" },
  // 15:00–15:15 BREAK
  { slotId: "WS_2026_09", sequence: 9,  dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Afternoon", vi: "21/11 — Buổi chiều" }, startTime: "15:15", endTime: "15:45" },
  { slotId: "WS_2026_10", sequence: 10, dateKey: "2026-11-21", sessionGroup: { en: "21 Nov — Afternoon", vi: "21/11 — Buổi chiều" }, startTime: "15:45", endTime: "16:15" },

  // ── 22 NOV — MORNING ────────────────────────────────────────────────────────
  { slotId: "WS_2026_11", sequence: 11, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Morning", vi: "22/11 — Buổi sáng" }, startTime: "08:30", endTime: "09:00" },
  { slotId: "WS_2026_12", sequence: 12, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Morning", vi: "22/11 — Buổi sáng" }, startTime: "09:00", endTime: "09:30" },
  { slotId: "WS_2026_13", sequence: 13, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Morning", vi: "22/11 — Buổi sáng" }, startTime: "09:30", endTime: "10:00" },
  // 10:00–10:15 BREAK
  { slotId: "WS_2026_14", sequence: 14, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Morning", vi: "22/11 — Buổi sáng" }, startTime: "10:15", endTime: "10:45" },
  { slotId: "WS_2026_15", sequence: 15, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Morning", vi: "22/11 — Buổi sáng" }, startTime: "10:45", endTime: "11:15" },

  // ── 22 NOV — AFTERNOON ──────────────────────────────────────────────────────
  { slotId: "WS_2026_16", sequence: 16, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Afternoon", vi: "22/11 — Buổi chiều" }, startTime: "13:30", endTime: "14:00" },
  { slotId: "WS_2026_17", sequence: 17, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Afternoon", vi: "22/11 — Buổi chiều" }, startTime: "14:00", endTime: "14:30" },
  { slotId: "WS_2026_18", sequence: 18, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Afternoon", vi: "22/11 — Buổi chiều" }, startTime: "14:30", endTime: "15:00" },
  // 15:00–15:15 BREAK
  { slotId: "WS_2026_19", sequence: 19, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Afternoon", vi: "22/11 — Buổi chiều" }, startTime: "15:15", endTime: "15:45" },
  { slotId: "WS_2026_20", sequence: 20, dateKey: "2026-11-22", sessionGroup: { en: "22 Nov — Afternoon", vi: "22/11 — Buổi chiều" }, startTime: "15:45", endTime: "16:15" },
];

export function getWorkshopSlotById(slotId?: string): WorkshopSlotDefinition | undefined {
  if (!slotId) return undefined;
  return WORKSHOP_SLOTS.find((s) => s.slotId === slotId);
}
