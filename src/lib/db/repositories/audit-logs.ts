/**
 * src/lib/db/repositories/audit-logs.ts
 *
 * Repository functions for recording system audit logs. Supports optional ClientSession for transactions.
 */

import { ObjectId, ClientSession } from "mongodb";
import { getDb } from "../mongodb";
import { COLLECTIONS } from "../collections";
import type { AuditLog, AuditAction } from "../models/audit-log";

export interface CreateAuditLogInput {
  action: AuditAction;
  actorUserId?: ObjectId;
  targetUserId?: ObjectId;
  accountRequestId?: ObjectId;
  organizationId?: ObjectId;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes metadata to ensure no sensitive credentials or hashes are logged.
 */
function sanitizeMetadata(
  metadata?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("hash") ||
      lowerKey.includes("credential") ||
      lowerKey.includes("uri")
    ) {
      continue; // Omit sensitive keys entirely
    }
    sanitized[key] = val;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Creates an AuditLog document. Supports optional session for transaction atomicity.
 * Conditionally appends optional fields so undefined keys are omitted from BSON serialization.
 */
export async function createAuditEntry(
  input: CreateAuditLogInput,
  session?: ClientSession
): Promise<AuditLog> {
  const db = await getDb();

  const doc: AuditLog = {
    action: input.action,
    createdAt: new Date(),
  };

  if (input.actorUserId) doc.actorUserId = input.actorUserId;
  if (input.targetUserId) doc.targetUserId = input.targetUserId;
  if (input.accountRequestId) doc.accountRequestId = input.accountRequestId;
  if (input.organizationId) doc.organizationId = input.organizationId;

  const sanitizedMeta = sanitizeMetadata(input.metadata);
  if (sanitizedMeta && Object.keys(sanitizedMeta).length > 0) {
    doc.metadata = sanitizedMeta;
  }

  const result = await db
    .collection<AuditLog>(COLLECTIONS.AUDIT_LOGS)
    .insertOne(doc, { session });

  return { ...doc, _id: result.insertedId };
}
