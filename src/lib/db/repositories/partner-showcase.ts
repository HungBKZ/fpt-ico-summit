/**
 * src/lib/db/repositories/partner-showcase.ts
 *
 * Repository functions for managing PartnerShowcaseEntry documents in MongoDB.
 * Implements strict public DTO boundaries and admin management queries.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type {
  PartnerShowcaseEntry,
  ShowcaseRelationshipStatus,
  ShowcaseLogo,
  PublicShowcaseEntryDto,
} from "../models/partner-showcase";

export interface CreateShowcaseEntryInput {
  _id?: ObjectId;
  displayName: string;
  country?: string;
  websiteUrl?: string;
  logo?: ShowcaseLogo;
  relationshipStatus: ShowcaseRelationshipStatus;
  isVisible: boolean;
  displayOrder: number;
  organizationId?: ObjectId;
  displayConsentConfirmed: boolean;
  createdBy: ObjectId;
}

export interface UpdateShowcaseEntryInput {
  displayName?: string;
  country?: string;
  websiteUrl?: string;
  logo?: ShowcaseLogo;
  relationshipStatus?: ShowcaseRelationshipStatus;
  isVisible?: boolean;
  displayOrder?: number;
  organizationId?: ObjectId | null;
  displayConsentConfirmed?: boolean;
}

export interface ShowcaseAdminFilter {
  relationshipStatus?: ShowcaseRelationshipStatus | "ALL";
  visibility?: "VISIBLE" | "HIDDEN" | "ALL";
  search?: string;
}

/**
 * Creates a new partner showcase entry document in MongoDB.
 */
export async function createShowcaseEntry(
  input: CreateShowcaseEntryInput,
  session?: ClientSession
): Promise<PartnerShowcaseEntry> {
  const db = await getDb();
  const now = new Date();

  // Invariant verification: if isVisible is true, consent and logo MUST be valid
  if (input.isVisible) {
    if (!input.displayConsentConfirmed) {
      throw new Error("Display consent must be confirmed before making an entry visible.");
    }
    if (!input.logo?.publicId || !input.logo?.secureUrl) {
      throw new Error("A valid verified logo is required before making an entry visible.");
    }
  }

  const doc: PartnerShowcaseEntry = {
    displayName: input.displayName.trim(),
    relationshipStatus: input.relationshipStatus,
    isVisible: input.isVisible,
    displayOrder: input.displayOrder ?? 0,
    displayConsentConfirmed: input.displayConsentConfirmed,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  if (input._id) doc._id = input._id;
  if (input.country?.trim()) doc.country = input.country.trim();
  if (input.websiteUrl?.trim()) doc.websiteUrl = input.websiteUrl.trim();
  if (input.logo) doc.logo = input.logo;
  if (input.organizationId) doc.organizationId = input.organizationId;

  const result = await db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .insertOne(doc, { session });

  return { ...doc, _id: input._id || result.insertedId };
}

/**
 * Retrieves a single showcase entry by ID.
 */
export async function getShowcaseEntryById(
  id: string | ObjectId,
  session?: ClientSession
): Promise<PartnerShowcaseEntry | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .findOne({ _id: objId }, { session });
}

/**
 * Updates a showcase entry with server-side invariant checks.
 */
