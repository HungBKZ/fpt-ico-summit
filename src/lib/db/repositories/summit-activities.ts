/**
 * src/lib/db/repositories/summit-activities.ts
 *
 * Repository for SummitActivity collection data operations supporting Dual Approval State.
 */

import { type ClientSession, type Filter, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import type {
  SummitActivity,
  ActivityType,
  ActivityDraftStatus,
  WorkshopSnapshot,
  StagePerformanceSnapshot,
} from "@/lib/db/models/summit-activity";
import { escapeRegex } from "@/lib/utils";

import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES);
}

/**
 * Counts activities with draftStatus = "IN_REVIEW" for the active edition.
 */
export async function countPendingActivities(): Promise<number> {
  const activeEdition = await getActiveSummitEdition();
  if (!activeEdition || !activeEdition._id) return 0;
  const coll = await getCollection();
  return coll.countDocuments({
    editionId: activeEdition._id,
    draftStatus: "IN_REVIEW",
  });
}

/**
 * Creates a new DRAFT SummitActivity document.
 */
export async function createSummitActivity(
  doc: Omit<SummitActivity, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(doc, { session });
  return result.insertedId;
}

/**
 * Finds a SummitActivity by its ObjectId.
 */
export async function findActivityById(
  id: ObjectId | string
): Promise<SummitActivity | null> {
  const coll = await getCollection();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return coll.findOne({ _id: objId });
}

/**
 * Updates an activity's draftSnapshot and sets draftStatus back to DRAFT.
 * Preserves isContentApproved and approvedSnapshot intact if already approved.
 */
export async function updateActivityDraft(
  id: ObjectId,
  draftSnapshot: WorkshopSnapshot | StagePerformanceSnapshot,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        draftSnapshot,
        draftStatus: "DRAFT",
        updatedAt: new Date(),
      },
    },
    { session }
  );
}

/**
 * Submits an activity for Admin review.
 */
