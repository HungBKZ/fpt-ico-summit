/**
 * src/lib/db/models/organization.ts
 *
 * Organization domain model for Phase 4A.
 */

import type { ObjectId } from "mongodb";

export type OrganizationType =
  | "UNIVERSITY"
  | "CONSULATE"
  | "TRAVEL"
  | "COMPANY"
  | "EDUCATION_ORGANIZATION"
  | "OTHER";

export type OrganizationStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type DraftStatus = "NONE" | "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED";

export type LocalizedOrganizationContent = {
  en: {
    shortDescription: string;
    description?: string;
  };
  vi: {
    shortDescription: string;
    description?: string;
  };
};

export type OrganizationMediaAsset = {
  publicId: string;
  secureUrl: string;
  assetId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export type VirtualBoothProgram = {
  title: string;
  shortDescription?: string;
  url?: string;
};

export type VirtualBoothResource = {
  label: string;
  url: string;
};

export type VirtualBoothPrimaryCta = {
  label: string;
  url: string;
};

export type VirtualBoothConfig = {
  enabled: boolean;
  shortIntroduction?: string;
  description?: string;
  programs?: VirtualBoothProgram[];
  resources?: VirtualBoothResource[];
  primaryCta?: VirtualBoothPrimaryCta;
};

export type OrganizationProfileSnapshot = {
  logo?: OrganizationMediaAsset;
  coverImage?: OrganizationMediaAsset;
  logoUrl?: string;
  websiteUrl?: string;

  publicContact?: {
    email?: string;
    phone?: string;
    address?: string;
  };

  content: LocalizedOrganizationContent;
  virtualBooth?: VirtualBoothConfig;
};

export interface Organization {
  _id?: ObjectId;

  /** Organization category */
  type: OrganizationType;

  /** Display name of the institution / consulate */
  name: string;

  /** Normalized name for duplicate checking */
  nameNormalized: string;

  /** Country of location or jurisdiction */
  country: string;

  /** Normalized country */
  countryNormalized: string;

  /** Status of organization record */
  status: OrganizationStatus;

  /** Flag indicating if approved published profile exists */
  isPublished: boolean;

  /** Current draft review state */
  draftStatus: DraftStatus;

  /** Editable working draft profile */
  draftProfile?: OrganizationProfileSnapshot;

  /** Approved published profile snapshot rendered on public site */
  publishedProfile?: OrganizationProfileSnapshot;

  /** Review tracking metadata */
  review?: {
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: ObjectId;
    feedback?: string;
  };

  /** Timestamp when profile was last published */
  publishedAt?: Date;

  /** Admin ID who published the profile */
  publishedBy?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
