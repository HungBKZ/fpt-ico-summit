/**
 * src/lib/db/repositories/summit-activity-attendances.ts
 *
 * Repository for SummitActivityAttendance collection operations.
 * Supports marking/undoing attendance, walk-in candidate search,
 * general Summit check-in correlation, and strict aggregate metrics.
 */

import { type ClientSession, ObjectId, Filter } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import type { SummitActivityAttendance } from "@/lib/db/models/summit-activity-attendance";
import type { SummitRegistration } from "@/lib/db/models/summit-registration";
import type { SummitActivitySelection } from "@/lib/db/models/summit-activity-selection";
import type { SummitCheckIn } from "@/lib/db/models/summit-check-in";
import { escapeRegex } from "@/lib/utils";

async function getCollection() {
  const db = await getDb();
  return db.collection<SummitActivityAttendance>(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES);
}

/**
 * Creates an attendance record. Caller handles E11000 for dedup.
 */
export async function createAttendance(
  doc: Omit<SummitActivityAttendance, "_id">,
  session?: ClientSession
): Promise<ObjectId> {
  const coll = await getCollection();
  const result = await coll.insertOne(doc as SummitActivityAttendance, { session });
  return result.insertedId;
}

/**
 * Deletes an attendance record by registrationId + activityId.
 */
export async function deleteAttendance(
  registrationId: ObjectId,
  activityId: ObjectId,
  session?: ClientSession
): Promise<boolean> {
  const coll = await getCollection();
  const result = await coll.deleteOne({ registrationId, activityId }, { session });
  return (result.deletedCount || 0) > 0;
}

/**
 * Finds a single attendance record by registrationId + activityId.
 */
export async function findAttendance(
  registrationId: ObjectId,
  activityId: ObjectId
): Promise<SummitActivityAttendance | null> {
  const coll = await getCollection();
  return coll.findOne({ registrationId, activityId });
}

export interface ActivityAttendanceMetrics {
  selected: number;
  selectedPresent: number;
  selectedNotMarked: number;
  walkIns: number;
  totalPresent: number;
  attendanceRatePercent: number;
}

/**
 * Calculates strict attendance metrics for an activity based on CURRENT DB relationships:
 * Selected = current selections count
 * Selected Present = count of registrations having BOTH current selection AND attendance
 * Selected Not Marked = Selected - Selected Present
 * Total Present = total count of attendance records (regardless of source)
 * Recorded as Walk-in = count of attendance records where historical source === "WALK_IN"
 * Attendance Rate % = (Selected Present / Selected) * 100
 */
export async function countAttendanceMetricsByActivity(
  activityId: ObjectId
): Promise<ActivityAttendanceMetrics> {
  const db = await getDb();
  const selectionsColl = db.collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS);
  const attendanceColl = await getCollection();

  const [selections, attendances] = await Promise.all([
    selectionsColl.find({ activityId }, { projection: { registrationId: 1 } }).toArray(),
    attendanceColl.find({ activityId }, { projection: { registrationId: 1, source: 1 } }).toArray(),
  ]);

  const selectedRegIds = new Set(selections.map((s) => s.registrationId.toString()));
  const attendedRegIds = new Set(attendances.map((a) => a.registrationId.toString()));

  const selected = selectedRegIds.size;
  const totalPresent = attendances.length;

  let selectedPresent = 0;
  for (const rId of Array.from(selectedRegIds)) {
    if (attendedRegIds.has(rId)) {
      selectedPresent++;
    }
  }

  let walkIns = 0;
  for (const a of attendances) {
    if (a.source === "WALK_IN") {
      walkIns++;
    }
  }

  const selectedNotMarked = Math.max(0, selected - selectedPresent);
  const attendanceRatePercent = selected > 0 ? Math.round((selectedPresent / selected) * 1000) / 10 : 0;

  return {
    selected,
    selectedPresent,
    selectedNotMarked,
    walkIns,
    totalPresent,
    attendanceRatePercent,
  };
}

export interface AttendanceParticipantRow {
  registrationId: string;
  fullName: string;
  phone: string;
  studentId?: string;
  email: string;
  participantType: "FPT_STUDENT" | "EXTERNAL_PARTICIPANT";
  selectionStatus: "SELECTED" | "WALK_IN";
  hasGeneralCheckIn: boolean;
  attendanceStatus: "PRESENT" | "NOT_MARKED";
  attendedAt?: Date;
  attendanceSource?: "SELECTED" | "WALK_IN";
}

/**
 * Lists combined participant list for Activity Attendance console.
 * Includes all selected registrations + all walk-in attendances for this activity.
 * Correlates general SummitCheckIn status based on activityDayKey.
 */
