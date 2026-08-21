/**
 * src/lib/db/collections.ts
 *
 * Centralized MongoDB collection constants for FPT ICO Summit 2026.
 */

export const COLLECTIONS = {
  /** Summit editions metadata & active cycle tracking */
  SUMMIT_EDITIONS: "summitEditions",

  /** User accounts with RBAC roles (ADMIN, PARTNER, MEMBER) */
  USERS: "users",

  /** Public partner and member access request submissions (Deprecated) */
  ACCOUNT_REQUESTS: "accountRequests",

  /** Registered universities, consulates & partner organizations */
  ORGANIZATIONS: "organizations",

  /** Multi-year junction linking Organization to SummitEdition */
  ORGANIZATION_PARTICIPATIONS: "organizationParticipations",

  /** System audit log trail for governance & compliance */
  AUDIT_LOGS: "auditLogs",

  /** Official scholarship opportunities submitted by partner institutions */
  SCHOLARSHIPS: "scholarships",

  /** Participant Summit registrations for active edition */
  SUMMIT_REGISTRATIONS: "summitRegistrations",

  /** Partner workshop and stage performance activity proposals */
  SUMMIT_ACTIVITIES: "summitActivities",

  /** On-site per-day check-in records (Phase 5C) */
  SUMMIT_CHECK_INS: "summitCheckIns",

  /** Staff-assigned booth assignments for Partner organizations (Phase 5C) */
  SUMMIT_BOOTH_ASSIGNMENTS: "summitBoothAssignments",

  /** Member optional Workshop & Stage Performance selections (Phase 5D) */
  SUMMIT_ACTIVITY_SELECTIONS: "summitActivitySelections",

  /** Staff-verified optional Workshop & Stage Performance attendance records (Phase 5E) */
  SUMMIT_ACTIVITY_ATTENDANCES: "summitActivityAttendances",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
