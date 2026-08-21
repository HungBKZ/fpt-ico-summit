/**
 * src/lib/db/repositories/summit-check-ins.ts
 *
 * Repository for SummitCheckIn collection operations.
 * Supports per-day check-in with dedup, aggregation with registrations, and stats.
 */

import { type ClientSession, type Filter, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { escapeRegex } from "@/lib/utils";
import type { SummitCheckIn } from "@/lib/db/models/summit-check-in";
import type { ParticipantType } from "@/lib/db/models/summit-registration";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitCheckIn>(COLLECTIONS.SUMMIT_CHECK_INS);
}

/**
 * Creates a check-in record. Caller must handle E11000 for dedup.
 */
export async function createCheckIn(
  doc: Omit<SummitCheckIn, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(doc as SummitCheckIn, { session });
  return result.insertedId;
}

/**
 * Finds an existing check-in for a registration + day.
 */
export async function findCheckIn(
  registrationId: ObjectId,
  dayKey: string
): Promise<SummitCheckIn | null> {
  const coll = await getCollection();
  return coll.findOne({ registrationId, dayKey });
}

export interface ListCheckInRegistrationsParams {
  editionId: ObjectId;
  dayKey: string;
  participantType?: ParticipantType | "All";
  checkInStatus?: "All" | "CHECKED_IN" | "NOT_CHECKED_IN";
  q?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationWithCheckIn {
  _id: ObjectId;
  editionId: ObjectId;
  userId: ObjectId;
  participantType: ParticipantType;
  attendeeSnapshot: {
    fullName: string;
    phone: string;
    studentId?: string;
    email: string;
  };
  status: string;
  registeredAt: Date;
  checkIn?: {
    checkedInAt: Date;
    checkedInBy: ObjectId;
    method: string;
  };
}

export interface ListCheckInResult {
  registrations: RegistrationWithCheckIn[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Server-side aggregation: joins summitRegistrations with summitCheckIns
 * for a specific edition + dayKey, with filters, search, and pagination.
 */
export async function listRegistrationsWithCheckInStatus({
  editionId,
  dayKey,
  participantType,
  checkInStatus,
  q,
  page = 1,
  limit = 25,
}: ListCheckInRegistrationsParams): Promise<ListCheckInResult> {
  const db = await getDb();
  const regColl = db.collection(COLLECTIONS.SUMMIT_REGISTRATIONS);

  // Build match stage for registrations
  const matchStage: Filter<Record<string, unknown>> = {
    editionId,
    status: "REGISTERED",
  };

  if (participantType && participantType !== "All") {
    matchStage.participantType = participantType;
  }

  if (q && typeof q === "string") {
    const trimmed = q.trim();
    if (trimmed.length > 0) {
      const capped = trimmed.slice(0, 100);
      const escaped = escapeRegex(capped);
      const regex = new RegExp(escaped, "i");
      matchStage.$or = [
        { "attendeeSnapshot.fullName": regex },
        { "attendeeSnapshot.email": regex },
        { "attendeeSnapshot.phone": regex },
        { "attendeeSnapshot.studentId": regex },
      ];
    }
  }

  const currentPage = Math.max(1, Math.floor(Number(page) || 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(Number(limit) || 25)));
  const skip = (currentPage - 1) * pageSize;

  // Build aggregation pipeline
  const pipeline: Record<string, unknown>[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: COLLECTIONS.SUMMIT_CHECK_INS,
        let: { regId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$registrationId", "$$regId"] },
              dayKey,
            },
          },
          { $limit: 1 },
        ],
        as: "_checkIns",
      },
    },
    {
      $addFields: {
        checkIn: {
          $cond: {
            if: { $gt: [{ $size: "$_checkIns" }, 0] },
            then: { $arrayElemAt: ["$_checkIns", 0] },
            else: null,
          },
        },
      },
    },
    { $unset: "_checkIns" },
  ];

  // Filter by check-in status if specified
  if (checkInStatus === "CHECKED_IN") {
    pipeline.push({ $match: { checkIn: { $ne: null } } });
  } else if (checkInStatus === "NOT_CHECKED_IN") {
    pipeline.push({ $match: { checkIn: null } });
  }

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await regColl.aggregate(countPipeline).toArray();
  const total = countResult.length > 0 ? (countResult[0] as { total: number }).total : 0;

  // Apply sort + pagination
  pipeline.push({ $sort: { "attendeeSnapshot.fullName": 1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pageSize });

  const registrations = (await regColl.aggregate(pipeline).toArray()) as RegistrationWithCheckIn[];
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    registrations,
    total,
    page: currentPage,
    totalPages,
  };
}

/**
 * Counts check-in statistics for a given edition + dayKey.
 */
export async function countCheckInStats(
  editionId: ObjectId,
  dayKey: string
): Promise<{ totalRegistered: number; checkedIn: number; remaining: number }> {
  const db = await getDb();
  const regColl = db.collection(COLLECTIONS.SUMMIT_REGISTRATIONS);
  const checkColl = await getCollection();

  const [totalRegistered, checkedIn] = await Promise.all([
    regColl.countDocuments({ editionId, status: "REGISTERED" }),
    checkColl.countDocuments({ editionId, dayKey }),
  ]);

  return {
    totalRegistered,
    checkedIn,
    remaining: Math.max(0, totalRegistered - checkedIn),
  };
}
