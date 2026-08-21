"use server";

import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { getMongoClient } from "@/lib/db/mongodb";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import { isValidDayKey } from "@/lib/utils/edition-utils";
import { getWorkshopSlotById } from "@/lib/config/workshop-slots";
import {
  createCheckIn,
  findCheckIn,
} from "@/lib/db/repositories/summit-check-ins";
import {
  findBoothAssignment,
  createBoothAssignment,
  updateBoothDraft,
  publishBoothAssignment,
  findBoothAssignmentById,
} from "@/lib/db/repositories/summit-booth-assignments";
import {
  findActivityById,
  checkScheduleConflict,
  checkWorkshopSlotConflict,
  updateActivityScheduleDraft,
  publishActivitySchedule,
} from "@/lib/db/repositories/summit-activities";
import type { BoothAssignmentSnapshot } from "@/lib/db/models/summit-booth-assignment";
import type { ActivityScheduleDraft } from "@/lib/db/models/summit-activity";

export async function checkInParticipantAction(
  registrationId: string,
  dayKey: string
): Promise<{ success: boolean; checkedInAt?: Date; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    if (!isValidDayKey(dayKey, activeEdition)) {
      return { success: false, error: "Invalid day for the current Summit edition." };
    }

    let regObjId: ObjectId;
    try {
      regObjId = new ObjectId(registrationId);
    } catch {
      return { success: false, error: "Invalid registration ID format." };
    }

    const db = await getDb();
    const registration = await db
      .collection(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .findOne({ _id: regObjId, editionId: activeEdition._id, status: "REGISTERED" });

    if (!registration) {
      return { success: false, error: "Active registration record not found for this edition." };
    }

    const existingCheckIn = await findCheckIn(regObjId, dayKey);
    if (existingCheckIn) {
      return { success: true, checkedInAt: existingCheckIn.checkedInAt };
    }

    const now = new Date();
    const checkInDoc = {
      editionId: activeEdition._id,
      registrationId: regObjId,
      dayKey,
      checkedInAt: now,
      checkedInBy: dbUser._id!,
      method: "MANUAL" as const,
      createdAt: now,
    };

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await createCheckIn(checkInDoc, session);
        await createAuditEntry(
          {
            action: "SUMMIT_PARTICIPANT_CHECKED_IN",
            actorUserId: dbUser._id,
            metadata: {
              registrationId: regObjId.toString(),
              dayKey,
              method: "MANUAL",
            },
          },
          session
        );
      });
      return { success: true, checkedInAt: now };
    } catch (txErr: unknown) {
      const isDuplicateKey =
        txErr &&
        typeof txErr === "object" &&
        "code" in txErr &&
        (txErr as { code?: number }).code === 11000;

      if (isDuplicateKey) {
        const rechecked = await findCheckIn(regObjId, dayKey);
        if (rechecked) {
          return { success: true, checkedInAt: rechecked.checkedInAt };
        }
      }
      throw txErr;
    } finally {
      await session.endSession();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Check-in failed.";
    return { success: false, error: msg };
  }
}

