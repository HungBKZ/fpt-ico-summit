"use server";

import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/db/mongodb";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  resetUserTemporaryPassword,
  updateUserStatus,
  updateUserProfile,
} from "@/lib/db/repositories/users";
import { findOrCreateMinimalOrganization } from "@/lib/db/repositories/organizations";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import { requireAdmin, requireUser, requireMember } from "@/lib/auth/authorization";
import {
  hashPassword,
  generateTemporaryPassword,
  validateUserPassword,
  verifyPassword,
} from "@/lib/auth/password";
import type { PartnerType, UserStatus, UserProfileMetadata, MemberType } from "@/lib/db/models/user";

/**
 * Server Action: Public Member Self-Registration.
 * Security: Server ALWAYS hardcodes role = "MEMBER", status = "ACTIVE", mustChangePassword = false.
 * Validates memberType (FPT_CANTHO_STUDENT requires studentId & phone; EXTERNAL_PARTICIPANT requires phone).
 */
export async function registerMemberAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const rawMemberType = String(formData.get("memberType") || "").trim();

    if (!name || !email || !password || !rawMemberType) {
      return { success: false, error: "Name, email, password, and participant type are required." };
    }

    if (rawMemberType !== "FPT_CANTHO_STUDENT" && rawMemberType !== "EXTERNAL_PARTICIPANT") {
      return { success: false, error: "Please select a valid participant type." };
    }
    const memberType = rawMemberType as MemberType;

    const phone = String(formData.get("phone") || "").trim();
    if (!phone) {
      return { success: false, error: "Phone number is required." };
    }

    const studentId = String(formData.get("studentId") || "").trim();
    const studentIdNormalized = studentId ? studentId.toUpperCase() : undefined;
    const institution = String(formData.get("institution") || "").trim();

    if (memberType === "FPT_CANTHO_STUDENT" && !studentId) {
      return { success: false, error: "Student ID (MSSV) is required for FPT Can Tho students." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Password and confirmation do not match." };
    }

    const policy = validateUserPassword(password);
    if (!policy.valid) {
      return { success: false, error: policy.message };
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const profile: UserProfileMetadata = {
      memberType,
      phone,
    };

    if (memberType === "FPT_CANTHO_STUDENT") {
      profile.studentId = studentId;
      profile.studentIdNormalized = studentIdNormalized;
      profile.institution = "FPT University Can Tho Campus";
    } else {
      if (institution) {
        profile.institution = institution;
      }
    }

    const passHash = await hashPassword(password);

    const createdUser = await createUser({
      email,
      name,
      passwordHash: passHash,
      role: "MEMBER", // ALWAYS hardcoded
      profile,
      status: "ACTIVE",
      mustChangePassword: false,
    });

    await createAuditEntry({
      action: "MEMBER_REGISTERED",
      targetUserId: createdUser._id,
      metadata: { email: createdUser.email, memberType },
    });

    return { success: true };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      const errStr = String((err as { message?: string }).message || "");
      if (errStr.includes("studentIdNormalized") || errStr.includes("uniq_member_student_id")) {
        return {
          success: false,
          error: "MSSV này đã được sử dụng bởi một tài khoản khác. / This Student ID is already associated with another account.",
        };
      }
    }
    const msg = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Update authenticated Member profile classification.
 * Used by legacy members or members updating their profile data.
 */
export async function updateMemberProfileAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requireMember();

    const rawMemberType = String(formData.get("memberType") || "").trim();
    if (rawMemberType !== "FPT_CANTHO_STUDENT" && rawMemberType !== "EXTERNAL_PARTICIPANT") {
      return { success: false, error: "Please select a valid participant type." };
    }
    const memberType = rawMemberType as MemberType;

    const phone = String(formData.get("phone") || "").trim();
    if (!phone) {
      return { success: false, error: "Phone number is required." };
    }

    const studentId = String(formData.get("studentId") || "").trim();
    const studentIdNormalized = studentId ? studentId.toUpperCase() : undefined;
    const institution = String(formData.get("institution") || "").trim();

    if (memberType === "FPT_CANTHO_STUDENT" && !studentId) {
      return { success: false, error: "Student ID (MSSV) is required for FPT Can Tho students." };
    }

    const profile: UserProfileMetadata = {
      memberType,
      phone,
    };

    if (memberType === "FPT_CANTHO_STUDENT") {
      profile.studentId = studentId;
      profile.studentIdNormalized = studentIdNormalized;
      profile.institution = "FPT University Can Tho Campus";
    } else {
      if (institution) {
        profile.institution = institution;
      }
    }

    await updateUserProfile(dbUser._id!, profile);

    return { success: true };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      const errStr = String((err as { message?: string }).message || "");
      if (errStr.includes("studentIdNormalized") || errStr.includes("uniq_member_student_id")) {
        return {
          success: false,
          error: "MSSV này đã được sử dụng bởi một tài khoản khác. / This Student ID is already associated with another account.",
        };
      }
    }
    const msg = err instanceof Error ? err.message : "Failed to update profile.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action (ADMIN ONLY): Create Partner Account.
 * Executes inside an atomic MongoDB ClientSession transaction using session.withTransaction.
 * Creates Organization, generates temporary password in server memory, creates PARTNER User,
 * writes PARTNER_ACCOUNT_CREATED audit event, and returns temporary password ONCE ONLY.
 */
