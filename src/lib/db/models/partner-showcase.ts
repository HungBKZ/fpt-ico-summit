/**
 * src/lib/db/models/partner-showcase.ts
 *
 * Domain model for Admin-managed Partner Logo Showcase entries.
 * Represents institutions/organizations displayed on the public homepage marquee.
 *
 * Separation of Concerns:
 * PUBLIC LOGO SHOWCASE != PARTNER ACCOUNT != CONFIRMED PARTICIPATION
 */

import type { ObjectId } from "mongodb";

export type ShowcaseRelationshipStatus =
  | "INVITED"
  | "CONFIRMED"
  | "NETWORK_PARTNER";

export interface ShowcaseLogo {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
}

export interface PartnerShowcaseEntry {
  _id?: ObjectId;

  /** Display name of the institution / organization */
  displayName: string;

  /** Country (optional) */
  country?: string;

  /** Official website URL (optional) */
  websiteUrl?: string;

  /**
   * Verified Cloudinary logo metadata.
   * Optional on creation of hidden entries, but strictly required for public visibility.
   */
  logo?: ShowcaseLogo;

  /** Admin/operational relationship status (internal only) */
  relationshipStatus: ShowcaseRelationshipStatus;

  /** Controls whether this entry is rendered on the public homepage marquee */
  isVisible: boolean;

  /** Numeric sorting order (ascending) */
  displayOrder: number;

  /** Optional link to a registered Organization */
  organizationId?: ObjectId;

  /**
   * Explicit confirmation by Admin:
   * "I confirm that this logo may be displayed on the FPT ICO Summit website."
   * Required to be true before isVisible can be true.
   */
  displayConsentConfirmed: boolean;

  /** Admin User ID who created the record */
  createdBy: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sanitized Data Transfer Object for public homepage marquee consumption.
 * Strictly omits relationshipStatus, organizationId, createdBy, displayConsentConfirmed, and internal audit data.
 */
export interface PublicShowcaseEntryDto {
  id: string;
  displayName: string;
  country?: string;
  websiteUrl?: string;
  logo: {
    secureUrl: string;
    width?: number;
    height?: number;
  };
  displayOrder: number;
}
