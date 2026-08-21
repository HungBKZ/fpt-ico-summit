/**
 * src/lib/db/models/summit-booth-assignment.ts
 *
 * Domain model for Staff-assigned booth assignments using dual-snapshot
 * draft/published isolation. Partner reads publishedAssignment ONLY.
 */

import type { ObjectId } from "mongodb";

export interface BoothAssignmentSnapshot {
  boothLabel?: string;
  locationText?: string;
  note?: string;
  boothPhoto?: {
    publicId: string;
    secureUrl: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  };
}

export interface SummitBoothAssignment {
  _id?: ObjectId;

  /** Reference to active SummitEdition */
  editionId: ObjectId;

  /** Reference to Partner Organization */
  organizationId: ObjectId;

  /** Working draft edited by Staff */
  draftAssignment?: BoothAssignmentSnapshot;

  /** Published assignment visible to Partner */
  publishedAssignment?: BoothAssignmentSnapshot;

  /** Whether a published version exists */
  isPublished: boolean;

  /** Staff who created/last assigned */
  assignedBy?: ObjectId;
  assignedAt?: Date;

  /** Publication metadata */
  publishedAt?: Date;
  publishedBy?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
