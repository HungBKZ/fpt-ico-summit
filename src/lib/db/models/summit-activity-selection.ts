/**
 * src/lib/db/models/summit-activity-selection.ts
 *
 * Domain model for Member optional activity selections.
 */

import type { ObjectId } from "mongodb";

export interface SummitActivitySelection {
  _id?: ObjectId;

  /** Reference to active SummitEdition */
  editionId: ObjectId;

  /** Reference to Member's SummitRegistration */
  registrationId: ObjectId;

  /** Reference to selected SummitActivity */
  activityId: ObjectId;

  /** Selection timestamp */
  selectedAt: Date;

  /** Creation timestamp */
  createdAt: Date;
}
