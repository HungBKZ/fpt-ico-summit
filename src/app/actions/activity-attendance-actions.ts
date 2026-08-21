"use server";

import { ObjectId } from "mongodb";
import { getMongoClient, getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { findActivityById } from "@/lib/db/repositories/summit-activities";
import { findSelection } from "@/lib/db/repositories/summit-activity-selections";
import {
  createAttendance,
  deleteAttendance,
  findAttendance,
  searchWalkInCandidates,
  type WalkInCandidateRow,
} from "@/lib/db/repositories/summit-activity-attendances";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import type { SummitRegistration } from "@/lib/db/models/summit-registration";

/**
 * Server Action: Mark attendance for a participant at a scheduled activity.
 * Strict IDOR protection & server-authoritative source determination.
 */
export async function markActivityAttendanceAction(
  activityIdStr: string,
  registrationIdStr: string
): Promise<{ success: boolean; attendedAt?: Date; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    let actObjId: ObjectId;
    let regObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityIdStr);
      regObjId = new ObjectId(registrationIdStr);
    } catch {
      return { success: false, error: "Invalid activity or registration ID format." };
    }

    // 1. Verify Activity belongs to active edition and is currently eligible for attendance marking
    const activity = await findActivityById(actObjId);
    if (
      !activity ||
      !activity._id ||
      !activity.editionId.equals(activeEdition._id) ||
      !activity.isContentApproved ||
      !activity.approvedSnapshot ||
      !activity.publishedSchedule
    ) {
      return {
        success: false,
        error: "Activity is not currently available for attendance marking.",
      };
    }

    // 2. Verify Registration belongs to active edition and is REGISTERED (IDOR protection)
    const db = await getDb();
    const registration = await db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .findOne({ _id: regObjId, editionId: activeEdition._id, status: "REGISTERED" });

    if (!registration || !registration._id) {
      return {
        success: false,
        error: "Active participant registration record not found for this edition.",
      };
    }

    // 3. Determine source server-side
    const selection = await findSelection(registration._id, actObjId);
    const source = selection ? ("SELECTED" as const) : ("WALK_IN" as const);
    const activityDayKey = activity.publishedSchedule.dateKey;

    // 4. Pre-check existing attendance
    const existing = await findAttendance(registration._id, actObjId);
    if (existing) {
      return { success: true, attendedAt: existing.attendedAt }; // Idempotent success
    }

    const now = new Date();
    const attendanceDoc = {
      editionId: activeEdition._id,
      activityId: actObjId,
      registrationId: registration._id,
      activityDayKey,
      source,
      status: "PRESENT" as const,
      attendedAt: now,
      markedBy: dbUser._id!,
      createdAt: now,
    };

    // 5. Transaction for insert + audit
    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await createAttendance(attendanceDoc, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_ATTENDANCE_MARKED",
            actorUserId: dbUser._id,
            organizationId: activity.organizationId,
            metadata: {
              editionId: activeEdition._id!.toString(),
              activityId: actObjId.toString(),
              registrationId: registration._id!.toString(),
              source,
              activityDayKey,
            },
          },
          session
        );
      });
      return { success: true, attendedAt: now };
    } catch (txErr: unknown) {
      // Catch E11000 race condition outside transaction
      const isDuplicateKey =
        txErr &&
        typeof txErr === "object" &&
        "code" in txErr &&
        (txErr as { code?: number }).code === 11000;

      if (isDuplicateKey) {
        const rechecked = await findAttendance(registration._id, actObjId);
        if (rechecked) {
          return { success: true, attendedAt: rechecked.attendedAt };
        }
      }
      throw txErr;
    } finally {
      await session.endSession();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark attendance.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Undo/correct attendance for a participant.
 * Does NOT require activity to still have publishedSchedule (Refinement Rule #3).
 */
export async function undoActivityAttendanceAction(
  activityIdStr: string,
  registrationIdStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    let actObjId: ObjectId;
    let regObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityIdStr);
      regObjId = new ObjectId(registrationIdStr);
    } catch {
      return { success: false, error: "Invalid activity or registration ID format." };
    }

    // Verify activity exists and belongs to active edition
    const activity = await findActivityById(actObjId);
    if (!activity || !activity._id || !activity.editionId.equals(activeEdition._id)) {
      return { success: false, error: "Activity record not found for this edition." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const deleted = await deleteAttendance(regObjId, actObjId, session);
        if (deleted) {
          await createAuditEntry(
            {
              action: "SUMMIT_ACTIVITY_ATTENDANCE_REMOVED",
              actorUserId: dbUser._id,
              organizationId: activity.organizationId,
              metadata: {
                editionId: activeEdition._id!.toString(),
                activityId: actObjId.toString(),
                registrationId: regObjId.toString(),
              },
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
    const msg = err instanceof Error ? err.message : "Failed to undo attendance.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Search TRUE walk-in candidates.
 */
export async function searchWalkInCandidatesAction(
  activityIdStr: string,
  queryStr: string
): Promise<{ success: boolean; candidates?: WalkInCandidateRow[]; error?: string }> {
  try {
    await requireSummitOperationsAccess();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    let actObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityIdStr);
    } catch {
      return { success: false, error: "Invalid activity ID format." };
    }

    const candidates = await searchWalkInCandidates({
      editionId: activeEdition._id,
      activityId: actObjId,
      query: queryStr,
    });

    return { success: true, candidates };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to search walk-in candidates.";
    return { success: false, error: msg };
  }
}
