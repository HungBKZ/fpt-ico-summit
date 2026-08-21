"use server";

import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/db/mongodb";
import { requirePartner, requireAdmin } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { isParticipationConfirmed } from "@/lib/db/repositories/organization-participations";
import { v2 as cloudinary } from "cloudinary";
import { sanitizeHtml } from "@/lib/utils/sanitizer";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import {
  createSummitActivity,
  findActivityById,
  updateActivityDraft,
  submitActivityForReview,
  requestActivityChanges,
  approveActivityContent,
} from "@/lib/db/repositories/summit-activities";
import type {
  SummitActivity,
  ActivityType,
  WorkshopSnapshot,
  StagePerformanceSnapshot,
  WorkshopSpeaker,
  MediaAsset,
  WorkshopLanguage,
  WorkshopFormat,
  PerformanceType,
} from "@/lib/db/models/summit-activity";

/**
 * Validates that an external material URL uses safe HTTP or HTTPS protocol only.
 */
function isSafeUrl(url?: string): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return false;
  }
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

/**
 * Validates basic email string format.
 */
function isValidEmail(emailStr?: string): boolean {
  if (!emailStr || !emailStr.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
}

/**
 * Server-side security verification of Cloudinary activity image.
 * Authenticates Partner, re-queries Partner org, verifies activity ownership, checks editability,
 * validates publicId namespace prefix, and queries Cloudinary Admin API to verify image specs.
 */
async function verifyCloudinaryActivityImage(
  publicId: string,
  activityId: string
): Promise<{ success: boolean; asset?: MediaAsset; error?: string }> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "No organization associated with caller." };
    }

    const activity = await findActivityById(activityId);
    if (!activity || !activity._id) {
      return { success: false, error: "Activity proposal not found." };
    }

    if (!activity.organizationId.equals(dbUser.organizationId)) {
      return { success: false, error: "Unauthorized access to activity proposal image." };
    }

    if (activity.draftStatus === "IN_REVIEW") {
      return { success: false, error: "Proposal is currently in review and cannot be modified." };
    }

    const expectedFolderPrefix = `fpt-ico-summit/organizations/${dbUser.organizationId.toString()}/activities/${activityId}/images/`;
    if (!publicId.startsWith(expectedFolderPrefix)) {
      return {
        success: false,
        error: `Invalid asset folder namespace prefix. Public ID must start with: ${expectedFolderPrefix}`,
      };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: "Server Cloudinary configuration missing." };
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const resource = await cloudinary.api.resource(publicId);
    if (!resource || resource.resource_type !== "image") {
      return { success: false, error: "Cloudinary resource is not a valid image." };
    }

    const allowedFormats = ["jpg", "jpeg", "png", "webp"];
    if (!allowedFormats.includes(resource.format?.toLowerCase())) {
      return {
        success: false,
        error: `Image format '${resource.format}' is not allowed. Expected: jpg, jpeg, png, webp.`,
      };
    }

    if (resource.bytes > 8 * 1024 * 1024) {
      return { success: false, error: "Image file size exceeds 8 MB limit." };
    }

    if (!resource.width || !resource.height || resource.width <= 0 || resource.height <= 0) {
      return { success: false, error: "Invalid image dimensions." };
    }

    return {
      success: true,
      asset: {
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        resourceType: "image",
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cloudinary image verification failed.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Partner creates a new DRAFT activity proposal (WORKSHOP or STAGE_PERFORMANCE).
 */
export async function createActivityDraftAction(
  type: ActivityType
): Promise<{ success: boolean; activityId?: string; error?: string }> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "No organization linked to partner account." };
    }

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No active Summit edition open for proposal creation." };
    }

    const now = new Date();
    const initialSnapshot: WorkshopSnapshot | StagePerformanceSnapshot =
      type === "WORKSHOP"
        ? {
            title: { en: "" },
            shortDescription: { en: "" },
            language: "ENGLISH",
            durationMinutes: 45,
            format: "TALK",
            speakers: [],
          }
        : {
            title: { en: "" },
            performanceType: "CULTURAL_PERFORMANCE",
            countryOrCultureRepresented: "",
            shortDescription: { en: "" },
            numberOfPerformers: 1,
            durationMinutes: 15,
            contactPersonName: "",
            email: dbUser.email,
          };

    const doc: Omit<SummitActivity, "_id"> = {
      editionId: activeEdition._id,
      organizationId: dbUser.organizationId,
      createdBy: dbUser._id!,
      type,
      isContentApproved: false,
      draftStatus: "DRAFT",
      draftSnapshot: initialSnapshot,
      createdAt: now,
      updatedAt: now,
    };

    const client = await getMongoClient();
    const session = client.startSession();
    let createdId: ObjectId;

    try {
      createdId = await session.withTransaction(async () => {
        const id = await createSummitActivity(doc, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_CREATED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { activityId: id.toString(), type },
          },
          session
        );
        return id;
      });
    } finally {
      await session.endSession();
    }

    return { success: true, activityId: createdId.toString() };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create activity draft.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Partner saves draft edits to an activity proposal.
 */