export async function createPartnerAccountAction(formData: FormData): Promise<{
  success: boolean;
  credentials?: { email: string; temporaryPassword: string; organizationName: string; name: string };
  error?: string;
}> {
  const { dbUser } = await requireAdmin();

  const partnerType = (formData.get("partnerType") as PartnerType) || "UNIVERSITY";
  const organizationName = String(formData.get("organizationName") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!organizationName || !country || !name || !email) {
    return { success: false, error: "Organization name, country, representative name, and email are required." };
  }

  const position = String(formData.get("position") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const profile: UserProfileMetadata = {};
  if (position) profile.position = position;
  if (phone) profile.phone = phone;

  const client = await getMongoClient();
  const session = client.startSession();

  let credentialsResult: { email: string; temporaryPassword: string; organizationName: string; name: string } | null = null;

  try {
    await session.withTransaction(async () => {
      const existing = await findUserByEmail(email, session);
      if (existing) {
        throw new Error("An account with this email already exists.");
      }

      const org = await findOrCreateMinimalOrganization(
        {
          type: partnerType,
          name: organizationName,
          country,
        },
        session
      );

      const tempPassword = generateTemporaryPassword(16);
      const passHash = await hashPassword(tempPassword);

      const createdUser = await createUser(
        {
          email,
          name,
          passwordHash: passHash,
          role: "PARTNER",
          partnerType,
          organizationId: org._id,
          profile: Object.keys(profile).length > 0 ? profile : undefined,
          status: "ACTIVE",
          mustChangePassword: true,
          createdBy: dbUser._id,
        },
        session
      );

      await createAuditEntry(
        {
          action: "PARTNER_ACCOUNT_CREATED",
          actorUserId: dbUser._id,
          targetUserId: createdUser._id,
          organizationId: org._id,
          metadata: { partnerType, organizationName },
        },
        session
      );

      credentialsResult = {
        email: createdUser.email,
        temporaryPassword: tempPassword,
        organizationName: org.name,
        name: createdUser.name,
      };
    });

    if (credentialsResult) {
      return {
        success: true,
        credentials: credentialsResult,
      };
    } else {
      return { success: false, error: "Failed to create partner account." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create partner account.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}

/**
 * Server Action (ADMIN ONLY): Reset Partner Temporary Password.
 * Generates a new 16-char temporary password, hashes it, sets mustChangePassword = true,
 * records PARTNER_TEMP_PASSWORD_RESET audit log event, and returns plaintext temporary password ONCE to Admin UI.
 */
export async function resetPartnerTemporaryPasswordAction(userIdStr: string): Promise<{
  success: boolean;
  credentials?: { email: string; temporaryPassword: string; name: string };
  error?: string;
}> {
  const { dbUser } = await requireAdmin();

  if (!userIdStr) {
    return { success: false, error: "User ID is required." };
  }

  const userId = new ObjectId(userIdStr);
  const client = await getMongoClient();
  const session = client.startSession();

  let credentialsResult: { email: string; temporaryPassword: string; name: string } | null = null;

  try {
    await session.withTransaction(async () => {
      const targetUser = await findUserById(userId, session);
      if (!targetUser) {
        throw new Error("Target user account not found.");
      }

      if (targetUser.role !== "PARTNER") {
        throw new Error("Temporary password reset is only allowed for Partner accounts.");
      }

      if (targetUser.status === "DISABLED") {
        throw new Error("Cannot reset password for a disabled account.");
      }

      const tempPassword = generateTemporaryPassword(16);
      const passHash = await hashPassword(tempPassword);

      await resetUserTemporaryPassword(userId, passHash, session);

      await createAuditEntry(
        {
          action: "PARTNER_TEMP_PASSWORD_RESET",
          actorUserId: dbUser._id,
          targetUserId: targetUser._id,
          organizationId: targetUser.organizationId,
        },
        session
      );

      credentialsResult = {
        email: targetUser.email,
        temporaryPassword: tempPassword,
        name: targetUser.name,
      };
    });

    if (credentialsResult) {
      return {
        success: true,
        credentials: credentialsResult,
      };
    } else {
      return { success: false, error: "Failed to reset temporary password." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset temporary password.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}

/**
 * Server Action (ADMIN ONLY): Create Operational SUMMIT_STAFF Account.
 * Generates secure temporary password, hashes it, sets mustChangePassword = true,
 * records SUMMIT_STAFF_ACCOUNT_CREATED audit event, and returns temporary password ONCE to Admin UI.
 */
export async function createStaffAccountAction(formData: FormData): Promise<{
  success: boolean;
  credentials?: { email: string; temporaryPassword: string; name: string; role: string };
  error?: string;
}> {
  const { dbUser } = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email) {
    return { success: false, error: "Full Name and Email are required." };
  }

  const profile: UserProfileMetadata = {};
  if (phone) profile.phone = phone;

  const client = await getMongoClient();
  const session = client.startSession();

  let credentialsResult: { email: string; temporaryPassword: string; name: string; role: string } | null = null;

  try {
    await session.withTransaction(async () => {
      const existing = await findUserByEmail(email, session);
      if (existing) {
        throw new Error("An account with this email already exists.");
      }

      const tempPassword = generateTemporaryPassword(16);
      const passHash = await hashPassword(tempPassword);

      const createdUser = await createUser(
        {
          email,
          name,
          passwordHash: passHash,
          role: "SUMMIT_STAFF",
          profile: Object.keys(profile).length > 0 ? profile : undefined,
          status: "ACTIVE",
          mustChangePassword: true,
          createdBy: dbUser._id,
        },
        session
      );

      await createAuditEntry(
        {
          action: "SUMMIT_STAFF_ACCOUNT_CREATED",
          actorUserId: dbUser._id,
          targetUserId: createdUser._id,
          metadata: { email: createdUser.email, name: createdUser.name },
        },
        session
      );

      credentialsResult = {
        email: createdUser.email,
        temporaryPassword: tempPassword,
        name: createdUser.name,
        role: "SUMMIT_STAFF",
      };
    });

    if (credentialsResult) {
      return {
        success: true,
        credentials: credentialsResult,
      };
    } else {
      return { success: false, error: "Failed to create staff account." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create staff account.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}

/**
 * Server Action (ADMIN ONLY): Reset Staff Temporary Password.
 */
export async function resetStaffTemporaryPasswordAction(userIdStr: string): Promise<{
  success: boolean;
  credentials?: { email: string; temporaryPassword: string; name: string };
  error?: string;
}> {
  const { dbUser } = await requireAdmin();

  if (!userIdStr) {
    return { success: false, error: "User ID is required." };
  }

  const userId = new ObjectId(userIdStr);
  const client = await getMongoClient();
  const session = client.startSession();

  let credentialsResult: { email: string; temporaryPassword: string; name: string } | null = null;

  try {
    await session.withTransaction(async () => {
      const targetUser = await findUserById(userId, session);
      if (!targetUser) {
        throw new Error("Target staff account not found.");
      }

      if (targetUser.role !== "SUMMIT_STAFF") {
        throw new Error("Temporary password reset is only allowed for Staff accounts.");
      }

      if (targetUser.status === "DISABLED") {
        throw new Error("Cannot reset password for a disabled account.");
      }

      const tempPassword = generateTemporaryPassword(16);
      const passHash = await hashPassword(tempPassword);

      await resetUserTemporaryPassword(userId, passHash, session);

      await createAuditEntry(
        {
          action: "SUMMIT_STAFF_TEMP_PASSWORD_RESET",
          actorUserId: dbUser._id,
          targetUserId: targetUser._id,
        },
        session
      );

      credentialsResult = {
        email: targetUser.email,
        temporaryPassword: tempPassword,
        name: targetUser.name,
      };
    });

    if (credentialsResult) {
      return {
        success: true,
        credentials: credentialsResult,
      };
    } else {
      return { success: false, error: "Failed to reset staff temporary password." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset staff temporary password.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}

/**
 * Server Action: Forced/Self Password Change.
 */
export async function changePasswordAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requireUser();

    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All fields are required." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    const isValidCurrent = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValidCurrent) {
      return { success: false, error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: "New password must be different from current password." };
    }

    const policyCheck = validateUserPassword(newPassword);
    if (!policyCheck.valid) {
      return { success: false, error: policyCheck.message };
    }

    const newHash = await hashPassword(newPassword);
    await updateUserPassword(dbUser._id!, newHash);

    await createAuditEntry({
      action: "PASSWORD_CHANGED",
      actorUserId: dbUser._id,
      targetUserId: dbUser._id,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update password.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action (ADMIN ONLY): Suspend or Reactivate a user account.
 */
export async function toggleUserStatusAction(
  targetUserId: string,
  newStatus: UserStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireAdmin();

    await updateUserStatus(targetUserId as unknown as import("mongodb").ObjectId, newStatus);

    await createAuditEntry({
      action: newStatus === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      actorUserId: dbUser._id,
      targetUserId: targetUserId as unknown as import("mongodb").ObjectId,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update user status.";
    return { success: false, error: msg };
  }
}

// ── Legacy Stub Actions for Backwards Compatibility ─────────────────────────

/**
 * @deprecated Legacy AccountRequest action (retained for backwards compatibility).
 */
export async function submitAccountRequestAction(
  _formData?: FormData
): Promise<{ success: boolean; error?: string }> {
  void _formData;
  return { success: false, error: "Public account requests have been replaced by direct Member registration." };
}

/**
 * @deprecated Legacy AccountRequest action (retained for backwards compatibility).
 */
export async function approveAccountRequestAction(
  _id?: string
): Promise<{ success: boolean; error?: string }> {
  void _id;
  return { success: false, error: "Account requests review has been replaced by Admin Partner creation." };
}

/**
 * @deprecated Legacy AccountRequest action (retained for backwards compatibility).
 */
export async function rejectAccountRequestAction(
  _id?: string,
  _reason?: string
): Promise<{ success: boolean; error?: string }> {
  void _id;
  void _reason;
  return { success: false, error: "Account requests review has been replaced by Admin Partner creation." };
}

/**
 * @deprecated Legacy AccountRequest action (retained for backwards compatibility).
 */
export async function createAccountFromRequestAction(
  _id?: string
): Promise<{
  success: boolean;
  credentials?: { email: string; temporaryPassword: string };
  error?: string;
}> {
  void _id;
  return { success: false, error: "Account requests review has been replaced by Admin Partner creation." };
}