export async function getBoothPhotoUploadSignatureAction(
  organizationId: string
): Promise<{
  success: boolean;
  authorization?: {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
    uploadPreset: string;
    allowedFormats: string;
    maxFileSize: number;
  };
  error?: string;
}> {
  try {
    await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: "Cloudinary credentials missing on server environment." };
    }

    const presetName = process.env.CLOUDINARY_ACTIVITY_IMAGE_PRESET || "fpt_ico_activity_image";
    const folder = `fpt-ico-summit/editions/${activeEdition._id.toString()}/booths/${organizationId}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const allowedFormats = "jpg,jpeg,png,webp";
    const maxFileSize = 8 * 1024 * 1024;

    const paramsToSign = {
      folder,
      timestamp,
      upload_preset: presetName,
    };

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      success: true,
      authorization: {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
        uploadPreset: presetName,
        allowedFormats,
        maxFileSize,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to get upload signature.";
    return { success: false, error: msg };
  }
}

export async function saveBoothAssignmentDraftAction(
  organizationId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    let orgObjId: ObjectId;
    try {
      orgObjId = new ObjectId(organizationId);
    } catch {
      return { success: false, error: "Invalid organization ID." };
    }

    const db = await getDb();
    const participation = await db
      .collection(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
      .findOne({ organizationId: orgObjId, editionId: activeEdition._id, status: "CONFIRMED" });

    if (!participation) {
      return { success: false, error: "Organization has not confirmed participation in the active Summit edition." };
    }

    const boothLabel = String(formData.get("boothLabel") || "").trim() || undefined;
    const locationText = String(formData.get("locationText") || "").trim() || undefined;
    const note = String(formData.get("note") || "").trim() || undefined;
    const photoPublicId = String(formData.get("photoPublicId") || "").trim();
    const photoSecureUrl = String(formData.get("photoSecureUrl") || "").trim();

    let boothPhoto: BoothAssignmentSnapshot["boothPhoto"] = undefined;
    if (photoPublicId && photoSecureUrl) {
      boothPhoto = {
        publicId: photoPublicId,
        secureUrl: photoSecureUrl,
      };
    }

    const draftAssignment: BoothAssignmentSnapshot = {
      boothLabel,
      locationText,
      note,
      boothPhoto,
    };

    const existing = await findBoothAssignment(activeEdition._id, orgObjId);
    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        if (!existing) {
          const now = new Date();
          const newDoc = {
            editionId: activeEdition._id!,
            organizationId: orgObjId,
            draftAssignment,
            isPublished: false,
            assignedBy: dbUser._id!,
            assignedAt: now,
            createdAt: now,
            updatedAt: now,
          };
          const createdId = await createBoothAssignment(newDoc, session);
          await createAuditEntry(
            {
              action: "SUMMIT_BOOTH_ASSIGNED",
              actorUserId: dbUser._id,
              organizationId: orgObjId,
              metadata: { boothAssignmentId: createdId.toString() },
            },
            session
          );
        } else {
          if (!boothPhoto && existing.draftAssignment?.boothPhoto) {
            draftAssignment.boothPhoto = existing.draftAssignment.boothPhoto;
          }
          await updateBoothDraft(existing._id!, draftAssignment, dbUser._id!, session);
          await createAuditEntry(
            {
              action: "SUMMIT_BOOTH_UPDATED",
              actorUserId: dbUser._id,
              organizationId: orgObjId,
              metadata: { boothAssignmentId: existing._id!.toString() },
            },
            session
          );
        }
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save booth draft.";
    return { success: false, error: msg };
  }
}

export async function publishBoothAssignmentAction(
  boothAssignmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    let boothObjId: ObjectId;
    try {
      boothObjId = new ObjectId(boothAssignmentId);
    } catch {
      return { success: false, error: "Invalid booth assignment ID." };
    }

    const record = await findBoothAssignmentById(boothObjId);
    if (!record) {
      return { success: false, error: "Booth assignment record not found." };
    }

    if (!record.draftAssignment) {
      return { success: false, error: "Please enter booth details before publishing." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await publishBoothAssignment(boothObjId, dbUser._id!, session);
        await createAuditEntry(
          {
            action: "SUMMIT_BOOTH_PUBLISHED",
            actorUserId: dbUser._id,
            organizationId: record.organizationId,
            metadata: { boothAssignmentId: boothObjId.toString() },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to publish booth assignment.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Save activity schedule draft for an approved activity.
 * Supports predefined 20 Workshop slots (workshopSlotId) and enforces Correction #5 collision checks across DRAFT & PUBLISHED states.
 */
export async function saveActivityScheduleAction(
  activityId: string,
  dateKey: string,
  startTime: string,
  endTime: string,
  venue: string,
  operationalNotes?: string,
  workshopSlotId?: string
): Promise<{ success: boolean; scheduleDraft?: ActivityScheduleDraft; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    let actObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityId);
    } catch {
      return { success: false, error: "Invalid activity ID." };
    }

    const activity = await findActivityById(actObjId);
    if (!activity || !activity.isContentApproved) {
      return { success: false, error: "Only content-approved activities can be scheduled." };
    }

    let finalDateKey = dateKey;
    let finalStartTime = startTime;
    let finalEndTime = endTime;

    // Handle predefined Workshop slot reservation
    if (activity.type === "WORKSHOP" && workshopSlotId) {
      const slotDef = getWorkshopSlotById(workshopSlotId);
      if (!slotDef) {
        return { success: false, error: `Invalid Workshop slot ID: ${workshopSlotId}` };
      }
      finalDateKey = slotDef.dateKey;
      finalStartTime = slotDef.startTime;
      finalEndTime = slotDef.endTime;

      // Correction #5: Server-side Workshop Slot Collision Check across DRAFT and PUBLISHED states!
      const slotConflict = await checkWorkshopSlotConflict(activeEdition._id, actObjId, workshopSlotId);
      if (slotConflict.hasConflict) {
        return {
          success: false,
          error: `Workshop slot ${slotDef.slotId} (${slotDef.sessionGroup.en} ${slotDef.startTime}-${slotDef.endTime}) is already reserved by "${slotConflict.conflictingActivityTitle}" (${slotConflict.conflictingState} schedule).`,
        };
      }
    }

    if (!isValidDayKey(finalDateKey, activeEdition)) {
      return { success: false, error: "Selected date is outside the Summit edition date range." };
    }

    if (!finalStartTime || !finalEndTime || finalStartTime >= finalEndTime) {
      return { success: false, error: "Start time must be before End time." };
    }

    const trimmedVenue = venue.trim();
    if (!trimmedVenue) {
      return { success: false, error: "Venue / Room / Stage is required." };
    }

    // Venue overlap conflict detection
    const conflict = await checkScheduleConflict(
      activeEdition._id,
      actObjId,
      finalDateKey,
      trimmedVenue,
      finalStartTime,
      finalEndTime
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: `Schedule conflict detected! Venue "${trimmedVenue}" is already booked for "${conflict.conflictingActivityTitle}" (${conflict.conflictingTime}).`,
      };
    }

    const scheduleDraft: ActivityScheduleDraft = {
      dateKey: finalDateKey,
      startTime: finalStartTime,
      endTime: finalEndTime,
      venue: trimmedVenue,
      workshopSlotId: workshopSlotId || undefined,
      operationalNotes: operationalNotes?.trim() || undefined,
      updatedBy: dbUser._id!,
      updatedAt: new Date(),
    };

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await updateActivityScheduleDraft(actObjId, scheduleDraft, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_SCHEDULE_SAVED",
            actorUserId: dbUser._id,
            organizationId: activity.organizationId,
            metadata: { activityId: actObjId.toString(), dateKey: finalDateKey, venue: trimmedVenue, workshopSlotId },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true, scheduleDraft };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save schedule draft.";
    return { success: false, error: msg };
  }
}

export async function publishActivityScheduleAction(
  activityId: string
): Promise<{
  success: boolean;
  publishedSchedule?: import("@/lib/db/models/summit-activity").ActivityPublishedSchedule;
  error?: string;
}> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    let actObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityId);
    } catch {
      return { success: false, error: "Invalid activity ID." };
    }

    const activity = await findActivityById(actObjId);
    if (!activity || !activity.isContentApproved) {
      return { success: false, error: "Only content-approved activities can be published." };
    }

    if (!activity.scheduleDraft) {
      return { success: false, error: "Please save a schedule draft before publishing." };
    }

    const now = new Date();
    const publishedSchedule = {
      dateKey: activity.scheduleDraft.dateKey,
      startTime: activity.scheduleDraft.startTime,
      endTime: activity.scheduleDraft.endTime,
      venue: activity.scheduleDraft.venue,
      workshopSlotId: activity.scheduleDraft.workshopSlotId,
      publishedAt: now,
      publishedBy: dbUser._id!,
    };

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await publishActivitySchedule(actObjId, dbUser._id!, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_SCHEDULE_PUBLISHED",
            actorUserId: dbUser._id,
            organizationId: activity.organizationId,
            metadata: { activityId: actObjId.toString(), workshopSlotId: publishedSchedule.workshopSlotId },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true, publishedSchedule };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to publish schedule.";
    return { success: false, error: msg };
  }
}
