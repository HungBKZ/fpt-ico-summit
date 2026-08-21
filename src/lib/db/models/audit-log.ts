/**
 * src/lib/db/models/audit-log.ts
 *
 * Domain model for security and administrative audit log events.
 */

import type { ObjectId } from "mongodb";

export type AuditAction =
  | "ORG_PROFILE_DRAFT_SAVED"
  | "ORG_PROFILE_SUBMITTED"
  | "ORG_PROFILE_CHANGES_REQUESTED"
  | "ORG_PROFILE_PUBLISHED"
  | "ORG_PARTICIPATION_CONFIRMED"
  | "MEMBER_REGISTERED"
  | "PARTNER_ACCOUNT_CREATED"
  | "PARTNER_TEMP_PASSWORD_RESET"
  | "ACCOUNT_REQUEST_SUBMITTED"
  | "ACCOUNT_REQUEST_APPROVED"
  | "ACCOUNT_REQUEST_REJECTED"
  | "USER_CREATED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED"
  | "PASSWORD_CHANGED"
  | "SCHOLARSHIP_CREATED"
  | "SCHOLARSHIP_DRAFT_SAVED"
  | "SCHOLARSHIP_SUBMITTED"
  | "SCHOLARSHIP_CHANGES_REQUESTED"
  | "SCHOLARSHIP_PUBLISHED"
  | "SUMMIT_STAFF_ACCOUNT_CREATED"
  | "SUMMIT_STAFF_TEMP_PASSWORD_RESET"
  | "SUMMIT_REGISTRATION_CREATED"
  | "SUMMIT_REGISTRATION_CANCELLED"
  | "SUMMIT_ACTIVITY_CREATED"
  | "SUMMIT_ACTIVITY_DRAFT_SAVED"
  | "SUMMIT_ACTIVITY_SUBMITTED"
  | "SUMMIT_ACTIVITY_CHANGES_REQUESTED"
  | "SUMMIT_ACTIVITY_CONTENT_APPROVED"
  | "WORKSHOP_TOPIC_SUBMITTED"
  | "WORKSHOP_TOPIC_ACCEPTED"
  | "WORKSHOP_TOPIC_CHANGES_REQUESTED"
  | "SUMMIT_PARTICIPANT_CHECKED_IN"
  | "SUMMIT_BOOTH_ASSIGNED"
  | "SUMMIT_BOOTH_UPDATED"
  | "SUMMIT_BOOTH_PUBLISHED"
  | "SUMMIT_ACTIVITY_SCHEDULE_SAVED"
  | "SUMMIT_ACTIVITY_SCHEDULE_PUBLISHED"
  | "SUMMIT_ACTIVITY_SELECTED"
  | "SUMMIT_ACTIVITY_UNSELECTED"
  | "SUMMIT_ACTIVITY_ATTENDANCE_MARKED"
  | "SUMMIT_ACTIVITY_ATTENDANCE_REMOVED"
  | "SUMMIT_REPORT_EXPORTED";

export interface AuditLog {
  _id?: ObjectId;

  /** Action type */
  action: AuditAction;

  /** User ID performing the action (undefined for public registrations) */
  actorUserId?: ObjectId;

  /** Target User ID affected by the action (if applicable) */
  targetUserId?: ObjectId;

  /** Target AccountRequest ID affected (legacy / compatibility) */
  accountRequestId?: ObjectId;

  /** Target Organization ID affected (if applicable) */
  organizationId?: ObjectId;

  /**
   * Additional non-sensitive contextual metadata.
   * MUST NEVER contain passwords, temporary passwords, hashes, AUTH_SECRET, or DB credentials.
   */
  metadata?: Record<string, unknown>;

  createdAt: Date;
}
