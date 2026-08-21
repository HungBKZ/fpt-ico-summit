/**
 * src/lib/db/repositories/users.ts
 *
 * Repository functions for managing User documents in MongoDB. Supports optional ClientSession.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import { normalizeEmail } from "@/lib/auth/password";
import type {
  User,
  UserRole,
  PartnerType,
  UserStatus,
  UserProfileMetadata,
} from "../models/user";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  partnerType?: PartnerType;
  organizationId?: ObjectId;
  profile?: UserProfileMetadata;
  status?: UserStatus;
  mustChangePassword?: boolean;
  createdBy?: ObjectId;
}

/**
 * Finds a user by email (case-insensitive via emailNormalized).
 */
export async function findUserByEmail(
  email: string,
  session?: ClientSession
): Promise<User | null> {
  const normalized = normalizeEmail(email);
  const db = await getDb();
  return db
    .collection<User>(COLLECTIONS.USERS)
    .findOne({ emailNormalized: normalized }, { session });
}

/**
 * Finds a user by ObjectId.
 */
export async function findUserById(
  id: string | ObjectId,
  session?: ClientSession
): Promise<User | null> {
  const db = await getDb();
  const objId = typeof id === "string" ? new ObjectId(id) : id;
  return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: objId }, { session });
}

/**
 * Creates a new User document. Omits undefined optional fields so MongoDB JSON Schema validation succeeds cleanly.
 */
export async function createUser(
  input: CreateUserInput,
  session?: ClientSession
): Promise<User> {
  const normalized = normalizeEmail(input.email);
  const db = await getDb();

  const existing = await db
    .collection<User>(COLLECTIONS.USERS)
    .findOne({ emailNormalized: normalized }, { session });

  if (existing) {
    throw new Error("User with this email already exists.");
  }

  const now = new Date();
  const doc: User = {
    email: input.email.trim(),
    emailNormalized: normalized,
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    role: input.role,
    status: input.status || "ACTIVE",
    mustChangePassword: input.mustChangePassword ?? true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  if (input.partnerType) doc.partnerType = input.partnerType;
  if (input.organizationId) doc.organizationId = input.organizationId;
  if (input.profile && Object.keys(input.profile).length > 0) doc.profile = input.profile;
  if (input.createdBy) doc.createdBy = input.createdBy;

  const result = await db
    .collection<User>(COLLECTIONS.USERS)
    .insertOne(doc, { session });

  return { ...doc, _id: result.insertedId };
}

/**
 * Increments failed login counter and applies 15-minute lock if 5 attempts reached.
 */
export async function recordFailedLogin(userId: ObjectId): Promise<void> {
  const db = await getDb();
  const user = await db
    .collection<User>(COLLECTIONS.USERS)
    .findOne({ _id: userId });

  if (!user) return;

  const newAttempts = (user.failedLoginAttempts || 0) + 1;
  const updates: Partial<User> = {
    failedLoginAttempts: newAttempts,
    updatedAt: new Date(),
  };

  if (newAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
  }

  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    { $set: updates }
  );
}

/**
 * Resets failed login attempts and updates lastLoginAt on successful authentication.
 */
export async function recordSuccessfulLogin(userId: ObjectId): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    {
      $set: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
        updatedAt: now,
      },
    }
  );
}

/**
 * Updates user password, sets mustChangePassword = false, and records passwordChangedAt.
 */
export async function updateUserPassword(
  userId: ObjectId,
  newPasswordHash: string,
  session?: ClientSession
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        passwordChangedAt: now,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Resets Partner user to a temporary password (mustChangePassword = true).
 */
export async function resetUserTemporaryPassword(
  userId: ObjectId,
  newPasswordHash: string,
  session?: ClientSession
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: newPasswordHash,
        mustChangePassword: true,
        passwordChangedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      },
    },
    { session }
  );
}

/**
 * Updates user profile metadata (memberType, phone, studentId, institution).
 */
export async function updateUserProfile(
  userId: ObjectId,
  profile: UserProfileMetadata,
  session?: ClientSession
): Promise<void> {
  const db = await getDb();
  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    {
      $set: {
        profile,
        updatedAt: new Date(),
      },
    },
    { session }
  );
}

/**
 * Updates user account status (ACTIVE, SUSPENDED, DISABLED).
 */
export async function updateUserStatus(
  userId: ObjectId,
  status: UserStatus,
  session?: ClientSession
): Promise<void> {
  const db = await getDb();
  await db.collection<User>(COLLECTIONS.USERS).updateOne(
    { _id: userId },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    { session }
  );
}

/**
 * Lists all users for administrative review.
 */
export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  return db
    .collection<User>(COLLECTIONS.USERS)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
}
