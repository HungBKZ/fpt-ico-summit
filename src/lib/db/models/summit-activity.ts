/**
 * src/lib/db/models/summit-activity.ts
 *
 * Domain model for SummitActivity (Workshops & Stage Performances) for FPT ICO Summit 2026.
 * Extended with Workshop Tracks, AcceptedTopicSnapshot, 2-Stage Proposal Workflow, Performance Scopes & 20 Workshop Slots.
 */

import type { ObjectId } from "mongodb";
import type { WorkshopTrackId } from "@/lib/config/workshop-tracks";
import type { PerformanceScopeId } from "@/lib/config/performance-scopes";

export type ActivityType = "WORKSHOP" | "STAGE_PERFORMANCE";

export type ActivityDraftStatus =
  | "NONE"
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED";

export type WorkshopTopicReviewStatus =
  | "NONE"
  | "DRAFT"
  | "IN_REVIEW"
  | "CHANGES_REQUESTED"
  | "ACCEPTED";

export type WorkshopFormat =
  | "TALK"
  | "WORKSHOP"
  | "PANEL"
  | "INTERACTIVE_SESSION"
  | "OTHER";

export type WorkshopLanguage =
  | "ENGLISH"
  | "VIETNAMESE"
  | "BILINGUAL"
  | "OTHER";

export type MaterialSharingPermission =
  | "PUBLICLY_SHAREABLE"
  | "INTERNAL_USE_ONLY"
  | "DO_NOT_SHARE";

export type PerformanceType =
  | "TRADITIONAL_MUSIC"
  | "MODERN_MUSIC"
  | "DANCE"
  | "FASHION_SHOW"
  | "CULTURAL_PERFORMANCE"
  | "INSTRUMENTAL"
  | "OTHER";

export interface MediaAsset {
  publicId: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  resourceType?: "image" | "raw" | "video";
}

export interface WorkshopSpeaker {
  id: string; // Unique client-side ID for array management
  fullName: string;
  positionTitle: string;
  organizationName: string;
  country: string;
  photo?: MediaAsset;
  shortBio: {
    en: string;
    vi?: string;
  };
  // Internal Operational Info (PRIVACY PROTECTED)
  email: string;
  phoneOrWhatsapp?: string;
}

export interface WorkshopTechnicalRequirements {
  projector: boolean;
  microphone: boolean;
  speakersAudio: boolean;
  internet: boolean;
  whiteboard: boolean;
  otherEquipment?: string;
  additionalRequirements?: string;
}

export interface AcceptedTopicSnapshot {
  trackId?: WorkshopTrackId;
  topicSelectionType?: "SUGGESTED" | "CUSTOM";
  topicId?: string;
  customTopicTitle?: string;
  customTopicFitReason?: string;
  tentativeTitle: {
    en: string;
    vi?: string;
  };
  conceptSummary: {
    en: string;
    vi?: string;
  };
  presentationLanguage: WorkshopLanguage;
  otherLanguage?: string;
  acceptedAt: Date;
  acceptedBy: ObjectId;
}

export interface WorkshopSnapshot {
  title: {
    en: string;
    vi?: string;
  };
  shortDescription: {
    en: string;
    vi?: string;
  };
  fullDescription?: {
    en?: string; // Rich text HTML
    vi?: string; // Rich text HTML
  };
  language: WorkshopLanguage;
  otherLanguage?: string;
  interpretationRequired?: boolean;
  interpretationNotes?: string;
  durationMinutes: number; // Canonical 30 min for new Workshop proposals
  format: WorkshopFormat;
  otherFormat?: string;
  targetAudience?: string;
  keyTakeaways?: {
    en?: string; // Rich text HTML
    vi?: string; // Rich text HTML
  };
  speakers: WorkshopSpeaker[];
  coverImage?: MediaAsset;
  // External Material Links (HTTP/HTTPS ONLY)
  slideUrl?: string;
  supportingContentUrl?: string;
  referenceUrl?: string;
  materialSharingPermission?: MaterialSharingPermission;
  technicalRequirements?: WorkshopTechnicalRequirements;
  materialAccessConfirmed?: boolean;
  dataPermissionConfirmed?: boolean;
}

export interface StageRequirements {
  microphonesRequired?: number;
  propsOrInstruments?: string;
  stageSetupRequirements?: string;
  audioRequirements?: string;
  lightingRequirements?: string;
  specialEquipment?: string;
  safetyNotes?: string;
}

