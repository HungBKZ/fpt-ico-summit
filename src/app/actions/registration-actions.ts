"use server";

import { MongoError } from "mongodb";
import { getMongoClient } from "@/lib/db/mongodb";
import { requireMember } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import {
  findRegistrationByEditionAndUser,
  createSummitRegistration,
} from "@/lib/db/repositories/summit-registrations";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import type {
  SummitRegistration,
  ParticipantType,
} from "@/lib/db/models/summit-registration";
import type { SummitEdition } from "@/lib/db/models/summit-edition";

export interface RegisterResult {
  success: boolean;
  error?: string;
  alreadyRegistered?: boolean;
  registration?: SummitRegistration;
}

/**
 * Server Action: Authenticated Member registers for the current ACTIVE SummitEdition.
 * Auto-confirms upon submission. Enforces E11000 duplicate race handling cleanly.
 */
export async function registerForSummitAction(formData: FormData): Promise<RegisterResult> {
  try {
    const { dbUser } = await requireMember();

    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return {
        success: false,
        error: "No active Summit edition is currently open for registration.",
      };
    }

    // 1. Check pre-existing registration
    const existing = await findRegistrationByEditionAndUser(
      activeEdition._id,
      dbUser._id!
    );
    if (existing) {
      return {
        success: true,
        alreadyRegistered: true,
        registration: JSON.parse(JSON.stringify(existing)),
      };
    }

    // 2. Validate live Member profile classification
    if (!dbUser.profile?.memberType) {
      return {
        success: false,
        error: "Please complete your account classification before registering for the Summit.",
      };
    }

    const isFptStudent = dbUser.profile.memberType === "FPT_CANTHO_STUDENT";
    const participantType: ParticipantType = isFptStudent
      ? "FPT_STUDENT"
      : "EXTERNAL_PARTICIPANT";

    const studentId = isFptStudent ? dbUser.profile.studentId : undefined;
    if (isFptStudent && !studentId) {
      return {
        success: false,
        error: "Your profile is missing a Student ID (MSSV). Please update your member profile.",
      };
    }

    const fullName = String(formData.get("fullName") || dbUser.name).trim();
    if (!fullName) {
      return { success: false, error: "Full Name is required for registration." };
    }

    const phone = String(formData.get("phone") || dbUser.profile?.phone || "").trim();
    if (!phone) {
      return { success: false, error: "Phone Number is required for registration." };
    }

    // Prepare immutable attendee snapshot
    const attendeeSnapshot: {
      fullName: string;
      phone: string;
      email: string;
      studentId?: string;
    } = {
      fullName,
      phone,
      email: dbUser.email,
    };
    if (isFptStudent && studentId) {
      attendeeSnapshot.studentId = studentId;
    }

    const now = new Date();
    const registrationDoc: Omit<SummitRegistration, "_id"> = {
      editionId: activeEdition._id,
      userId: dbUser._id!,
      participantType,
      attendeeSnapshot,
      status: "REGISTERED",
      registeredAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const client = await getMongoClient();
    const session = client.startSession();
    let createdId;

    try {
      await session.withTransaction(async () => {
        createdId = await createSummitRegistration(registrationDoc, session);

        await createAuditEntry(
          {
            action: "SUMMIT_REGISTRATION_CREATED",
            actorUserId: dbUser._id,
            targetUserId: dbUser._id,
            metadata: {
              editionId: activeEdition._id!.toString(),
              participantType,
              registrationId: createdId.toString(),
            },
          },
          session
        );
      });
    } catch (err: unknown) {
      // Race safety: handle E11000 duplicate key exception safely
      if (
        (err instanceof MongoError && err.code === 11000) ||
        (err instanceof Error && err.message.includes("E11000"))
      ) {
        const raceExisting = await findRegistrationByEditionAndUser(
          activeEdition._id,
          dbUser._id!
        );
        return {
          success: true,
          alreadyRegistered: true,
          registration: raceExisting ? JSON.parse(JSON.stringify(raceExisting)) : undefined,
        };
      }
      throw err;
    } finally {
      await session.endSession();
    }

    const createdRecord = await findRegistrationByEditionAndUser(
      activeEdition._id,
      dbUser._id!
    );

    return {
      success: true,
      alreadyRegistered: false,
      registration: createdRecord ? JSON.parse(JSON.stringify(createdRecord)) : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to register for Summit.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Queries current Member user's registration status for active edition.
 */
export async function getMemberRegistrationStatusAction(): Promise<{
  activeEdition: SummitEdition | null;
  registration: SummitRegistration | null;
}> {
  try {
    const { dbUser } = await requireMember();
    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return { activeEdition: null, registration: null };
    }

    const registration = await findRegistrationByEditionAndUser(
      activeEdition._id,
      dbUser._id!
    );

    return {
      activeEdition: JSON.parse(JSON.stringify(activeEdition)),
      registration: registration ? JSON.parse(JSON.stringify(registration)) : null,
    };
  } catch {
    return { activeEdition: null, registration: null };
  }
}