export async function updateShowcaseEntry(
  id: string | ObjectId,
  input: UpdateShowcaseEntryInput,
  session?: ClientSession
): Promise<PartnerShowcaseEntry | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;

  const existing = await db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .findOne({ _id: objId }, { session });

  if (!existing) {
    throw new Error("Showcase entry not found.");
  }

  const newIsVisible = input.isVisible !== undefined ? input.isVisible : existing.isVisible;
  const newConsent =
    input.displayConsentConfirmed !== undefined
      ? input.displayConsentConfirmed
      : existing.displayConsentConfirmed;
  const newLogo = input.logo !== undefined ? input.logo : existing.logo;

  // Invariant verification: if resulting isVisible is true, consent and logo MUST be present
  if (newIsVisible) {
    if (!newConsent) {
      throw new Error("Display consent must be confirmed before making an entry visible.");
    }
    if (!newLogo?.publicId || !newLogo?.secureUrl) {
      throw new Error("A valid verified logo is required before making an entry visible.");
    }
  }

  const setFields: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.displayName !== undefined) setFields.displayName = input.displayName.trim();
  if (input.country !== undefined) setFields.country = input.country.trim();
  if (input.websiteUrl !== undefined) setFields.websiteUrl = input.websiteUrl.trim();
  if (input.relationshipStatus !== undefined) setFields.relationshipStatus = input.relationshipStatus;
  if (input.isVisible !== undefined) setFields.isVisible = input.isVisible;
  if (input.displayOrder !== undefined) setFields.displayOrder = input.displayOrder;
  if (input.displayConsentConfirmed !== undefined) setFields.displayConsentConfirmed = input.displayConsentConfirmed;
  if (input.logo !== undefined) setFields.logo = input.logo;

  const unsetFields: Record<string, ""> = {};
  if (input.organizationId === null) {
    unsetFields.organizationId = "";
  } else if (input.organizationId !== undefined) {
    setFields.organizationId = input.organizationId;
  }

  const updateDoc: Record<string, unknown> = { $set: setFields };
  if (Object.keys(unsetFields).length > 0) {
    updateDoc.$unset = unsetFields;
  }

  const result = await db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .findOneAndUpdate({ _id: objId }, updateDoc, { returnDocument: "after", session });

  return result;
}

/**
 * Permanently removes a showcase entry from the collection.
 */
export async function deleteShowcaseEntry(
  id: string | ObjectId,
  session?: ClientSession
): Promise<boolean> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;

  const result = await db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .deleteOne({ _id: objId }, { session });

  return result.deletedCount > 0;
}

/**
 * Lists showcase entries for the Admin management view with optional filtering.
 */
export async function listShowcaseEntriesForAdmin(
  filter?: ShowcaseAdminFilter,
  session?: ClientSession
): Promise<PartnerShowcaseEntry[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (filter?.relationshipStatus && filter.relationshipStatus !== "ALL") {
    query.relationshipStatus = filter.relationshipStatus;
  }

  if (filter?.visibility && filter.visibility !== "ALL") {
    query.isVisible = filter.visibility === "VISIBLE";
  }

  if (filter?.search?.trim()) {
    const searchRegex = new RegExp(filter.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ displayName: searchRegex }, { country: searchRegex }];
  }

  return db
    .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
    .find(query, { session })
    .sort({ displayOrder: 1, createdAt: -1 })
    .toArray();
}

/**
 * Public query for homepage infinite marquee.
 * Strictly fetches entries where isVisible === true AND displayConsentConfirmed === true AND logo exists.
 * Projects only safe public fields into PublicShowcaseEntryDto.
 */
export async function getPublicShowcaseEntries(): Promise<PublicShowcaseEntryDto[]> {
  try {
    const db = await getDb();

    const entries = await db
      .collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES)
      .find({
        isVisible: true,
        displayConsentConfirmed: true,
        "logo.secureUrl": { $exists: true, $ne: "" },
        "logo.publicId": { $exists: true, $ne: "" },
      })
      .sort({ displayOrder: 1, createdAt: 1 })
      .toArray();

    return entries.map((entry) => ({
      id: entry._id?.toString() || "",
      displayName: entry.displayName,
      country: entry.country || undefined,
      websiteUrl: entry.websiteUrl || undefined,
      logo: {
        secureUrl: entry.logo!.secureUrl,
        width: entry.logo!.width,
        height: entry.logo!.height,
      },
      displayOrder: entry.displayOrder,
    }));
  } catch (err) {
    console.warn("Could not load public showcase entries for static generation:", err);
    return [];
  }
}

/**
 * Counts metrics for admin dashboard overview.
 */
export async function getShowcaseMetrics() {
  const db = await getDb();
  const col = db.collection<PartnerShowcaseEntry>(COLLECTIONS.PARTNER_SHOWCASE_ENTRIES);

  const [total, visible, invited, confirmed, network] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ isVisible: true }),
    col.countDocuments({ relationshipStatus: "INVITED" }),
    col.countDocuments({ relationshipStatus: "CONFIRMED" }),
    col.countDocuments({ relationshipStatus: "NETWORK_PARTNER" }),
  ]);

  return { total, visible, invited, confirmed, network };
}