export async function listActivityAttendanceDetails(
  activityId: ObjectId,
  editionId: ObjectId,
  activityDayKey?: string
): Promise<{ rows: AttendanceParticipantRow[]; metrics: ActivityAttendanceMetrics }> {
  const db = await getDb();
  const selectionsColl = db.collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS);
  const attendanceColl = await getCollection();
  const registrationsColl = db.collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS);
  const checkInsColl = db.collection<SummitCheckIn>(COLLECTIONS.SUMMIT_CHECK_INS);

  // 1. Fetch selections and attendances for activity
  const [selections, attendances] = await Promise.all([
    selectionsColl.find({ activityId }).toArray(),
    attendanceColl.find({ activityId }).toArray(),
  ]);

  // Build maps
  const attendanceMap = new Map<string, SummitActivityAttendance>();
  for (const att of attendances) {
    attendanceMap.set(att.registrationId.toString(), att);
  }

  const selectionSet = new Set<string>();
  const allRegIdsSet = new Set<string>();

  for (const sel of selections) {
    const rId = sel.registrationId.toString();
    selectionSet.add(rId);
    allRegIdsSet.add(rId);
  }
  for (const att of attendances) {
    allRegIdsSet.add(att.registrationId.toString());
  }

  if (allRegIdsSet.size === 0) {
    const metrics = await countAttendanceMetricsByActivity(activityId);
    return { rows: [], metrics };
  }

  const regObjectIds = Array.from(allRegIdsSet).map((id) => new ObjectId(id));

  // 2. Fetch registrations
  const registrations = await registrationsColl
    .find({ _id: { $in: regObjectIds }, editionId, status: "REGISTERED" })
    .toArray();

  const regMap = new Map<string, SummitRegistration>();
  for (const reg of registrations) {
    if (reg._id) regMap.set(reg._id.toString(), reg);
  }

  // 3. Fetch general Summit check-ins for dateKey correlation
  const checkInMap = new Map<string, boolean>();
  if (activityDayKey) {
    const checkIns = await checkInsColl
      .find({ editionId, dayKey: activityDayKey, registrationId: { $in: regObjectIds } })
      .toArray();

    for (const ci of checkIns) {
      checkInMap.set(ci.registrationId.toString(), true);
    }
  }

  // 4. Build unified participant rows
  const rows: AttendanceParticipantRow[] = [];

  for (const rIdStr of Array.from(allRegIdsSet)) {
    const reg = regMap.get(rIdStr);
    if (!reg) continue;

    const att = attendanceMap.get(rIdStr);
    const isSel = selectionSet.has(rIdStr);
    const effectiveDayKey = att?.activityDayKey || activityDayKey;
    const hasGeneralCI = effectiveDayKey ? Boolean(checkInMap.get(rIdStr)) : false;

    rows.push({
      registrationId: rIdStr,
      fullName: reg.attendeeSnapshot.fullName,
      phone: reg.attendeeSnapshot.phone,
      studentId: reg.attendeeSnapshot.studentId,
      email: reg.attendeeSnapshot.email,
      participantType: reg.participantType,
      selectionStatus: isSel ? "SELECTED" : "WALK_IN",
      hasGeneralCheckIn: hasGeneralCI,
      attendanceStatus: att ? "PRESENT" : "NOT_MARKED",
      attendedAt: att?.attendedAt,
      attendanceSource: att?.source,
    });
  }

  // Sort rows: NOT_MARKED first, then by fullName
  rows.sort((a, b) => {
    if (a.attendanceStatus !== b.attendanceStatus) {
      return a.attendanceStatus === "NOT_MARKED" ? -1 : 1;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  const metrics = await countAttendanceMetricsByActivity(activityId);
  return { rows, metrics };
}

export interface WalkInCandidateRow {
  registrationId: string;
  fullName: string;
  phone: string;
  studentId?: string;
  email: string;
  participantType: "FPT_STUDENT" | "EXTERNAL_PARTICIPANT";
}

/**
 * Searches TRUE walk-in candidates for an activity:
 * Must belong to active SummitEdition and have status === "REGISTERED".
 * MUST NOT already have an attendance record for this activity.
 * MUST NOT already have a SummitActivitySelection for this activity.
 */
export async function searchWalkInCandidates({
  editionId,
  activityId,
  query,
  limit = 20,
}: {
  editionId: ObjectId;
  activityId: ObjectId;
  query: string;
  limit?: number;
}): Promise<WalkInCandidateRow[]> {
  const db = await getDb();
  const selectionsColl = db.collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS);
  const attendanceColl = await getCollection();
  const registrationsColl = db.collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS);

  // 1. Get all registrationIds that already have selection OR attendance for this activity
  const [existingSelections, existingAttendances] = await Promise.all([
    selectionsColl.find({ activityId }, { projection: { registrationId: 1 } }).toArray(),
    attendanceColl.find({ activityId }, { projection: { registrationId: 1 } }).toArray(),
  ]);

  const excludedRegIds = new Set<string>();
  for (const s of existingSelections) excludedRegIds.add(s.registrationId.toString());
  for (const a of existingAttendances) excludedRegIds.add(a.registrationId.toString());

  const trimmed = query.trim();
  let filter: Filter<SummitRegistration>;

  if (trimmed.length === 0) {
    filter = {
      editionId,
      status: "REGISTERED",
    };
  } else if (trimmed.length >= 2) {
    const escaped = escapeRegex(trimmed.slice(0, 100));
    const regex = new RegExp(escaped, "i");
    filter = {
      editionId,
      status: "REGISTERED",
      $or: [
        { "attendeeSnapshot.fullName": regex },
        { "attendeeSnapshot.studentId": regex },
        { "attendeeSnapshot.phone": regex },
        { "attendeeSnapshot.email": regex },
      ],
    };
  } else {
    return [];
  }

  const candidateRegistrations = await registrationsColl
    .find(filter)
    .limit(limit * 2)
    .toArray();

  const results: WalkInCandidateRow[] = [];

  for (const reg of candidateRegistrations) {
    if (!reg._id) continue;
    const rIdStr = reg._id.toString();

    // Exclude if already selected or attended
    if (excludedRegIds.has(rIdStr)) continue;

    results.push({
      registrationId: rIdStr,
      fullName: reg.attendeeSnapshot.fullName,
      phone: reg.attendeeSnapshot.phone,
      studentId: reg.attendeeSnapshot.studentId,
      email: reg.attendeeSnapshot.email,
      participantType: reg.participantType,
    });

    if (results.length >= limit) break;
  }

  return results;
}
