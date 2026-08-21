"use server";

import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/db/mongodb";
import { requireMember } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { findRegistrationByEditionAndUser } from "@/lib/db/repositories/summit-registrations";
import { findActivityById } from "@/lib/db/repositories/summit-activities";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import {
  createSelection,
  deleteSelection,
  findSelection,
  checkMemberScheduleConflict,
} from "@/lib/db/repositories/summit-activity-selections";

/**
 * Server Action: Authenticated Member selects an optional Summit activity.
 * Validates Member SummitRegistration, Activity eligibility, publishedSchedule, and time conflict.
 * Uses pre-check, transaction, E11000 duplicate handling outside transaction, and audit logging.
 */
export async function selectSummitActivityAction(
  activityIdStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireMember();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    const registration = await findRegistrationByEditionAndUser(activeEdition._id, dbUser._id!);
    if (!registration || registration.status !== "REGISTERED" || !registration._id) {
      return {
        success: false,
        error: "Please register for FPT ICO Summit before selecting optional activities.",
      };
    }

    let actObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityIdStr);
    } catch {
      return { success: false, error: "Invalid activity ID format." };
    }

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
        error: "This activity is not currently available for selection.",
      };
    }

    const sched = activity.publishedSchedule;

    // Time conflict check against Member's existing selections
    const conflict = await checkMemberScheduleConflict(
      registration._id,
      actObjId,
      sched.dateKey,
      sched.startTime,
      sched.endTime
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: `This activity overlaps with another activity you have already selected ("${conflict.conflictingActivityTitle}" at ${conflict.conflictingTime}).`,
      };
    }

    // Step A: Pre-check existing selection
    const existing = await findSelection(registration._id, actObjId);
    if (existing) {
      return { success: true }; // Idempotent success
    }

    const now = new Date();
    const selectionDoc = {
      editionId: activeEdition._id,
      registrationId: registration._id,
      activityId: actObjId,
      selectedAt: now,
      createdAt: now,
    };

    // Step B: Transaction for insert + audit
    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await createSelection(selectionDoc, session);
        await createAuditEntry(
          {
            action: "SUMMIT_ACTIVITY_SELECTED",
            actorUserId: dbUser._id,
            metadata: {
              registrationId: registration._id!.toString(),
              activityId: actObjId.toString(),
              editionId: activeEdition._id!.toString(),
            },
          },
          session
        );
      });
      return { success: true };
    } catch (txErr: unknown) {
      // Step C: Catch E11000 race condition outside transaction
      const isDuplicateKey =
        txErr &&
        typeof txErr === "object" &&
        "code" in txErr &&
        (txErr as { code?: number }).code === 11000;

      if (isDuplicateKey) {
        const rechecked = await findSelection(registration._id, actObjId);
        if (rechecked) {
          return { success: true };
        }
      }
      throw txErr;
    } finally {
      await session.endSession();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to select activity.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Authenticated Member removes their selection for an activity.
 * Derives registrationId server-side from Member + active edition.
 * Deletes record and logs SUMMIT_ACTIVITY_UNSELECTED audit entry inside transaction.
 */
export async function unselectSummitActivityAction(
  activityIdStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireMember();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { success: false, error: "No ACTIVE Summit edition found." };
    }

    const registration = await findRegistrationByEditionAndUser(activeEdition._id, dbUser._id!);
    if (!registration || !registration._id) {
      return { success: false, error: "Summit registration not found." };
    }

    let actObjId: ObjectId;
    try {
      actObjId = new ObjectId(activityIdStr);
    } catch {
      return { success: false, error: "Invalid activity ID format." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const deleted = await deleteSelection(registration._id!, actObjId, session);
        if (deleted) {
          await createAuditEntry(
            {
              action: "SUMMIT_ACTIVITY_UNSELECTED",
              actorUserId: dbUser._id,
              metadata: {
                registrationId: registration._id!.toString(),
                activityId: actObjId.toString(),
                editionId: activeEdition._id!.toString(),
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
    const msg = err instanceof Error ? err.message : "Failed to remove activity selection.";
    return { success: false, error: msg };
  }
}
