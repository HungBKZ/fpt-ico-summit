/**
 * src/lib/db/repositories/summit-editions.ts
 *
 * Repository functions for managing SummitEdition documents in MongoDB.
 * Encapsulates database queries and explicit data validation.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type {
  SummitEdition,
  CreateSummitEditionInput,
  UpdateSummitEditionInput,
  SummitEditionStatus,
} from "../models/summit-edition";

const VALID_STATUSES: SummitEditionStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];
const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Validates SummitEdition creation/update inputs.
 */
function validateSummitEditionInput(
  input: Partial<CreateSummitEditionInput>,
  isCreate = false
): {
  year?: number;
  slug?: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  status?: SummitEditionStatus;
} {
  const validated: {
    year?: number;
    slug?: string;
    name?: string;
    startDate?: Date;
    endDate?: Date;
    timezone?: string;
    status?: SummitEditionStatus;
  } = {};

  if (isCreate || input.year !== undefined) {
    if (
      typeof input.year !== "number" ||
      !Number.isInteger(input.year) ||
      input.year < 1000 ||
      input.year > 9999
    ) {
      throw new Error("Invalid year: must be a four-digit integer.");
    }
    validated.year = input.year;
  }

  if (isCreate || input.slug !== undefined) {
    if (typeof input.slug !== "string" || input.slug.trim().length === 0) {
      throw new Error("Invalid slug: cannot be blank.");
    }
    validated.slug = input.slug.trim();
  }

  if (isCreate || input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      throw new Error("Invalid name: cannot be blank.");
    }
    validated.name = input.name.trim();
  }

  if (isCreate || input.startDate !== undefined) {
    const start = input.startDate
      ? new Date(input.startDate)
      : new Date(NaN);
    if (isNaN(start.getTime())) {
      throw new Error("Invalid startDate: must be a valid date.");
    }
    validated.startDate = start;
  }

  if (isCreate || input.endDate !== undefined) {
    const end = input.endDate ? new Date(input.endDate) : new Date(NaN);
    if (isNaN(end.getTime())) {
      throw new Error("Invalid endDate: must be a valid date.");
    }
    validated.endDate = end;
  }

  if (validated.startDate && validated.endDate) {
    if (validated.startDate > validated.endDate) {
      throw new Error("Invalid date range: startDate must be before or equal to endDate.");
    }
  }

  if (isCreate || input.timezone !== undefined) {
    const tz = input.timezone ? input.timezone.trim() : DEFAULT_TIMEZONE;
    if (tz.length === 0) {
      throw new Error("Invalid timezone: cannot be blank.");
    }
    validated.timezone = tz;
  }

  if (input.status !== undefined) {
    if (!VALID_STATUSES.includes(input.status)) {
      throw new Error(
        `Invalid status '${input.status}'. Allowed values: ${VALID_STATUSES.join(", ")}.`
      );
    }
    validated.status = input.status;
  } else if (isCreate) {
    validated.status = "DRAFT";
  }

  return validated;
}

/**
 * Retrieves a SummitEdition by four-digit year.
 */
export async function getSummitEditionByYear(
  year: number
): Promise<SummitEdition | null> {
  const db = await getDb();
  return db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ year });
}

/**
 * Retrieves a SummitEdition by slug.
 */
export async function getSummitEditionBySlug(
  slug: string
): Promise<SummitEdition | null> {
  const db = await getDb();
  return db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ slug });
}

/**
 * Retrieves the current ACTIVE SummitEdition.
 */
export async function getActiveSummitEdition(): Promise<SummitEdition | null> {
  const db = await getDb();
  return db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOne({ status: "ACTIVE" });
}

/**
 * Lists all SummitEditions sorted by year descending.
 */
export async function listSummitEditions(): Promise<SummitEdition[]> {
  const db = await getDb();
  return db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .find()
    .sort({ year: -1 })
    .toArray();
}

/**
 * Creates a new SummitEdition document.
 */
export async function createSummitEdition(
  input: CreateSummitEditionInput
): Promise<SummitEdition> {
  const validated = validateSummitEditionInput(input, true);
  const db = await getDb();

  const now = new Date();
  const doc: SummitEdition = {
    year: validated.year!,
    slug: validated.slug!,
    name: validated.name!,
    startDate: validated.startDate!,
    endDate: validated.endDate!,
    timezone: validated.timezone || DEFAULT_TIMEZONE,
    status: validated.status || "DRAFT",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .insertOne(doc);

  return { ...doc, _id: result.insertedId };
}

/**
 * Updates an existing SummitEdition by ID.
 */
export async function updateSummitEdition(
  id: string | ObjectId,
  input: UpdateSummitEditionInput
): Promise<SummitEdition | null> {
  const validated = validateSummitEditionInput(input, false);
  const db = await getDb();

  const filter = {
    _id: typeof id === "string" ? new ObjectId(id) : id,
  };

  const updateDoc = {
    $set: {
      ...validated,
      updatedAt: new Date(),
    },
  };

  const result = await db
    .collection<SummitEdition>(COLLECTIONS.SUMMIT_EDITIONS)
    .findOneAndUpdate(filter, updateDoc, { returnDocument: "after" });

  return result;
}
