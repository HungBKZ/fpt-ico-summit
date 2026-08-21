/**
 * src/lib/db/models/user.ts
 *
 * User domain model for FPT ICO Summit 2026.
 */

import type { ObjectId } from "mongodb";

export type UserRole = "ADMIN" | "SUMMIT_STAFF" | "PARTNER" | "MEMBER";

export type PartnerType = "UNIVERSITY" | "CONSULATE";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export type MemberType = "FPT_CANTHO_STUDENT" | "EXTERNAL_PARTICIPANT";

export interface UserProfileMetadata {
  memberType?: MemberType;
  phone?: string;
  studentId?: string;
  studentIdNormalized?: string;
  institution?: string;
  schoolOrUniversity?: string;
  position?: string;
}

export interface User {
  _id?: ObjectId;

  /** Display email */
  email: string;

  /** Normalized email (trimmed and lowercased for case-insensitive unique matching) */
  emailNormalized: string;

  /** Full display name */
  name: string;

  /** Encoded password hash: scrypt$v1$<saltHex>$<derivedKeyHex> */
  passwordHash: string;

  /** Authorization role */
  role: UserRole;

  /** Category of partner (Required for PARTNER role, undefined for ADMIN/MEMBER) */
  partnerType?: PartnerType;

  /** Reference to minimal Organization document (Required for PARTNER role) */
  organizationId?: ObjectId;

  /** Optional structured user profile metadata */
  profile?: UserProfileMetadata;

  /** Account status */
  status: UserStatus;

  /** Forced password change flag for first login or administrative resets */
  mustChangePassword: boolean;

  /** Counter for consecutive failed password login attempts */
  failedLoginAttempts: number;

  /** Temporary lockout expiration timestamp if account is locked due to failed logins */
  lockedUntil?: Date | null;

  /** Timestamp of last successful login */
  lastLoginAt?: Date | null;

  /** Timestamp when user last changed their password */
  passwordChangedAt?: Date | null;

  /** Record creation timestamp */
  createdAt: Date;

  /** Record update timestamp */
  updatedAt: Date;

  /** Admin user ID who created this account (if created via request approval) */
  createdBy?: ObjectId;
}
