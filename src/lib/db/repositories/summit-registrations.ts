/**
 * src/lib/db/repositories/summit-registrations.ts
 *
 * Repository for SummitRegistration collection data operations.
 */

import { type ClientSession, type Filter, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { escapeRegex } from "@/lib/utils";
import type {
  SummitRegistration,
  ParticipantType,
} from "@/lib/db/models/summit-registration";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS);
}

/**
 * Finds an active registration record for a given SummitEdition and Member User.
 */
export async function findRegistrationByEditionAndUser(
  editionId: ObjectId,
  userId: ObjectId,
  session?: ClientSession
): Promise<SummitRegistration | null> {
  const coll = await getCollection();
  return coll.findOne(
    { editionId, userId, status: "REGISTERED" },
    { session }
  );
}

/**
 * Inserts a new SummitRegistration record.
 */
export async function createSummitRegistration(
  registration: Omit<SummitRegistration, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(registration as SummitRegistration, { session });
  return result.insertedId;
}

export interface ListRegistrationsParams {
  editionId: ObjectId;
  q?: string;
  participantType?: ParticipantType | "All";
  page?: number;
  limit?: number;
}

export interface ListRegistrationsResult {
  registrations: SummitRegistration[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Server-side paginated & filtered registration search for Admin inspection.
 */
export async function listRegistrationsForAdmin({
  editionId,
  q,
  participantType,
  page = 1,
  limit = 25,
}: ListRegistrationsParams): Promise<ListRegistrationsResult> {
  const coll = await getCollection();
  const filter: Filter<SummitRegistration> = {
    editionId,
    status: "REGISTERED",
  };

  if (participantType && participantType !== "All") {
    filter.participantType = participantType;
  }

  // 1. Search input safety: trim whitespace, cap length at 100 chars, escape metacharacters
  if (q && typeof q === "string") {
    const trimmed = q.trim();
    if (trimmed.length > 0) {
      const capped = trimmed.slice(0, 100);
      const escaped = escapeRegex(capped);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { "attendeeSnapshot.fullName": regex },
        { "attendeeSnapshot.email": regex },
        { "attendeeSnapshot.phone": regex },
        { "attendeeSnapshot.studentId": regex },
      ];
    }
  }

  // 2. Pagination bounds: page minimum 1, limit minimum 1 and hard maximum 100
  const currentPage = Math.max(1, Math.floor(Number(page) || 1));
  const requestedLimit = Math.floor(Number(limit) || 25);
  const pageSize = Math.max(1, Math.min(100, requestedLimit));
  const skip = (currentPage - 1) * pageSize;

  const [registrations, total] = await Promise.all([
    coll
      .find(filter)
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    coll.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    registrations,
    total,
    page: currentPage,
    totalPages,
  };
}

/**
 * Counts total registrations and breakdown by participant type for the active Summit edition.
 */
export async function countRegistrationsByEdition(
  editionId: ObjectId
): Promise<{ total: number; fptStudents: number; externalParticipants: number }> {
  const coll = await getCollection();

  const [total, fptStudents, externalParticipants] = await Promise.all([
    coll.countDocuments({ editionId, status: "REGISTERED" }),
    coll.countDocuments({ editionId, status: "REGISTERED", participantType: "FPT_STUDENT" }),
    coll.countDocuments({ editionId, status: "REGISTERED", participantType: "EXTERNAL_PARTICIPANT" }),
  ]);

  return { total, fptStudents, externalParticipants };
}
