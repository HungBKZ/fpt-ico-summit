/**
 * src/lib/db/repositories/scholarships.ts
 *
 * Repository for Scholarship domain persistence.
 * Implements draft/published snapshot isolation, idempotent index initialization,
 * and support for ClientSession transaction boundaries.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type { Scholarship, ScholarshipSnapshot, ScholarshipType } from "../models/scholarship";
import type { DraftStatus } from "../models/organization";

/**
 * Creates a new Scholarship record in DRAFT status. Supports transaction session.
 */
export async function createScholarship(
  input: {
    organizationId: ObjectId;
    createdBy: ObjectId;
    draftSnapshot: ScholarshipSnapshot;
  },
  session?: ClientSession
): Promise<Scholarship> {
  const db = await getDb();

  const now = new Date();
  const doc: Scholarship = {
    organizationId: input.organizationId,
    createdBy: input.createdBy,
    isPublished: false,
    draftStatus: "DRAFT",
    draftSnapshot: input.draftSnapshot,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .insertOne(doc, { session });

  return { ...doc, _id: result.insertedId };
}

/**
 * Updates draftSnapshot for an existing Scholarship. Supports transaction session.
 */
export async function updateScholarshipDraft(
  id: ObjectId,
  draftSnapshot: ScholarshipSnapshot,
  session?: ClientSession
): Promise<boolean> {
  const db = await getDb();
  const res = await db.collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS).updateOne(
    { _id: id },
    {
      $set: {
        draftSnapshot,
        updatedAt: new Date(),
      },
    },
    { session }
  );
  return res.matchedCount > 0;
}

/**
 * Submits a Scholarship draft for Admin review (transitions draftStatus -> IN_REVIEW).
 */
export async function submitScholarshipForReview(
  id: ObjectId,
  submittedBy: ObjectId,
  session?: ClientSession
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  const res = await db.collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS).updateOne(
    { _id: id },
    {
      $set: {
        draftStatus: "IN_REVIEW",
        "review.submittedAt": now,
        "review.submittedBy": submittedBy,
        updatedAt: now,
      },
    },
    { session }
  );
  return res.matchedCount > 0;
}

/**
 * Requests changes on a Scholarship draft with Admin feedback.
 */
export async function requestScholarshipChanges(
  id: ObjectId,
  reviewedBy: ObjectId,
  feedback: string,
  session?: ClientSession
): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  const res = await db.collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS).updateOne(
    { _id: id },
    {
      $set: {
        draftStatus: "CHANGES_REQUESTED",
        "review.reviewedAt": now,
        "review.reviewedBy": reviewedBy,
        "review.feedback": feedback,
        updatedAt: now,
      },
    },
    { session }
  );
  return res.matchedCount > 0;
}

/**
 * Approves & publishes a Scholarship draft inside a transaction session.
 * Copies draftSnapshot -> publishedSnapshot, sets isPublished = true, draftStatus = NONE.
 */
export async function approveAndPublishScholarship(
  id: ObjectId,
  publishedBy: ObjectId,
  session?: ClientSession
): Promise<Scholarship | null> {
  const db = await getDb();
  const now = new Date();

  const current = await db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .findOne({ _id: id }, { session });

  if (!current || !current.draftSnapshot) {
    return null;
  }

  const updatedDoc: Partial<Scholarship> = {
    publishedSnapshot: current.draftSnapshot,
    isPublished: true,
    draftStatus: "NONE",
    publishedAt: now,
    publishedBy: publishedBy,
    updatedAt: now,
  };

  await db.collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS).updateOne(
    { _id: id },
    { $set: updatedDoc },
    { session }
  );

  return { ...current, ...updatedDoc };
}

/**
 * Fetches a Scholarship by ObjectId.
 */
export async function getScholarshipById(
  id: ObjectId
): Promise<Scholarship | null> {
  const db = await getDb();
  return db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .findOne({ _id: id });
}

/**
 * Lists all Scholarships belonging to a specific Organization.
 */
export async function listScholarshipsByOrg(
  organizationId: ObjectId
): Promise<Scholarship[]> {
  const db = await getDb();
  return db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .find({ organizationId })
    .sort({ updatedAt: -1 })
    .toArray();
}

/**
 * Lists Scholarships for Admin console with optional draftStatus filter.
 */
export async function listScholarshipsForAdmin(
  filterTab: DraftStatus | "PUBLISHED" | "ALL" = "ALL"
): Promise<Scholarship[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (filterTab === "PUBLISHED") {
    query.isPublished = true;
  } else if (filterTab !== "ALL") {
    query.draftStatus = filterTab;
  }

  return db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .find(query)
    .sort({ updatedAt: -1 })
    .toArray();
}

/**
 * Counts total pending scholarship submissions awaiting Admin review.
 */
export async function countPendingScholarships(): Promise<number> {
  const db = await getDb();
  return db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .countDocuments({ draftStatus: "IN_REVIEW" });
}

/**
 * Public query: Lists published scholarships whose provider organization has CONFIRMED
 * active summit participation for the current active SummitEdition.
 */
export async function listPublishedScholarshipsForPublic(options?: {
  type?: ScholarshipType;
  providerType?: string;
  country?: string;
}): Promise<Scholarship[]> {
  const db = await getDb();

  // Find active edition
  const activeEdition = await db
    .collection(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ status: "ACTIVE" });

  if (!activeEdition || !activeEdition._id) {
    return [];
  }

  // Find confirmed participations
  const confirmedParticipations = await db
    .collection(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
    .find({ editionId: activeEdition._id, status: "CONFIRMED" })
    .toArray();

  if (confirmedParticipations.length === 0) {
    return [];
  }

  const confirmedOrgIds = confirmedParticipations.map((p) => p.organizationId);

  const query: Record<string, unknown> = {
    organizationId: { $in: confirmedOrgIds },
    isPublished: true,
    publishedSnapshot: { $exists: true },
  };

  if (options?.type) {
    query["publishedSnapshot.type"] = options.type;
  }

  const rawScholarships = await db
    .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
    .find(query)
    .sort({ "publishedSnapshot.applicationDeadline": 1, updatedAt: -1 })
    .toArray();

  return rawScholarships;
}
