/**
 * src/lib/db/models/organization-participation.ts
 *
 * Domain model for multi-year Organization participation in SummitEditions.
 */

import type { ObjectId } from "mongodb";

export type ParticipationStatus = "INVITED" | "CONFIRMED" | "WITHDRAWN";

export interface OrganizationParticipation {
  _id?: ObjectId;

  /** Reference to Organization document */
  organizationId: ObjectId;

  /** Reference to SummitEdition document */
  editionId: ObjectId;

  /** Status of participation in this specific summit edition */
  status: ParticipationStatus;

  createdAt: Date;
  updatedAt: Date;
}
