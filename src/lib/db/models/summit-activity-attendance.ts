/**
 * src/lib/db/models/summit-activity-attendance.ts
 *
 * Domain model for SummitActivityAttendance collection.
 * Tracks physical attendance for scheduled optional Summit activities (Workshops & Stage Performances).
 */

import type { ObjectId } from "mongodb";

export type AttendanceSource = "SELECTED" | "WALK_IN";
export type AttendanceStatus = "PRESENT";

export interface SummitActivityAttendance {
  _id?: ObjectId;

  /** Reference to active SummitEdition */
  editionId: ObjectId;

  /** Reference to target SummitActivity */
  activityId: ObjectId;

  /** Reference to attendee's SummitRegistration */
  registrationId: ObjectId;

  /** Date key of the activity schedule at the time attendance was recorded */
  activityDayKey: string;

  /** Attendance origination category */
  source: AttendanceSource;

  /** Lifecycle attendance status (PRESENT) */
  status: AttendanceStatus;

  /** Exact server-side timestamp when attendance was recorded */
  attendedAt: Date;

  /** Reference to Staff or Admin User who marked attendance */
  markedBy: ObjectId;

  /** Creation timestamp */
  createdAt: Date;
}
