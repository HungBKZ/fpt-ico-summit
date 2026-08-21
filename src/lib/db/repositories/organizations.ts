/**
 * src/lib/db/repositories/organizations.ts
 *
 * Repository functions for managing Organization documents in MongoDB for Phase 4A. Supports optional ClientSession.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type {
  Organization,
  OrganizationType,
  DraftStatus,
  OrganizationProfileSnapshot,
} from "../models/organization";
import type { SummitEdition } from "../models/summit-edition";
import type { OrganizationParticipation } from "../models/organization-participation";

export interface CreateMinimalOrganizationInput {
  type: OrganizationType;
  name: string;
  country: string;
}

/**
 * Finds an existing organization by normalized identity (type, name, country) or creates a new record.
 */
export async function findOrCreateMinimalOrganization(
  input: CreateMinimalOrganizationInput,
  session?: ClientSession
): Promise<Organization> {
  const db = await getDb();

  const nameNormalized = input.name.trim().toLowerCase();
  const countryNormalized = input.country.trim().toLowerCase();

  const existing = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ type: input.type, nameNormalized, countryNormalized }, { session });

  if (existing) {
    return existing;
  }

  const now = new Date();
  const doc: Organization = {
    type: input.type,
    name: input.name.trim(),
    nameNormalized,
    country: input.country.trim(),
    countryNormalized,
    status: "DRAFT",
    isPublished: false,
    draftStatus: "DRAFT",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .insertOne(doc, { session });

  return { ...doc, _id: result.insertedId };
}

/**
 * Retrieves an organization by ObjectId.
 */
export async function getOrganizationById(
  id: string | ObjectId,
  session?: ClientSession
): Promise<Organization | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ _id: objId }, { session });
}

/**
 * Updates draftProfile for a Partner organization.
 */
export async function updateDraftProfile(
  organizationId: ObjectId,
  draftProfile: OrganizationProfileSnapshot,
  session?: ClientSession
): Promise<Organization | null> {
  const db = await getDb();
  const org = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ _id: organizationId }, { session });

  if (!org) {
    throw new Error("Organization not found.");
  }

  if (org.draftStatus === "IN_REVIEW") {
    throw new Error("Cannot edit profile while submitted for review.");
  }

  const now = new Date();
  const newDraftStatus: DraftStatus =
    org.draftStatus === "NONE" ? "DRAFT" : org.draftStatus || "DRAFT";

  const result = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOneAndUpdate(
      { _id: organizationId },
      {
        $set: {
          draftProfile,
          draftStatus: newDraftStatus,
          updatedAt: now,
        },
      },
      { returnDocument: "after", session }
    );

  return result;
}

/**
 * Submits draft profile for Admin review.
 */
export async function submitProfileForReview(
  organizationId: ObjectId,
  session?: ClientSession
): Promise<Organization | null> {
  const db = await getDb();
  const org = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ _id: organizationId }, { session });

  if (!org || !org.draftProfile) {
    throw new Error("Draft profile must be created before submitting for review.");
  }

  const { content } = org.draftProfile;
  if (!content?.en?.shortDescription || !content.en.shortDescription.trim()) {
    throw new Error("English short description is required for submission.");
  }

  const now = new Date();
  const result = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOneAndUpdate(
      { _id: organizationId },
      {
        $set: {
          draftStatus: "IN_REVIEW",
          "review.submittedAt": now,
          "review.feedback": "",
          updatedAt: now,
        },
      },
      { returnDocument: "after", session }
    );

  return result;
}

/**
 * Admin action: Request changes with required feedback. Accepts optional ClientSession.
 */
export async function requestProfileChanges(
  organizationId: ObjectId,
  adminId: ObjectId,
  feedback: string,
  session?: ClientSession
): Promise<Organization | null> {
  const db = await getDb();
  const org = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ _id: organizationId }, { session });

  if (!org || org.draftStatus !== "IN_REVIEW") {
    throw new Error("Organization profile must be IN_REVIEW to request changes.");
  }

  if (!feedback.trim()) {
    throw new Error("Feedback message is required when requesting changes.");
  }

  const now = new Date();
  const result = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOneAndUpdate(
      { _id: organizationId },
      {
        $set: {
          draftStatus: "CHANGES_REQUESTED",
          "review.reviewedAt": now,
          "review.reviewedBy": adminId,
          "review.feedback": feedback.trim(),
          updatedAt: now,
        },
      },
      { returnDocument: "after", session }
    );

  return result;
}

