/**
 * src/lib/db/repositories/summit-activity-selections.ts
 *
 * Repository for SummitActivitySelection collection operations.
 * Supports selection creation/deletion, Member conflict checking, and aggregate counts.
 */

import { type ClientSession, ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import type { SummitActivitySelection } from "@/lib/db/models/summit-activity-selection";
import type { SummitActivity } from "@/lib/db/models/summit-activity";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS);
}

/**
 * Creates a selection record. Caller handles E11000 for dedup.
 */
export async function createSelection(
  doc: Omit<SummitActivitySelection, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(doc as SummitActivitySelection, { session });
  return result.insertedId;
}

/**
 * Deletes a selection record by registrationId + activityId.
 * Returns true if a document was deleted.
 */
export async function deleteSelection(
  registrationId: ObjectId,
  activityId: ObjectId,
  session?: ClientSession
): Promise<boolean> {
  const coll = await getCollection();
  const result = await coll.deleteOne({ registrationId, activityId }, { session });
  return (result.deletedCount || 0) > 0;
}

/**
 * Finds a single selection record.
 */
export async function findSelection(
  registrationId: ObjectId,
  activityId: ObjectId
): Promise<SummitActivitySelection | null> {
  const coll = await getCollection();
  return coll.findOne({ registrationId, activityId });
}

/**
 * Lists all active selection records for a given Member registration.
 */
export async function listSelectionsForRegistration(
  registrationId: ObjectId
): Promise<SummitActivitySelection[]> {
  const coll = await getCollection();
  return coll.find({ registrationId }).sort({ selectedAt: -1 }).toArray();
}

/**
 * Lists all eligible activities for Member browsing:
 * isContentApproved === true AND approvedSnapshot exists AND publishedSchedule exists.
 */
export async function listEligibleActivitiesForMember(
  editionId: ObjectId
): Promise<SummitActivity[]> {
  const db = await getDb();
  const coll = db.collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES);
  return coll
    .find({
      editionId,
      isContentApproved: true,
      approvedSnapshot: { $exists: true },
      publishedSchedule: { $exists: true },
    })
    .sort({ "publishedSchedule.dateKey": 1, "publishedSchedule.startTime": 1 })
    .toArray();
}

/**
 * Resolves activities by IDs directly without requiring publishedSchedule or isContentApproved.
 * Used to load historical Member selections even if an activity loses its published schedule.
 */
export async function listActivitiesByIds(
  activityIds: ObjectId[]
): Promise<SummitActivity[]> {
  if (activityIds.length === 0) return [];
  const db = await getDb();
  const coll = db.collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES);
  return coll.find({ _id: { $in: activityIds } }).toArray();
}

/**
 * Checks if selecting proposedActivity creates a schedule overlap with Member's existing selections.
 * Formula for strict overlap (allowing back-to-back):
 * newStart < existingEnd && newEnd > existingStart
 */
export async function checkMemberScheduleConflict(
  registrationId: ObjectId,
  proposedActivityId: ObjectId,
  proposedDateKey: string,
  proposedStartTime: string,
  proposedEndTime: string,
  session?: ClientSession
): Promise<{ hasConflict: boolean; conflictingActivityTitle?: string; conflictingTime?: string }> {
  const db = await getDb();
  const selectionsColl = await getCollection();
  const activitiesColl = db.collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES);

  // Find all selections for this member
  const memberSelections = await selectionsColl.find({ registrationId }, { session }).toArray();
  if (memberSelections.length === 0) return { hasConflict: false };

  const selectedActivityIds = memberSelections
    .map((s) => s.activityId)
    .filter((id) => !id.equals(proposedActivityId));

  if (selectedActivityIds.length === 0) return { hasConflict: false };

  // Fetch activities for these selections that have a publishedSchedule on the same dateKey
  const selectedActivities = await activitiesColl
    .find(
      {
        _id: { $in: selectedActivityIds },
        "publishedSchedule.dateKey": proposedDateKey,
      },
      { session }
    )
    .toArray();

  for (const act of selectedActivities) {
    const sched = act.publishedSchedule;
    if (!sched) continue;

    // Overlap formula
    if (proposedStartTime < sched.endTime && proposedEndTime > sched.startTime) {
      const title =
        act.approvedSnapshot?.title?.en ||
        act.draftSnapshot?.title?.en ||
        "Untitled Activity";
      return {
        hasConflict: true,
        conflictingActivityTitle: title,
        conflictingTime: `${sched.startTime} - ${sched.endTime}`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Counts aggregate selection count for a single activity (Staff/Partner view).
 */
export async function countSelectionsByActivity(activityId: ObjectId): Promise<number> {
  const coll = await getCollection();
  return coll.countDocuments({ activityId });
}

/**
 * Counts aggregate selections grouped by activity for an entire edition.
 * Returns map of `{ [activityIdStr]: number }`.
 */
export async function countSelectionsForEditionGrouped(
  editionId: ObjectId
): Promise<Record<string, number>> {
  const coll = await getCollection();
  const results = await coll
    .aggregate([
      { $match: { editionId } },
      { $group: { _id: "$activityId", count: { $sum: 1 } } },
    ])
    .toArray();

  const map: Record<string, number> = {};
  for (const row of results) {
    if (row._id) {
      map[row._id.toString()] = row.count;
    }
  }
  return map;
}
