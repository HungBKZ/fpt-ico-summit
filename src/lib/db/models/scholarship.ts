/**
 * src/lib/db/models/scholarship.ts
 *
 * Domain model for Phase 4B — Scholarship Hub.
 */

import type { ObjectId } from "mongodb";
import type { DraftStatus, OrganizationMediaAsset } from "./organization";

export type ScholarshipType = "SHORT_TERM" | "LONG_TERM";

export type LocalizedTextContent = {
  en: string;
  vi: string;
};

export type ScholarshipSnapshot = {
  type: ScholarshipType;
  title: LocalizedTextContent;
  shortDescription: LocalizedTextContent;
  fullDescription?: LocalizedTextContent;
  officialUrl: string;

  applicationDeadline?: Date;
  startDate?: Date;
  endDate?: Date;

  fundingSummary?: LocalizedTextContent;
  eligibility?: LocalizedTextContent;

  banner?: OrganizationMediaAsset;
};

export interface Scholarship {
  _id?: ObjectId;

  /** Authoritative link to owner Organization */
  organizationId: ObjectId;

  /** Partner User ID who created the scholarship record */
  createdBy: ObjectId;

  /** Flag indicating if approved published snapshot exists */
  isPublished: boolean;

  /** Current draft review state */
  draftStatus: DraftStatus;

  /** Editable working draft snapshot */
  draftSnapshot?: ScholarshipSnapshot;

  /** Approved published snapshot rendered on public site */
  publishedSnapshot?: ScholarshipSnapshot;

  /** Review tracking metadata */
  review?: {
    submittedAt?: Date;
    submittedBy?: ObjectId;
    feedback?: string;
    reviewedAt?: Date;
    reviewedBy?: ObjectId;
  };

  /** Timestamp when scholarship was last published */
  publishedAt?: Date;

  /** Admin ID who published the scholarship */
  publishedBy?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