export async function saveActivityDraftAction(
  activityId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "No organization associated with account." };
    }

    const activity = await findActivityById(activityId);
    if (!activity || !activity._id) {
      return { success: false, error: "Activity proposal not found." };
    }

    if (!activity.organizationId.equals(dbUser.organizationId)) {
      return { success: false, error: "Unauthorized access to this activity proposal." };
    }

    if (activity.draftStatus === "IN_REVIEW") {
      return { success: false, error: "Proposal is currently in review and cannot be modified." };
    }

    // Process materials URLs and validate protocol
    const slideUrl = String(formData.get("slideUrl") || "").trim();
    const supportingContentUrl = String(formData.get("supportingContentUrl") || "").trim();
    const referenceUrl = String(formData.get("referenceUrl") || "").trim();
    const backingTrackUrl = String(formData.get("backingTrackUrl") || "").trim();
    const demoVideoUrl = String(formData.get("demoVideoUrl") || "").trim();

    if (
      !isSafeUrl(slideUrl) ||
      !isSafeUrl(supportingContentUrl) ||
      !isSafeUrl(referenceUrl) ||
      !isSafeUrl(backingTrackUrl) ||
      !isSafeUrl(demoVideoUrl)
    ) {
      return {
        success: false,
        error: "All material links must start with valid http:// or https:// protocols.",
      };
    }

    // Cover image server-side verification if provided
    let coverImage: MediaAsset | undefined;
    const coverPublicId = String(formData.get("coverPublicId") || "").trim();
    if (coverPublicId) {
      const verified = await verifyCloudinaryActivityImage(coverPublicId, activityId);
      if (verified.success && verified.asset) {
        coverImage = verified.asset;
      }
    }

    const dataPermissionConfirmed = formData.get("dataPermissionConfirmed") === "true";
    const materialAccessConfirmed = formData.get("materialAccessConfirmed") === "true";

    let updatedSnapshot: WorkshopSnapshot | StagePerformanceSnapshot;

    if (activity.type === "WORKSHOP") {
      const speakersJson = String(formData.get("speakersJson") || "[]");
      let rawSpeakers: WorkshopSpeaker[] = [];
      try {
        rawSpeakers = JSON.parse(speakersJson);
      } catch {
        rawSpeakers = [];
      }

      // Ensure stable id for each speaker
      const speakers: WorkshopSpeaker[] = rawSpeakers.map((sp, idx) => ({
        id: sp.id || `sp_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        fullName: String(sp.fullName || "").trim(),
        positionTitle: String(sp.positionTitle || "").trim(),
        organizationName: String(sp.organizationName || "").trim(),
        country: String(sp.country || "").trim(),
        shortBio: {
          en: String(sp.shortBio?.en || "").trim(),
          vi: String(sp.shortBio?.vi || "").trim() || undefined,
        },
        email: String(sp.email || "").trim(),
        phoneOrWhatsapp: String(sp.phoneOrWhatsapp || "").trim() || undefined,
      }));

      const workshopDraft: WorkshopSnapshot = {
        title: {
          en: String(formData.get("titleEn") || "").trim(),
          vi: String(formData.get("titleVi") || "").trim() || undefined,
        },
        shortDescription: {
          en: String(formData.get("shortDescEn") || "").trim(),
          vi: String(formData.get("shortDescVi") || "").trim() || undefined,
        },
        fullDescription: {
          en: sanitizeHtml(String(formData.get("fullDescEn") || "")) || undefined,
          vi: sanitizeHtml(String(formData.get("fullDescVi") || "")) || undefined,
        },
        language: (String(formData.get("language") || "ENGLISH") as WorkshopLanguage),
        otherLanguage: String(formData.get("otherLanguage") || "").trim() || undefined,
        durationMinutes: Math.max(1, Number(formData.get("durationMinutes")) || 45),
        format: (String(formData.get("format") || "TALK") as WorkshopFormat),
        otherFormat: String(formData.get("otherFormat") || "").trim() || undefined,
        targetAudience: String(formData.get("targetAudience") || "").trim() || undefined,
        keyTakeaways: {
          en: sanitizeHtml(String(formData.get("keyTakeawaysEn") || "")) || undefined,
          vi: sanitizeHtml(String(formData.get("keyTakeawaysVi") || "")) || undefined,
        },
        speakers,
        coverImage: coverImage || (activity.draftSnapshot as WorkshopSnapshot).coverImage,
        slideUrl: slideUrl || undefined,
        supportingContentUrl: supportingContentUrl || undefined,
        referenceUrl: referenceUrl || undefined,
        technicalRequirements: {
          projector: formData.get("techProjector") === "true",
          microphone: formData.get("techMicrophone") === "true",
          speakersAudio: formData.get("techSpeakersAudio") === "true",
          internet: formData.get("techInternet") === "true",
          whiteboard: formData.get("techWhiteboard") === "true",
          otherEquipment: String(formData.get("techOtherEquipment") || "").trim() || undefined,
          additionalRequirements: String(formData.get("techAdditionalRequirements") || "").trim() || undefined,
        },
        materialAccessConfirmed,
        dataPermissionConfirmed,
      };
      updatedSnapshot = workshopDraft;
    } else {
      const performanceDraft: StagePerformanceSnapshot = {
        title: {
          en: String(formData.get("titleEn") || "").trim(),
          vi: String(formData.get("titleVi") || "").trim() || undefined,
        },
        performanceType: (String(formData.get("performanceType") || "CULTURAL_PERFORMANCE") as PerformanceType),
        otherPerformanceType: String(formData.get("otherPerformanceType") || "").trim() || undefined,
        countryOrCultureRepresented: String(formData.get("countryOrCultureRepresented") || "").trim(),
        shortDescription: {
          en: String(formData.get("shortDescEn") || "").trim(),
          vi: String(formData.get("shortDescVi") || "").trim() || undefined,
        },
        culturalMeaning: {
          en: sanitizeHtml(String(formData.get("culturalMeaningEn") || "")) || undefined,
          vi: sanitizeHtml(String(formData.get("culturalMeaningVi") || "")) || undefined,
        },
        numberOfPerformers: Math.max(1, Number(formData.get("numberOfPerformers")) || 1),
        durationMinutes: Math.max(1, Number(formData.get("durationMinutes")) || 15),
        mcIntroduction: {
          en: String(formData.get("mcIntroEn") || "").trim() || undefined,
          vi: String(formData.get("mcIntroVi") || "").trim() || undefined,
        },
        contactPersonName: String(formData.get("contactPersonName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phoneOrWhatsapp: String(formData.get("phoneOrWhatsapp") || "").trim() || undefined,
        performanceCover: coverImage || (activity.draftSnapshot as StagePerformanceSnapshot).performanceCover,
        backingTrackUrl: backingTrackUrl || undefined,
        demoVideoUrl: demoVideoUrl || undefined,
        supportingContentUrl: supportingContentUrl || undefined,
        stageRequirements: {
          microphonesRequired: Number(formData.get("microphonesRequired")) || undefined,
          propsOrInstruments: String(formData.get("propsOrInstruments") || "").trim() || undefined,
          stageSetupRequirements: String(formData.get("stageSetupRequirements") || "").trim() || undefined,
          audioRequirements: String(formData.get("audioRequirements") || "").trim() || undefined,
          lightingRequirements: String(formData.get("lightingRequirements") || "").trim() || undefined,
          specialEquipment: String(formData.get("specialEquipment") || "").trim() || undefined,
          safetyNotes: String(formData.get("safetyNotes") || "").trim() || undefined,
        },
        materialAccessConfirmed,
        dataPermissionConfirmed,
      };
      updatedSnapshot = performanceDraft;
    }

    const activityIdObj = activity._id;
    const client = await getMongoClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await updateActivityDraft(activityIdObj, updatedSnapshot, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_DRAFT_SAVED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { activityId: activityIdObj.toString(), type: activity.type },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save draft.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Partner submits activity proposal for Admin review.
 * Enforces Active Organization Participation rule, Dual Confirmations, and Mandatory Field Validation.
 */
export async function submitActivityForReviewAction(
  activityId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const saveRes = await saveActivityDraftAction(activityId, formData);
    if (!saveRes.success) {
      return saveRes;
    }

    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "No organization associated with partner account." };
    }

    const activity = await findActivityById(activityId);
    if (!activity || !activity._id) {
      return { success: false, error: "Activity proposal not found." };
    }

    // 1. ACTIVE PARTICIPATION SUBMIT RULE
    const confirmedParticipation = await isParticipationConfirmed(dbUser.organizationId, activity.editionId);
    if (!confirmedParticipation) {
      return {
        success: false,
        error: "Your organization participation for this Summit edition must be confirmed before submitting activity proposals.",
      };
    }

    const activityIdObj = activity._id;
    const snapshot = activity.draftSnapshot;

    // 2. DUAL CONFIRMATION CHECKS
    if (!snapshot.dataPermissionConfirmed) {
      return {
        success: false,
        error: "You must confirm that you are authorized to provide speaker/contact information and media for Summit purposes.",
      };
    }

    if (activity.type === "WORKSHOP") {
      const ws = snapshot as WorkshopSnapshot;
      const hasMaterialLinks = Boolean(
        (ws.slideUrl && ws.slideUrl.trim() !== "") ||
        (ws.supportingContentUrl && ws.supportingContentUrl.trim() !== "") ||
        (ws.referenceUrl && ws.referenceUrl.trim() !== "")
      );

      if (hasMaterialLinks && !ws.materialAccessConfirmed) {
        return {
          success: false,
          error: "You must confirm that material access links are accessible to the Summit organizing team.",
        };
      }

      // Mandatory fields for Workshop
      if (!ws.title?.en) return { success: false, error: "English Title is required." };
      if (!ws.shortDescription?.en) return { success: false, error: "English Short Description is required." };
      if (!ws.durationMinutes || ws.durationMinutes <= 0) return { success: false, error: "Valid duration is required." };
      if (!ws.language) return { success: false, error: "Language is required." };
      if (!ws.format) return { success: false, error: "Format is required." };
      if (!ws.speakers || ws.speakers.length === 0) return { success: false, error: "At least one speaker is required for a Workshop proposal." };

      for (let i = 0; i < ws.speakers.length; i++) {
        const sp = ws.speakers[i];
        if (!sp.id || !sp.fullName || !sp.positionTitle || !sp.organizationName || !sp.country || !sp.shortBio?.en || !sp.email) {
          return { success: false, error: `Speaker #${i + 1} is missing mandatory required fields (Full Name, Position, Organization, Country, Bio, Email).` };
        }
        if (!isValidEmail(sp.email)) {
          return { success: false, error: `Speaker #${i + 1} has an invalid contact email format.` };
        }
      }
    } else {
      const ps = snapshot as StagePerformanceSnapshot;
      const hasMaterialLinks = Boolean(
        (ps.backingTrackUrl && ps.backingTrackUrl.trim() !== "") ||
        (ps.demoVideoUrl && ps.demoVideoUrl.trim() !== "") ||
        (ps.supportingContentUrl && ps.supportingContentUrl.trim() !== "")
      );

      if (hasMaterialLinks && !ps.materialAccessConfirmed) {
        return {
          success: false,
          error: "You must confirm that submitted media links are accessible to the Summit organizing team.",
        };
      }

      // Mandatory fields for Performance
      if (!ps.title?.en) return { success: false, error: "English Title is required." };
      if (!ps.shortDescription?.en) return { success: false, error: "English Short Description is required." };
      if (!ps.performanceType) return { success: false, error: "Performance Type is required." };
      if (!ps.countryOrCultureRepresented) return { success: false, error: "Country or Culture Represented is required." };
      if (!ps.numberOfPerformers || ps.numberOfPerformers <= 0) return { success: false, error: "Valid number of performers is required." };
      if (!ps.durationMinutes || ps.durationMinutes <= 0) return { success: false, error: "Valid duration is required." };
      if (!ps.contactPersonName) return { success: false, error: "Contact Person Name is required." };
      if (!ps.email || !isValidEmail(ps.email)) return { success: false, error: "Valid contact email is required." };
    }

    const client = await getMongoClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await submitActivityForReview(activityIdObj, dbUser._id!, true, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_SUBMITTED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { activityId: activityIdObj.toString(), type: activity.type },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit proposal for review.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action (ADMIN ONLY): Request changes on an activity proposal with feedback.
 */
export async function requestActivityChangesAction(
  activityId: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireAdmin();
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) {
      return { success: false, error: "Feedback note is required when requesting changes." };
    }

    const activity = await findActivityById(activityId);
    if (!activity || !activity._id) {
      return { success: false, error: "Activity proposal not found." };
    }

    const activityIdObj = activity._id;
    const client = await getMongoClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await requestActivityChanges(activityIdObj, trimmedFeedback, dbUser._id!, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_CHANGES_REQUESTED",
            actorUserId: dbUser._id,
            organizationId: activity.organizationId,
            metadata: { activityId: activityIdObj.toString(), feedback: trimmedFeedback },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to request changes.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action (ADMIN ONLY): Approve activity proposal content.
 * Copies draftSnapshot -> approvedSnapshot, sets isContentApproved = true, draftStatus = "NONE".
 */
export async function approveActivityContentAction(
  activityId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireAdmin();

    const activity = await findActivityById(activityId);
    if (!activity || !activity._id) {
      return { success: false, error: "Activity proposal not found." };
    }

    const activityIdObj = activity._id;
    const client = await getMongoClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await approveActivityContent(activityIdObj, activity.draftSnapshot, dbUser._id!, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_CONTENT_APPROVED",
            actorUserId: dbUser._id,
            organizationId: activity.organizationId,
            metadata: { activityId: activityIdObj.toString(), type: activity.type },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve activity content.";
    return { success: false, error: msg };
  }
}
