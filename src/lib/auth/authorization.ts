/**
 * src/lib/auth/authorization.ts
 *
 * Server-side Data Access Layer (DAL) authorization guards for FPT ICO Summit 2026.
 * Enforces live MongoDB user status and role checks to prevent stale JWT misuse.
 */

import { auth } from "@/auth";
import { findUserById } from "@/lib/db/repositories/users";
import type { User, UserRole } from "@/lib/db/models/user";

export interface AuthenticatedUserContext {
  sessionUser: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  dbUser: User;
}

/**
 * Validates active session and re-queries live User document from MongoDB.
 * Throws an error if user is unauthenticated, suspended, or missing.
 */
export async function requireUser(): Promise<AuthenticatedUserContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED: Authentication is required.");
  }

  const dbUser = await findUserById(session.user.id);

  if (!dbUser || dbUser.status !== "ACTIVE") {
    throw new Error("UNAUTHORIZED: User account is inactive or suspended.");
  }

  return {
    sessionUser: {
      id: session.user.id,
      email: session.user.email || dbUser.email,
      name: session.user.name || dbUser.name,
      role: dbUser.role,
    },
    dbUser,
  };
}

/**
 * Validates that current user has one of the allowed roles.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthenticatedUserContext> {
  const ctx = await requireUser();

  if (!allowedRoles.includes(ctx.dbUser.role)) {
    throw new Error(
      `FORBIDDEN: Access restricted. Required role: ${allowedRoles.join(" or ")}.`
    );
  }

  return ctx;
}

/**
 * Guard for ADMIN-only operations. Re-queries MongoDB to verify live ADMIN role.
 */
export async function requireAdmin(): Promise<AuthenticatedUserContext> {
  return requireRole(["ADMIN"]);
}

/**
 * Guard for PARTNER-only operations. Re-queries MongoDB to verify live PARTNER role.
 */
export async function requirePartner(): Promise<AuthenticatedUserContext> {
  return requireRole(["PARTNER"]);
}

/**
 * Guard for MEMBER-only operations. Re-queries MongoDB to verify live MEMBER role.
 */
export async function requireMember(): Promise<AuthenticatedUserContext> {
  return requireRole(["MEMBER"]);
}

/**
 * Guard for SUMMIT_STAFF-only operations. Strictly checks SUMMIT_STAFF role.
 */
export async function requireSummitStaff(): Promise<AuthenticatedUserContext> {
  return requireRole(["SUMMIT_STAFF"]);
}

/**
 * Guard for operational features that permit either ADMIN or SUMMIT_STAFF.
 */
export async function requireSummitOperationsAccess(): Promise<AuthenticatedUserContext> {
  return requireRole(["ADMIN", "SUMMIT_STAFF"]);
}
