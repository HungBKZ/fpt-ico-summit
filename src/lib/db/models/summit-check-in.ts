/**
 * src/lib/db/models/summit-check-in.ts
 *
 * Domain model for per-day Summit participant check-in records.
 * Phase 5C uses method = "MANUAL" only. "QR" is future-ready.
 */

import type { ObjectId } from "mongodb";

export type CheckInMethod = "MANUAL" | "QR";

export interface SummitCheckIn {
  _id?: ObjectId;

  /** Reference to active SummitEdition */
  editionId: ObjectId;

  /** Reference to the SummitRegistration being checked in */
  registrationId: ObjectId;

  /** Calendar day key in YYYY-MM-DD format, e.g. "2026-11-21" */
  dayKey: string;

  /** Timestamp when check-in occurred */
  checkedInAt: Date;

  /** Staff user ID who performed the check-in */
  checkedInBy: ObjectId;

  /** Method used for check-in */
  method: CheckInMethod;

  /** Creation timestamp */
  createdAt: Date;
}
