/**
 * src/lib/db/repositories/account-requests.ts
 *
 * Repository functions for managing AccountRequest documents in MongoDB.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import { normalizeEmail } from "@/lib/auth/password";
import type {
  AccountRequest,
  AccountRequestType,
  AccountRequestStatus,
} from "../models/account-request";
import type { PartnerType } from "../models/user";

export interface CreateAccountRequestInput {
  requestType: AccountRequestType;
  name: string;
  email: string;
  phone?: string;
  note?: string;

  // Partner fields
  organizationName?: string;
  partnerType?: PartnerType;
  country?: string;
  position?: string;

  // Member fields
  schoolOrUniversity?: string;
  studentId?: string;
}

/**
 * Finds a PENDING account request by normalized email.
 */
export async function findPendingByNormalizedEmail(
  email: string
): Promise<AccountRequest | null> {
  const normalized = normalizeEmail(email);
  const db = await getDb();
  return db.collection<AccountRequest>(COLLECTIONS.ACCOUNT_REQUESTS).findOne({
    emailNormalized: normalized,
    status: "PENDING",
  });
}

/**
 * Creates a public AccountRequest document (status = PENDING).
 * Returns existing pending request if duplicate exists (neutral policy).
 */
export async function createAccountRequest(
  input: CreateAccountRequestInput
): Promise<{ request: AccountRequest; isDuplicate: boolean }> {
  const normalized = normalizeEmail(input.email);
  const db = await getDb();

  const existingPending = await findPendingByNormalizedEmail(normalized);
  if (existingPending) {
    return { request: existingPending, isDuplicate: true };
  }

  const now = new Date();
  const doc: AccountRequest = {
    requestType: input.requestType,
    name: input.name.trim(),
    email: input.email.trim(),
    emailNormalized: normalized,
    phone: input.phone ? input.phone.trim() : undefined,
    note: input.note ? input.note.trim() : undefined,
    status: "PENDING",
    organizationName: input.organizationName
      ? input.organizationName.trim()
      : undefined,
    partnerType: input.partnerType,
    country: input.country ? input.country.trim() : undefined,
    position: input.position ? input.position.trim() : undefined,
    schoolOrUniversity: input.schoolOrUniversity
      ? input.schoolOrUniversity.trim()
      : undefined,
    studentId: input.studentId ? input.studentId.trim() : undefined,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection<AccountRequest>(COLLECTIONS.ACCOUNT_REQUESTS)
    .insertOne(doc);

  return { request: { ...doc, _id: result.insertedId }, isDuplicate: false };
}

/**
 * Lists all account requests for Admin review.
 */
export async function listAccountRequests(
  statusFilter?: AccountRequestStatus
): Promise<AccountRequest[]> {
  const db = await getDb();
  const filter = statusFilter ? { status: statusFilter } : {};
  return db
    .collection<AccountRequest>(COLLECTIONS.ACCOUNT_REQUESTS)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Retrieves an account request by ID.
 */
export async function getAccountRequestById(
  id: string | ObjectId
): Promise<AccountRequest | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return db
    .collection<AccountRequest>(COLLECTIONS.ACCOUNT_REQUESTS)
    .findOne({ _id: objId });
}

/**
 * Updates status of an account request (e.g. APPROVED, REJECTED, ACCOUNT_CREATED).
 */
export async function updateAccountRequestStatus(
  id: string | ObjectId,
  status: AccountRequestStatus,
  reviewerId: ObjectId,
  options?: {
    rejectionReason?: string;
    createdUserId?: ObjectId;
  }
): Promise<AccountRequest | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  const now = new Date();

  const updates: Partial<AccountRequest> = {
    status,
    reviewedBy: reviewerId,
    reviewedAt: now,
    updatedAt: now,
  };

  if (options?.rejectionReason !== undefined) {
    updates.rejectionReason = options.rejectionReason;
  }
  if (options?.createdUserId !== undefined) {
    updates.createdUserId = options.createdUserId;
  }

  const result = await db
    .collection<AccountRequest>(COLLECTIONS.ACCOUNT_REQUESTS)
    .findOneAndUpdate({ _id: objId }, { $set: updates }, { returnDocument: "after" });

  return result;
}
