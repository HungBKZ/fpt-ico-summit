/**
 * src/lib/db/repositories/summit-booth-assignments.ts
 *
 * Repository for SummitBoothAssignment collection operations.
 * Uses dual-snapshot draft/published isolation.
 */

import { type ClientSession, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { escapeRegex } from "@/lib/utils";
import type {
  SummitBoothAssignment,
  BoothAssignmentSnapshot,
} from "@/lib/db/models/summit-booth-assignment";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitBoothAssignment>(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS);
}

/**
 * Creates a new booth assignment record for an Organization + Edition.
 */
export async function createBoothAssignment(
  doc: Omit<SummitBoothAssignment, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(doc as SummitBoothAssignment, { session });
  return result.insertedId;
}

/**
 * Finds the booth assignment for a given edition + organization.
 */
export async function findBoothAssignment(
  editionId: ObjectId,
  organizationId: ObjectId
): Promise<SummitBoothAssignment | null> {
  const coll = await getCollection();
  return coll.findOne({ editionId, organizationId });
}

/**
 * Finds a booth assignment by its _id.
 */
export async function findBoothAssignmentById(
  id: ObjectId | string
): Promise<SummitBoothAssignment | null> {
  const coll = await getCollection();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return coll.findOne({ _id: objId });
}

/**
 * Updates the draftAssignment on a booth record.
 */
export async function updateBoothDraft(
  id: ObjectId,
  draftAssignment: BoothAssignmentSnapshot,
  assignedBy: ObjectId,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        draftAssignment,
        assignedBy,
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { session }
  );
}

/**
 * Publishes: copies draftAssignment → publishedAssignment, sets isPublished = true.
 */
export async function publishBoothAssignment(
  id: ObjectId,
  publishedBy: ObjectId,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  const record = await coll.findOne({ _id: id }, { session });
  if (!record || !record.draftAssignment) {
    throw new Error("No draft assignment to publish.");
  }

  const now = new Date();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        publishedAssignment: record.draftAssignment,
        isPublished: true,
        publishedAt: now,
        publishedBy,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Returns the published booth assignment for a Partner's read-only view.
 * Returns null if not published.
 */
export async function getPublishedBoothForPartner(
  editionId: ObjectId,
  organizationId: ObjectId
): Promise<BoothAssignmentSnapshot | null> {
  const coll = await getCollection();
  const record = await coll.findOne({
    editionId,
    organizationId,
    isPublished: true,
  });
  return record?.publishedAssignment || null;
}

export interface ListBoothsParams {
  editionId: ObjectId;
  statusFilter?: "All" | "DRAFT_ONLY" | "PUBLISHED";
  q?: string;
  page?: number;
  limit?: number;
}

export interface BoothWithOrgInfo extends SummitBoothAssignment {
  orgName?: string;
  orgCountry?: string;
  orgType?: string;
}

export interface ListBoothsResult {
  booths: BoothWithOrgInfo[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Lists booth assignments with organization info for Staff view.
 */
export async function listBoothAssignmentsForStaff({
  editionId,
  statusFilter,
  q,
  page = 1,
  limit = 25,
}: ListBoothsParams): Promise<ListBoothsResult> {
  const db = await getDb();
  const coll = db.collection(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS);

  const pipeline: Record<string, unknown>[] = [
    { $match: { editionId } },
  ];

  if (statusFilter === "PUBLISHED") {
    pipeline.push({ $match: { isPublished: true } });
  } else if (statusFilter === "DRAFT_ONLY") {
    pipeline.push({ $match: { isPublished: false } });
  }

  // Join with organizations for display
  pipeline.push({
    $lookup: {
      from: COLLECTIONS.ORGANIZATIONS,
      localField: "organizationId",
      foreignField: "_id",
      as: "_org",
    },
  });
  pipeline.push({
    $addFields: {
      orgName: { $arrayElemAt: ["$_org.name", 0] },
      orgCountry: { $arrayElemAt: ["$_org.country", 0] },
      orgType: { $arrayElemAt: ["$_org.type", 0] },
    },
  });
  pipeline.push({ $unset: "_org" });

  // Search by org name or booth label
  if (q && typeof q === "string") {
    const trimmed = q.trim();
    if (trimmed.length > 0) {
      const escaped = escapeRegex(trimmed.slice(0, 100));
      const regex = new RegExp(escaped, "i");
      pipeline.push({
        $match: {
          $or: [
            { orgName: regex },
            { "draftAssignment.boothLabel": regex },
            { "publishedAssignment.boothLabel": regex },
          ],
        },
      });
    }
  }

  const currentPage = Math.max(1, Math.floor(Number(page) || 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(Number(limit) || 25)));
  const skip = (currentPage - 1) * pageSize;

  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await db.collection(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS).aggregate(countPipeline).toArray();
  const total = countResult.length > 0 ? (countResult[0] as { total: number }).total : 0;

  pipeline.push({ $sort: { updatedAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: pageSize });

  const booths = (await coll.aggregate(pipeline).toArray()) as BoothWithOrgInfo[];
  const totalPages = Math.ceil(total / pageSize) || 1;

  return { booths, total, page: currentPage, totalPages };
}

/**
 * Counts booth assignment stats for the Staff Overview.
 */
export async function countBoothStats(
  editionId: ObjectId
): Promise<{ totalAssigned: number; published: number; draftOnly: number }> {
  const coll = await getCollection();
  const [totalAssigned, published] = await Promise.all([
    coll.countDocuments({ editionId }),
    coll.countDocuments({ editionId, isPublished: true }),
  ]);

  return {
    totalAssigned,
    published,
    draftOnly: totalAssigned - published,
  };
}
