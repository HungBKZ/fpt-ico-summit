/**
 * src/lib/db/models/summit-edition.ts
 *
 * Domain model for annual Summit Editions (e.g. FPT ICO Summit 2026).
 * Represents the top-level annual container to which future participations,
 * workshops, scholarships, and registrations will be attached via `editionId`.
 *
 * Note on Dates: `startDate` and `endDate` are stored as native BSON Date values (UTC).
 * Presentation formatting must use the `timezone` field (e.g., "Asia/Ho_Chi_Minh").
 */

import type { ObjectId } from "mongodb";

export type SummitEditionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface SummitEdition {
  _id?: ObjectId;

  /** Four-digit year identifier (e.g., 2026) */
  year: number;

  /** URL-friendly slug (e.g., "2026") */
  slug: string;

  /** Full official edition name (e.g., "FPT ICO Summit 2026") */
  name: string;

  /** Start date of the summit (BSON Date value in UTC) */
  startDate: Date;

  /** End date of the summit (BSON Date value in UTC) */
  endDate: Date;

  /** IANA Timezone identifier (e.g., "Asia/Ho_Chi_Minh") */
  timezone: string;

  /** Lifecycle status */
  status: SummitEditionStatus;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

export interface CreateSummitEditionInput {
  year: number;
  slug: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  timezone?: string;
  status?: SummitEditionStatus;
}

export interface UpdateSummitEditionInput {
  year?: number;
  slug?: string;
  name?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  timezone?: string;
  status?: SummitEditionStatus;
}
