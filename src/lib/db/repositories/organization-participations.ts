/**
 * src/lib/db/repositories/organization-participations.ts
 *
 * Repository functions for managing OrganizationParticipation records in MongoDB. Supports optional ClientSession.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type {
  OrganizationParticipation,
  ParticipationStatus,
} from "../models/organization-participation";
import type { SummitEdition } from "../models/summit-edition";

/**
 * Finds or upserts an OrganizationParticipation record for the active SummitEdition, setting status to CONFIRMED.
 * Accepts optional ClientSession for transactional atomicity.
 */
export async function confirmActiveEditionParticipation(
  organizationId: ObjectId,
  session?: ClientSession
): Promise<OrganizationParticipation> {
  const db = await getDb();

  // Find current ACTIVE summit edition
  const activeEdition = await db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ status: "ACTIVE" }, { session });

  if (!activeEdition || !activeEdition._id) {
    throw new Error("No ACTIVE SummitEdition found.");
  }

  const now = new Date();
  const filter = {
    organizationId,
    editionId: activeEdition._id,
  };

  const update = {
    $set: {
      status: "CONFIRMED" as ParticipationStatus,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  const result = await db
    .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
    .findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after", session });

  return result!;
}

/**
 * Lists all CONFIRMED OrganizationParticipation records for a given edition.
 */
export async function getConfirmedParticipationsForEdition(
  editionId: ObjectId,
  session?: ClientSession
): Promise<OrganizationParticipation[]> {
  const db = await getDb();
  return db
    .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
    .find(
      {
        editionId,
        status: "CONFIRMED",
      },
      { session }
    )
    .toArray();
}

/**
 * Checks whether an Organization has a CONFIRMED OrganizationParticipation record for a given SummitEdition.
 */
export async function isParticipationConfirmed(
  organizationId: ObjectId,
  editionId: ObjectId,
  session?: ClientSession
): Promise<boolean> {
  const db = await getDb();
  const record = await db
    .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
    .findOne(
      {
        organizationId,
        editionId,
        status: "CONFIRMED",
      },
      { session }
    );
  return Boolean(record);
}
