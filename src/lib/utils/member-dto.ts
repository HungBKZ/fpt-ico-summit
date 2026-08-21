/**
 * src/lib/utils/member-dto.ts
 *
 * Member-safe Data Transfer Object (DTO) transformer for SummitActivity documents.
 * Strictly sanitizes approved snapshots and published schedules for public Member consumption.
 * NEVER EXPOSES draftSnapshot or scheduleDraft.
 * EXPLICITLY OMITS internal operational data:
 * - Speaker email, phone/WhatsApp, slideUrl, supportingContentUrl, referenceUrl, technicalRequirements
 * - Performance contact email, phone/WhatsApp, backingTrackUrl, demoVideoUrl, supportingContentUrl, stageRequirements
 */

import type {
  SummitActivity,
  WorkshopSnapshot,
  StagePerformanceSnapshot,
  MediaAsset,
  ActivityPublishedSchedule,
} from "@/lib/db/models/summit-activity";

export interface MemberSafeSpeaker {
  id: string;
  fullName: string;
  positionTitle: string;
  organizationName: string;
  country: string;
  photo?: MediaAsset;
  shortBio: {
    en: string;
    vi?: string;
  };
}

export interface MemberSafeWorkshopSnapshot {
  title: {
    en: string;
    vi?: string;
  };
  shortDescription: {
    en: string;
    vi?: string;
  };
  fullDescription?: {
    en?: string;
    vi?: string;
  };
  language: string;
  otherLanguage?: string;
  durationMinutes: number;
  format: string;
  otherFormat?: string;
  targetAudience?: string;
  keyTakeaways?: {
    en?: string;
    vi?: string;
  };
  speakers: MemberSafeSpeaker[];
  coverImage?: MediaAsset;
}

export interface MemberSafePerformanceSnapshot {
  title: {
    en: string;
    vi?: string;
  };
  performanceType: string;
  otherPerformanceType?: string;
  countryOrCultureRepresented: string;
  shortDescription: {
    en: string;
    vi?: string;
  };
  culturalMeaning?: {
    en?: string;
    vi?: string;
  };
  numberOfPerformers: number;
  durationMinutes: number;
  mcIntroduction?: {
    en?: string;
    vi?: string;
  };
  performanceCover?: MediaAsset;
}

export interface MemberSafeActivityDTO {
  _id: string;
  editionId: string;
  organizationId: string;
  type: "WORKSHOP" | "STAGE_PERFORMANCE";
  approvedSnapshot?: MemberSafeWorkshopSnapshot | MemberSafePerformanceSnapshot;
  publishedSchedule?: {
    dateKey: string;
    startTime: string;
    endTime: string;
    venue: string;
  };
  isSelectable: boolean;
  isHistoricalUnavailable?: boolean;
}

/**
 * Transforms a raw SummitActivity model into a Member-safe DTO.
 * NEVER uses draftSnapshot — approvedSnapshot ONLY.
 * If approvedSnapshot is missing, returns a tombstone DTO (isSelectable = false, isHistoricalUnavailable = true).
 */
export function toMemberSafeActivityDTO(
  activity: SummitActivity,
  explicitSelectable?: boolean
): MemberSafeActivityDTO | null {
  if (!activity._id) {
    return null;
  }

  const rawApproved = activity.approvedSnapshot;
  const isSelectable =
    explicitSelectable !== undefined
      ? explicitSelectable
      : Boolean(activity.isContentApproved && rawApproved && activity.publishedSchedule);

  let safeSnapshot: MemberSafeWorkshopSnapshot | MemberSafePerformanceSnapshot | undefined = undefined;

  if (rawApproved) {
    if (activity.type === "WORKSHOP") {
      const ws = rawApproved as WorkshopSnapshot;
      const safeSpeakers: MemberSafeSpeaker[] = (ws.speakers || []).map((sp) => ({
        id: sp.id,
        fullName: sp.fullName,
        positionTitle: sp.positionTitle,
        organizationName: sp.organizationName,
        country: sp.country,
        photo: sp.photo,
        shortBio: sp.shortBio,
      }));

      safeSnapshot = {
        title: ws.title || { en: "Untitled Workshop", vi: "Workshop" },
        shortDescription: ws.shortDescription || { en: "", vi: "" },
        fullDescription: ws.fullDescription,
        language: ws.language || "English",
        otherLanguage: ws.otherLanguage,
        durationMinutes: ws.durationMinutes || 0,
        format: ws.format || "Interactive Workshop",
        otherFormat: ws.otherFormat,
        targetAudience: ws.targetAudience,
        keyTakeaways: ws.keyTakeaways,
        speakers: safeSpeakers,
        coverImage: ws.coverImage,
      };
    } else {
      const ps = rawApproved as StagePerformanceSnapshot;
      safeSnapshot = {
        title: ps.title || { en: "Untitled Performance", vi: "Biểu diễn" },
        performanceType: ps.performanceType || "Cultural Performance",
        otherPerformanceType: ps.otherPerformanceType,
        countryOrCultureRepresented: ps.countryOrCultureRepresented || "",
        shortDescription: ps.shortDescription || { en: "", vi: "" },
        culturalMeaning: ps.culturalMeaning,
        numberOfPerformers: ps.numberOfPerformers || 1,
        durationMinutes: ps.durationMinutes || 0,
        mcIntroduction: ps.mcIntroduction,
        performanceCover: ps.performanceCover,
      };
    }
  }

  let safeSchedule: MemberSafeActivityDTO["publishedSchedule"] = undefined;
  if (activity.publishedSchedule) {
    const ps = activity.publishedSchedule as ActivityPublishedSchedule;
    safeSchedule = {
      dateKey: ps.dateKey,
      startTime: ps.startTime,
      endTime: ps.endTime,
      venue: ps.venue,
    };
  }

  const isHistoricalUnavailable = !safeSchedule || !activity.isContentApproved || !rawApproved;

  return {
    _id: activity._id.toString(),
    editionId: activity.editionId.toString(),
    organizationId: activity.organizationId.toString(),
    type: activity.type,
    approvedSnapshot: safeSnapshot,
    publishedSchedule: safeSchedule,
    isSelectable,
    isHistoricalUnavailable,
  };
}