/**
 * Admin action: Approve & Publish profile content. Accepts optional ClientSession.
 * Copies draftProfile into publishedProfile, sets isPublished = true, draftStatus = "NONE".
 */
export async function publishOrganizationProfile(
  organizationId: ObjectId,
  adminId: ObjectId,
  session?: ClientSession
): Promise<Organization | null> {
  const db = await getDb();
  const org = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOne({ _id: organizationId }, { session });

  if (!org || org.draftStatus !== "IN_REVIEW" || !org.draftProfile) {
    throw new Error("Organization profile must be IN_REVIEW with a valid draft to publish.");
  }

  const now = new Date();
  const result = await db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .findOneAndUpdate(
      { _id: organizationId },
      {
        $set: {
          publishedProfile: org.draftProfile,
          isPublished: true,
          draftStatus: "NONE",
          publishedAt: now,
          publishedBy: adminId,
          "review.reviewedAt": now,
          "review.reviewedBy": adminId,
          updatedAt: now,
        },
      },
      { returnDocument: "after", session }
    );

  return result;
}

/**
 * Lists organizations for Admin review.
 */
export async function listOrganizationsForAdmin(
  filterTab?: DraftStatus | "PUBLISHED" | "ALL",
  session?: ClientSession
): Promise<Organization[]> {
  const db = await getDb();
  let filter: Record<string, unknown> = {};

  if (filterTab === "PUBLISHED") {
    filter = { isPublished: true };
  } else if (filterTab && filterTab !== "ALL") {
    filter = { draftStatus: filterTab };
  }

  return db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .find(filter, { session })
    .sort({ updatedAt: -1 })
    .toArray();
}

/**
 * Public query: Lists published organizations with CONFIRMED active summit participation.
 */
export async function listPublishedOrganizationsForPublic(options?: {
  type?: OrganizationType;
  country?: string;
}): Promise<Organization[]> {
  const db = await getDb();

  // Find active edition
  const activeEdition = await db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ status: "ACTIVE" });

  if (!activeEdition || !activeEdition._id) {
    return [];
  }

  // Find confirmed participations
  const confirmedParticipations = await db
    .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
    .find({ editionId: activeEdition._id, status: "CONFIRMED" })
    .toArray();

  if (confirmedParticipations.length === 0) {
    return [];
  }

  const confirmedOrgIds = confirmedParticipations.map((p) => p.organizationId);

  const filter: Record<string, unknown> = {
    _id: { $in: confirmedOrgIds },
    isPublished: true,
    publishedProfile: { $exists: true },
  };

  if (options?.type) {
    filter.type = options.type;
  }
  if (options?.country) {
    filter.countryNormalized = options.country.trim().toLowerCase();
  }

  return db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .find(filter)
    .sort({ name: 1 })
    .toArray();
}

/**
 * Fast DB counts for Admin Overview metrics.
 */
export async function getAdminOverviewMetrics() {
  const db = await getDb();

  const [
    pendingReviews,
    changesRequested,
    publishedPartners,
    activePartners,
  ] = await Promise.all([
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).countDocuments({ draftStatus: "IN_REVIEW" }),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).countDocuments({ draftStatus: "CHANGES_REQUESTED" }),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).countDocuments({ isPublished: true }),
    db.collection(COLLECTIONS.USERS).countDocuments({ role: "PARTNER", status: "ACTIVE" }),
  ]);

  return {
    pendingReviews,
    changesRequested,
    publishedPartners,
    activePartners,
  };
}

/**
 * Returns pending review count for sidebar badge.
 */
export async function countPendingOrganizations(): Promise<number> {
  const db = await getDb();
  return db
    .collection<Organization>(COLLECTIONS.ORGANIZATIONS)
    .countDocuments({ draftStatus: "IN_REVIEW" });
}