export interface StagePerformanceSnapshot {
  title: {
    en: string;
    vi?: string;
  };
  performanceType: PerformanceType;
  otherPerformanceType?: string;
  countryOrCultureRepresented: string;
  shortDescription: {
    en: string;
    vi?: string;
  };
  culturalMeaning?: {
    en?: string; // Rich text HTML
    vi?: string; // Rich text HTML
  };
  numberOfPerformers: number;
  durationMinutes: number;
  mcIntroduction?: {
    en?: string;
    vi?: string;
  };
  // Internal Operational Contact (PRIVACY PROTECTED)
  contactPersonName: string;
  email: string;
  phoneOrWhatsapp?: string;
  // Media Assets & Links (HTTP/HTTPS ONLY)
  performanceCover?: MediaAsset;
  backingTrackUrl?: string;
  demoVideoUrl?: string;
  supportingContentUrl?: string;
  stageRequirements?: StageRequirements;
  materialAccessConfirmed?: boolean;
  dataPermissionConfirmed?: boolean;
}

export interface ActivityReviewInfo {
  submittedAt?: Date;
  submittedBy?: ObjectId;
  feedback?: string;
  reviewedAt?: Date;
  reviewedBy?: ObjectId;
}

/** Staff-managed operational schedule draft (Phase 5C & Web Realignment) */
export interface ActivityScheduleDraft {
  dateKey: string;           // "2026-11-21" | "2026-11-22"
  startTime: string;         // "08:30" (HH:mm, 24h)
  endTime: string;           // "09:00"
  venue: string;             // Free text: "Alpha 201", "Main Stage"
  workshopSlotId?: string;   // Predefined slot ID for WORKSHOP (e.g. "WS_2026_01")
  operationalNotes?: string;
  updatedBy: ObjectId;
  updatedAt: Date;
}

/** Published operational schedule visible to Partner/Member (Phase 5C & Web Realignment) */
export interface ActivityPublishedSchedule {
  dateKey: string;
  startTime: string;
  endTime: string;
  venue: string;
  workshopSlotId?: string;   // Predefined slot ID for WORKSHOP (e.g. "WS_2026_01")
  operationalNotes?: string;
  publishedBy: ObjectId;
  publishedAt: Date;
}

export interface SummitActivity {
  _id?: ObjectId;

  /** Reference to target SummitEdition */
  editionId: ObjectId;

  /** Reference to provider Organization */
  organizationId: ObjectId;

  /** User ID of the Partner account who created this proposal */
  createdBy: ObjectId;

  /** Activity classification */
  type: ActivityType;

  /** Workshop Track taxonomy & Topic proposal fields (WORKSHOP ONLY) */
  trackId?: WorkshopTrackId;
  topicSelectionType?: "SUGGESTED" | "CUSTOM";
  topicId?: string;
  customTopicTitle?: string;
  customTopicFitReason?: string;

  /** Two-Stage Workshop Topic Review status */
  topicReviewStatus?: WorkshopTopicReviewStatus;
  topicReviewFeedback?: string;
  topicSubmittedAt?: Date;

  /** Immutable snapshot of accepted topic when Admin accepts Topic Proposal */
  acceptedTopicSnapshot?: AcceptedTopicSnapshot;

  /** Stage Performance Scope classification (STAGE_PERFORMANCE ONLY) */
  performanceScopeId?: PerformanceScopeId;

  /** Dual approval state flags for Final Content */
  isContentApproved: boolean;
  draftStatus: ActivityDraftStatus;

  /** Active working draft modified by Partner */
  draftSnapshot: WorkshopSnapshot | StagePerformanceSnapshot;

  /** Authoritative approved snapshot published by Admin */
  approvedSnapshot?: WorkshopSnapshot | StagePerformanceSnapshot;

  /** Third-party data authorization confirmation metadata */
  dataPermissionConfirmed?: boolean;
  dataPermissionConfirmedAt?: Date;
  dataPermissionConfirmedBy?: ObjectId;

  /** Final Content Review history & feedback */
  review?: ActivityReviewInfo;

  approvedAt?: Date;
  approvedBy?: ObjectId;

  /** Operational schedule draft edited by SUMMIT_STAFF */
  scheduleDraft?: ActivityScheduleDraft;

  /** Published schedule visible to Partner/Member */
  publishedSchedule?: ActivityPublishedSchedule;

  createdAt: Date;
  updatedAt: Date;
}