export async function submitActivityForReview(
  id: ObjectId,
  submittedBy: ObjectId,
  dataPermissionConfirmed: boolean,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  const now = new Date();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        draftStatus: "IN_REVIEW",
        dataPermissionConfirmed,
        dataPermissionConfirmedAt: now,
        dataPermissionConfirmedBy: submittedBy,
        "review.submittedAt": now,
        "review.submittedBy": submittedBy,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Admin requests changes on an activity proposal with feedback.
 */
export async function requestActivityChanges(
  id: ObjectId,
  feedback: string,
  reviewedBy: ObjectId,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  const now = new Date();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        draftStatus: "CHANGES_REQUESTED",
        "review.feedback": feedback,
        "review.reviewedAt": now,
        "review.reviewedBy": reviewedBy,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Admin approves activity proposal content.
 * Copies draftSnapshot -> approvedSnapshot, sets isContentApproved = true, and sets draftStatus = "NONE".
 */
export async function approveActivityContent(
  id: ObjectId,
  draftSnapshot: WorkshopSnapshot | StagePerformanceSnapshot,
  approvedBy: ObjectId,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  const now = new Date();
  await coll.updateOne(
    { _id: id },
    {
      $set: {
        isContentApproved: true,
        draftStatus: "NONE",
        approvedSnapshot: draftSnapshot,
        approvedAt: now,
        approvedBy,
        "review.reviewedAt": now,
        "review.reviewedBy": approvedBy,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Lists all activity proposals for a Partner Organization within a SummitEdition.
 */
export async function listActivitiesForPartner(
  editionId: ObjectId,
  organizationId: ObjectId
): Promise<SummitActivity[]> {
  const coll = await getCollection();
  return coll
    .find({ editionId, organizationId })
    .sort({ updatedAt: -1 })
    .toArray();
}

export interface ListActivitiesAdminParams {
  editionId: ObjectId;
  type?: ActivityType | "All";
  draftStatus?: ActivityDraftStatus | "All";
  isApprovedOnly?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ListActivitiesAdminResult {
  activities: SummitActivity[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Server-side paginated & filtered activity search for Admin inspection.
 */
export async function listActivitiesForAdmin({
  editionId,
  type,
  draftStatus,
  isApprovedOnly,
  q,
  page = 1,
  limit = 25,
}: ListActivitiesAdminParams): Promise<ListActivitiesAdminResult> {
  const coll = await getCollection();
  const filter: Filter<SummitActivity> = { editionId };

  if (type && type !== "All") {
    filter.type = type;
  }

  if (draftStatus && draftStatus !== "All") {
    filter.draftStatus = draftStatus;
  }

  if (isApprovedOnly !== undefined) {
    filter.isContentApproved = isApprovedOnly;
  }

  if (q && typeof q === "string") {
    const trimmed = q.trim();
    if (trimmed.length > 0) {
      const capped = trimmed.slice(0, 100);
      const escaped = escapeRegex(capped);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { "draftSnapshot.title.en": regex },
        { "draftSnapshot.title.vi": regex },
        { "draftSnapshot.shortDescription.en": regex },
      ];
    }
  }

  const currentPage = Math.max(1, Math.floor(Number(page) || 1));
  const requestedLimit = Math.floor(Number(limit) || 25);
  const pageSize = Math.max(1, Math.min(100, requestedLimit));
  const skip = (currentPage - 1) * pageSize;

  const [activities, total] = await Promise.all([
    coll
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    coll.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    activities,
    total,
    page: currentPage,
    totalPages,
  };
}

/**
 * Checks for venue and time overlap conflicts among approved activities in the active edition.
 * Evaluates the effective schedule: scheduleDraft if present, otherwise publishedSchedule.
 * Formula for strict overlap (allowing back-to-back):
 * newStart < existingEnd && newEnd > existingStart
 */
export async function checkScheduleConflict(
  editionId: ObjectId,
  excludeActivityId: ObjectId,
  dateKey: string,
  venue: string,
  startTime: string,
  endTime: string,
  session?: ClientSession
): Promise<{ hasConflict: boolean; conflictingActivityTitle?: string; conflictingTime?: string }> {
  const coll = await getCollection();
  const trimmedVenue = venue.trim().toLowerCase();

  // Find approved activities in the edition (excluding current activity) with any schedule
  const candidates = await coll
    .find(
      {
        editionId,
        _id: { $ne: excludeActivityId },
        isContentApproved: true,
        $or: [
          { "scheduleDraft.dateKey": dateKey },
          { "publishedSchedule.dateKey": dateKey },
        ],
      },
      { session }
    )
    .toArray();

  for (const act of candidates) {
    // Effective schedule: scheduleDraft if exists, else publishedSchedule
    const eff = act.scheduleDraft || act.publishedSchedule;
    if (!eff) continue;

    if (eff.dateKey === dateKey && eff.venue.trim().toLowerCase() === trimmedVenue) {
      // Overlap check
      if (startTime < eff.endTime && endTime > eff.startTime) {
        const title =
          act.approvedSnapshot?.title?.en ||
          act.draftSnapshot?.title?.en ||
          "Untitled Activity";
        return {
          hasConflict: true,
          conflictingActivityTitle: title,
          conflictingTime: `${eff.startTime} - ${eff.endTime}`,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Updates scheduleDraft for an approved activity.
 */
export async function updateActivityScheduleDraft(
  id: ObjectId,
  scheduleDraft: import("@/lib/db/models/summit-activity").ActivityScheduleDraft,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  await coll.updateOne(
    { _id: id, isContentApproved: true },
    {
      $set: {
        scheduleDraft,
        updatedAt: new Date(),
      },
    },
    { session }
  );
}

/**
 * Publishes activity schedule: copies scheduleDraft -> publishedSchedule.
 */
export async function publishActivitySchedule(
  id: ObjectId,
  publishedBy: ObjectId,
  session?: ClientSession
): Promise<void> {
  const coll = await getCollection();
  const act = await coll.findOne({ _id: id, isContentApproved: true }, { session });
  if (!act || !act.scheduleDraft) {
    throw new Error("No schedule draft found to publish for this activity.");
  }

  const now = new Date();
  const publishedSchedule: import("@/lib/db/models/summit-activity").ActivityPublishedSchedule = {
    ...act.scheduleDraft,
    publishedBy,
    publishedAt: now,
  };

  await coll.updateOne(
    { _id: id },
    {
      $set: {
        publishedSchedule,
        updatedAt: now,
      },
      $unset: {
        scheduleDraft: "",
      },
    },
    { session }
  );
}

/**
 * Lists content-approved activities for Staff scheduling console.
 */
export async function listApprovedActivitiesForScheduling(
  editionId: ObjectId,
  type?: ActivityType | "All",
  scheduleStatus?: "All" | "UNSCHEDULED" | "DRAFT_ONLY" | "PUBLISHED",
  q?: string
): Promise<SummitActivity[]> {
  const coll = await getCollection();
  const filter: Filter<SummitActivity> = {
    editionId,
    isContentApproved: true,
  };

  if (type && type !== "All") {
    filter.type = type;
  }

  if (scheduleStatus === "UNSCHEDULED") {
    filter.scheduleDraft = { $exists: false };
    filter.publishedSchedule = { $exists: false };
  } else if (scheduleStatus === "DRAFT_ONLY") {
    filter.scheduleDraft = { $exists: true };
  } else if (scheduleStatus === "PUBLISHED") {
    filter.publishedSchedule = { $exists: true };
  }

  if (q && typeof q === "string") {
    const trimmed = q.trim();
    if (trimmed.length > 0) {
      const escaped = escapeRegex(trimmed.slice(0, 100));
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { "approvedSnapshot.title.en": regex },
        { "approvedSnapshot.title.vi": regex },
      ];
    }
  }

  return coll.find(filter).sort({ updatedAt: -1 }).toArray();
}

/**
 * Returns published schedules for a partner organization's activities.
 */
export async function listPublishedSchedulesForPartner(
  editionId: ObjectId,
  organizationId: ObjectId
): Promise<SummitActivity[]> {
  const coll = await getCollection();
  return coll
    .find({
      editionId,
      organizationId,
      publishedSchedule: { $exists: true },
    })
    .toArray();
}

/**
 * Counts scheduling stats for Staff Overview.
 */
export async function countSchedulingStats(
  editionId: ObjectId
): Promise<{ unscheduled: number; scheduled: number; published: number }> {
  const coll = await getCollection();
  const [unscheduled, scheduled, published] = await Promise.all([
    coll.countDocuments({
      editionId,
      isContentApproved: true,
      scheduleDraft: { $exists: false },
      publishedSchedule: { $exists: false },
    }),
    coll.countDocuments({
      editionId,
      isContentApproved: true,
      scheduleDraft: { $exists: true },
    }),
    coll.countDocuments({
      editionId,
      isContentApproved: true,
      publishedSchedule: { $exists: true },
    }),
  ]);

  return { unscheduled, scheduled, published };
}

