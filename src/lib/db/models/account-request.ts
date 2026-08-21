/**
 * src/lib/db/models/account-request.ts
 *
 * Domain model for public account requests (PARTNER and MEMBER).
 */

import type { ObjectId } from "mongodb";
import type { PartnerType } from "./user";

export type AccountRequestType = "PARTNER" | "MEMBER";

export type AccountRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACCOUNT_CREATED";

export interface AccountRequest {
  _id?: ObjectId;

  /** Target user type requested */
  requestType: AccountRequestType;

  /** Contact / applicant full name */
  name: string;

  /** Submitted contact email */
  email: string;

  /** Normalized email for duplicate prevention */
  emailNormalized: string;

  /** Optional contact phone number */
  phone?: string;

  /** Optional applicant note or message */
  note?: string;

  /** Lifecycle status of the request */
  status: AccountRequestStatus;

  // ── PARTNER specific fields ──────────────────────────────────────────────
  organizationName?: string;
  partnerType?: PartnerType;
  country?: string;
  position?: string;

  // ── MEMBER specific fields ───────────────────────────────────────────────
  schoolOrUniversity?: string;
  studentId?: string;

  // ── Review & Creation tracking ──────────────────────────────────────────
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;

  /** Reference to the created User document once account is created */
  createdUserId?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
