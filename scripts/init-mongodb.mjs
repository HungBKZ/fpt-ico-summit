import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv(envLocalPath);
loadEnv(envPath);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "fpt_ico_summit";

if (!uri) {
  console.error("Missing MONGODB_URI in environment.");
  process.exit(1);
}

async function initCollection(db, collectionName, validator) {
  const collections = await db.listCollections({ name: collectionName }).toArray();

  if (collections.length === 0) {
    console.log(`Creating collection '${collectionName}' with JSON Schema validator...`);
    return await db.createCollection(collectionName, { validator });
  } else {
    console.log(`Updating JSON Schema validator for collection '${collectionName}'...`);
    await db.command({
      collMod: collectionName,
      validator,
    });
    return db.collection(collectionName);
  }
}

function isOptionEquivalent(val1, val2) {
  if (val1 === val2) return true;
  if (!val1 && !val2) return true;
  return JSON.stringify(val1) === JSON.stringify(val2);
}

function areKeysEquivalent(k1, k2) {
  if (!k1 || !k2) return false;
  const entries1 = Object.entries(k1);
  const entries2 = Object.entries(k2);
  if (entries1.length !== entries2.length) return false;
  for (let i = 0; i < entries1.length; i++) {
    if (entries1[i][0] !== entries2[i][0] || entries1[i][1] !== entries2[i][1]) {
      return false;
    }
  }
  return true;
}

/**
 * Initialization-only helper to ensure an index exists safely and idempotently.
 * Compares key specifications and integrity options without requiring identical index names.
 */
async function ensureIndex(collection, keys, options = {}) {
  const existingIndexes = await collection.listIndexes().toArray();
  const keysStr = JSON.stringify(keys);

  // 1. Check if an index with matching key specification already exists
  const matchingKeyIndex = existingIndexes.find((idx) =>
    areKeysEquivalent(idx.key, keys)
  );

  if (matchingKeyIndex) {
    const uniqueMatch = isOptionEquivalent(!!options.unique, !!matchingKeyIndex.unique);
    const partialMatch = isOptionEquivalent(
      options.partialFilterExpression,
      matchingKeyIndex.partialFilterExpression
    );
    const sparseMatch = isOptionEquivalent(!!options.sparse, !!matchingKeyIndex.sparse);
    const expireMatch = isOptionEquivalent(
      options.expireAfterSeconds,
      matchingKeyIndex.expireAfterSeconds
    );
    const collationMatch = isOptionEquivalent(
      options.collation,
      matchingKeyIndex.collation
    );

    if (uniqueMatch && partialMatch && sparseMatch && expireMatch && collationMatch) {
      console.log(
        `Equivalent index on ${collection.collectionName} ${keysStr} already exists as '${matchingKeyIndex.name}'. Skipping creation.`
      );
      return;
    } else {
      throw new Error(
        `Index conflict on collection '${collection.collectionName}': ` +
          `An index on ${keysStr} exists as '${matchingKeyIndex.name}', but option requirements differ. ` +
          `Existing: unique=${matchingKeyIndex.unique}, partial=${JSON.stringify(matchingKeyIndex.partialFilterExpression)}. ` +
          `Requested: unique=${options.unique}, partial=${JSON.stringify(options.partialFilterExpression)}.`
      );
    }
  }

  // 2. Check if an index with the requested name exists under a different key spec
  if (options.name) {
    const matchingNameIndex = existingIndexes.find((idx) => idx.name === options.name);
    if (matchingNameIndex) {
      throw new Error(
        `Index name conflict on collection '${collection.collectionName}': ` +
          `Index name '${options.name}' already exists with keys ${JSON.stringify(matchingNameIndex.key)}, ` +
          `but requested keys are ${keysStr}.`
      );
    }
  }

  console.log(`Creating index on collection '${collection.collectionName}':`, keysStr, options.name || "");
  await collection.createIndex(keys, options);
}

async function run() {
  const client = new MongoClient(uri);

  try {
    console.log(`Connecting to MongoDB Atlas (database: '${dbName}')...`);
    await client.connect();
    const db = client.db(dbName);

    // ── 1. summitEditions ───────────────────────────────────────────────────
    const summitEditionsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["year", "slug", "name", "startDate", "endDate", "timezone", "status", "createdAt", "updatedAt"],
        properties: {
          year: { bsonType: "int", minimum: 1000, maximum: 9999 },
          slug: { bsonType: "string", minLength: 1 },
          name: { bsonType: "string", minLength: 1 },
          startDate: { bsonType: "date" },
          endDate: { bsonType: "date" },
          timezone: { bsonType: "string", minLength: 1 },
          status: { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const editionsCol = await initCollection(db, "summitEditions", summitEditionsVal);
    await ensureIndex(editionsCol, { year: 1 }, { unique: true, name: "uniq_year" });
    await ensureIndex(editionsCol, { slug: 1 }, { unique: true, name: "uniq_slug" });
    await ensureIndex(editionsCol, { status: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE" }, name: "uniq_active_status" });

    // Seed 2026 edition
    const existing2026 = await editionsCol.findOne({ year: 2026 });
    if (!existing2026) {
      console.log("Seeding FPT ICO Summit 2026 edition...");
      const now = new Date();
      await editionsCol.insertOne({
        year: 2026,
        slug: "2026",
        name: "FPT ICO Summit 2026",
        startDate: new Date("2026-11-20T00:00:00.000Z"),
        endDate: new Date("2026-11-22T23:59:59.999Z"),
        timezone: "Asia/Ho_Chi_Minh",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
    }

    // ── 2. users ────────────────────────────────────────────────────────────
    const usersVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "emailNormalized", "name", "passwordHash", "role", "status", "mustChangePassword", "failedLoginAttempts", "createdAt", "updatedAt"],
        properties: {
          email: { bsonType: "string", minLength: 1 },
          emailNormalized: { bsonType: "string", minLength: 1 },
          name: { bsonType: "string", minLength: 1 },
          passwordHash: { bsonType: "string", minLength: 1 },
          role: { enum: ["ADMIN", "SUMMIT_STAFF", "PARTNER", "MEMBER"] },
          partnerType: { enum: ["UNIVERSITY", "CONSULATE"] },
          organizationId: { bsonType: ["objectId", "null"] },
          profile: {
            bsonType: ["object", "null"],
            properties: {
              memberType: { enum: ["FPT_CANTHO_STUDENT", "EXTERNAL_PARTICIPANT"] },
              phone: { bsonType: "string" },
              studentId: { bsonType: "string" },
              studentIdNormalized: { bsonType: "string" },
              institution: { bsonType: "string" },
              schoolOrUniversity: { bsonType: "string" },
              position: { bsonType: "string" },
            },
          },
          status: { enum: ["ACTIVE", "SUSPENDED", "DISABLED"] },
          mustChangePassword: { bsonType: "bool" },
          failedLoginAttempts: { bsonType: "int", minimum: 0 },
          lockedUntil: { bsonType: ["date", "null"] },
          lastLoginAt: { bsonType: ["date", "null"] },
          passwordChangedAt: { bsonType: ["date", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
          createdBy: { bsonType: ["objectId", "null"] },
        },
      },
    };
    const usersCol = await initCollection(db, "users", usersVal);
    await ensureIndex(usersCol, { emailNormalized: 1 }, { unique: true, name: "uniq_email_normalized" });
    await ensureIndex(usersCol, { role: 1 }, { name: "idx_user_role" });
    await ensureIndex(usersCol, { organizationId: 1 }, { name: "idx_user_org", sparse: true });

    // Check for existing duplicate Student IDs among FPT_CANTHO_STUDENT members before creating partial unique index
    const dupStudents = await usersCol.aggregate([
      {
        $match: {
          role: "MEMBER",
          "profile.memberType": "FPT_CANTHO_STUDENT",
          "profile.studentIdNormalized": { $type: "string", $ne: "" },
        },
      },
      {
        $group: {
          _id: "$profile.studentIdNormalized",
          count: { $sum: 1 },
          userEmails: { $push: "$email" },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (dupStudents.length > 0) {
      console.warn("⚠️ CONFLICT WARNING: Duplicate Student IDs found among FPT_CANTHO_STUDENT members:");
      for (const dup of dupStudents) {
        console.warn(`  - Student ID '${dup._id}': claimed by ${dup.count} accounts (${dup.userEmails.join(", ")})`);
      }
      console.warn("Please resolve duplicate Student IDs manually before creating the unique index.");
    } else {
      await ensureIndex(
        usersCol,
        { "profile.studentIdNormalized": 1 },
        {
          name: "uniq_member_student_id",
          unique: true,
          partialFilterExpression: {
            role: "MEMBER",
            "profile.memberType": "FPT_CANTHO_STUDENT",
            "profile.studentIdNormalized": { $type: "string" },
          },
        }
      );
    }

    // ── 3. accountRequests (Deprecated) ─────────────────────────────────────
    const accountReqVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["type", "email", "emailNormalized", "name", "country", "status", "createdAt", "updatedAt"],
        properties: {
          type: { enum: ["UNIVERSITY", "CONSULATE", "MEMBER"] },
          organizationName: { bsonType: "string" },
          name: { bsonType: "string", minLength: 1 },
          position: { bsonType: "string" },
          email: { bsonType: "string", minLength: 1 },
          emailNormalized: { bsonType: "string", minLength: 1 },
          phone: { bsonType: "string" },
          schoolOrUniversity: { bsonType: "string" },
          studentId: { bsonType: "string" },
          country: { bsonType: "string", minLength: 1 },
          note: { bsonType: "string" },
          status: { enum: ["PENDING", "APPROVED", "REJECTED", "ACCOUNT_CREATED"] },
          reviewedBy: { bsonType: ["objectId", "null"] },
          reviewedAt: { bsonType: ["date", "null"] },
          createdUserId: { bsonType: ["objectId", "null"] },
          rejectionReason: { bsonType: "string" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const accountReqCol = await initCollection(db, "accountRequests", accountReqVal);
    await ensureIndex(accountReqCol, { status: 1, createdAt: -1 }, { name: "idx_req_status_created" });
    await ensureIndex(accountReqCol, { emailNormalized: 1 }, { name: "idx_req_email_normalized" });

    // ── 4. organizations ────────────────────────────────────────────────────
    const orgsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["type", "name", "nameNormalized", "country", "countryNormalized", "status", "createdAt", "updatedAt"],
        properties: {
          type: { enum: ["UNIVERSITY", "CONSULATE"] },
          name: { bsonType: "string", minLength: 1 },
          nameNormalized: { bsonType: "string", minLength: 1 },
          country: { bsonType: "string", minLength: 1 },
          countryNormalized: { bsonType: "string", minLength: 1 },
          status: { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] },
          isPublished: { bsonType: "bool" },
          draftStatus: { enum: ["NONE", "DRAFT", "IN_REVIEW", "CHANGES_REQUESTED"] },
          draftProfile: { bsonType: ["object", "null"] },
          publishedProfile: { bsonType: ["object", "null"] },
          review: { bsonType: ["object", "null"] },
          publishedAt: { bsonType: ["date", "null"] },
          publishedBy: { bsonType: ["objectId", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const orgsCol = await initCollection(db, "organizations", orgsVal);
    await ensureIndex(orgsCol, { type: 1, nameNormalized: 1, countryNormalized: 1 }, { unique: true, name: "uniq_org_type_name_country" });
    await ensureIndex(orgsCol, { isPublished: 1 }, { name: "idx_org_published" });
    await ensureIndex(orgsCol, { draftStatus: 1 }, { name: "idx_org_draft_status" });

    // Legacy Organization migration
    console.log("Migrating legacy organizations to explicit dual publication/draft state...");
    await orgsCol.updateMany(
      { isPublished: { $exists: false } },
      { $set: { isPublished: false, draftStatus: "DRAFT" } }
    );

    // ── 5. organizationParticipations ───────────────────────────────────────
    const orgPartVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["organizationId", "editionId", "status", "createdAt", "updatedAt"],
        properties: {
          organizationId: { bsonType: "objectId" },
          editionId: { bsonType: "objectId" },
          status: { enum: ["INVITED", "CONFIRMED", "WITHDRAWN"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const orgPartCol = await initCollection(db, "organizationParticipations", orgPartVal);
    await ensureIndex(orgPartCol, { organizationId: 1, editionId: 1 }, { unique: true, name: "uniq_org_edition_participation" });
    await ensureIndex(orgPartCol, { editionId: 1, status: 1 }, { name: "idx_edition_status" });

    // ── 6. auditLogs ────────────────────────────────────────────────────────
    const auditLogsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["action", "createdAt"],
        properties: {
          action: {
            enum: [
              "ORG_PROFILE_DRAFT_SAVED",
              "ORG_PROFILE_SUBMITTED",
              "ORG_PROFILE_CHANGES_REQUESTED",
              "ORG_PROFILE_PUBLISHED",
              "ORG_PARTICIPATION_CONFIRMED",
              "MEMBER_REGISTERED",
              "PARTNER_ACCOUNT_CREATED",
              "PARTNER_TEMP_PASSWORD_RESET",
              "ACCOUNT_REQUEST_SUBMITTED",
              "ACCOUNT_REQUEST_APPROVED",
              "ACCOUNT_REQUEST_REJECTED",
              "USER_CREATED",
              "USER_SUSPENDED",
              "USER_REACTIVATED",
              "PASSWORD_CHANGED",
              "SCHOLARSHIP_CREATED",
              "SCHOLARSHIP_DRAFT_SAVED",
              "SCHOLARSHIP_SUBMITTED",
              "SCHOLARSHIP_CHANGES_REQUESTED",
              "SCHOLARSHIP_PUBLISHED",
              "SUMMIT_STAFF_ACCOUNT_CREATED",
              "SUMMIT_STAFF_TEMP_PASSWORD_RESET",
              "SUMMIT_REGISTRATION_CREATED",
              "SUMMIT_REGISTRATION_CANCELLED",
              "SUMMIT_ACTIVITY_CREATED",
              "SUMMIT_ACTIVITY_DRAFT_SAVED",
              "SUMMIT_ACTIVITY_SUBMITTED",
              "SUMMIT_ACTIVITY_CHANGES_REQUESTED",
              "SUMMIT_ACTIVITY_CONTENT_APPROVED",
              "SUMMIT_PARTICIPANT_CHECKED_IN",
              "SUMMIT_BOOTH_ASSIGNED",
              "SUMMIT_BOOTH_UPDATED",
              "SUMMIT_BOOTH_PUBLISHED",
              "SUMMIT_ACTIVITY_SCHEDULE_SAVED",
              "SUMMIT_ACTIVITY_SCHEDULE_PUBLISHED",
              "SUMMIT_ACTIVITY_SELECTED",
              "SUMMIT_ACTIVITY_UNSELECTED",
              "SUMMIT_ACTIVITY_ATTENDANCE_MARKED",
              "SUMMIT_ACTIVITY_ATTENDANCE_REMOVED",
              "SUMMIT_REPORT_EXPORTED",
            ],
          },
          actorUserId: { bsonType: "objectId" },
          targetUserId: { bsonType: "objectId" },
          accountRequestId: { bsonType: "objectId" },
          organizationId: { bsonType: "objectId" },
          metadata: { bsonType: "object" },
          createdAt: { bsonType: "date" },
        },
      },
    };
    const auditCol = await initCollection(db, "auditLogs", auditLogsVal);
    await ensureIndex(auditCol, { createdAt: -1 }, { name: "idx_audit_created" });
    await ensureIndex(auditCol, { actorUserId: 1 }, { name: "idx_audit_actor", sparse: true });

    // ── 7. scholarships ─────────────────────────────────────────────────────
    const scholarshipsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "organizationId",
          "createdBy",
          "isPublished",
          "draftStatus",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          organizationId: { bsonType: "objectId" },
          createdBy: { bsonType: "objectId" },
          isPublished: { bsonType: "bool" },
          draftStatus: {
            enum: ["NONE", "DRAFT", "IN_REVIEW", "CHANGES_REQUESTED"],
          },
          draftSnapshot: { bsonType: ["object", "null"] },
          publishedSnapshot: { bsonType: ["object", "null"] },
          review: { bsonType: ["object", "null"] },
          publishedAt: { bsonType: ["date", "null"] },
          publishedBy: { bsonType: ["objectId", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const scholarshipsCol = await initCollection(db, "scholarships", scholarshipsVal);
    await ensureIndex(scholarshipsCol, { organizationId: 1 }, { name: "idx_scholarship_org" });
    await ensureIndex(scholarshipsCol, { draftStatus: 1, updatedAt: -1 }, { name: "idx_scholarship_status_updated" });
    await ensureIndex(scholarshipsCol, { isPublished: 1 }, { name: "idx_scholarship_published" });
    await ensureIndex(scholarshipsCol, { "publishedSnapshot.type": 1 }, { name: "idx_scholarship_published_type" });
    await ensureIndex(scholarshipsCol, { "publishedSnapshot.applicationDeadline": 1 }, { name: "idx_scholarship_published_deadline" });

    // ── 8. summitRegistrations ──────────────────────────────────────────────
    const registrationsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "editionId",
          "userId",
          "participantType",
          "attendeeSnapshot",
          "status",
          "registeredAt",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          editionId: { bsonType: "objectId" },
          userId: { bsonType: "objectId" },
          participantType: { enum: ["FPT_STUDENT", "EXTERNAL_PARTICIPANT"] },
          attendeeSnapshot: {
            bsonType: "object",
            required: ["fullName", "phone", "email"],
            properties: {
              fullName: { bsonType: "string", minLength: 1 },
              phone: { bsonType: "string", minLength: 1 },
              studentId: { bsonType: ["string", "null"] },
              email: { bsonType: "string", minLength: 1 },
            },
          },
          status: { enum: ["REGISTERED", "CANCELLED"] },
          registeredAt: { bsonType: "date" },
          cancelledAt: { bsonType: ["date", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const registrationsCol = await initCollection(db, "summitRegistrations", registrationsVal);
    await ensureIndex(registrationsCol, { editionId: 1, userId: 1 }, { unique: true, name: "uniq_registration_edition_user" });
    await ensureIndex(registrationsCol, { editionId: 1, status: 1 }, { name: "idx_registration_edition_status" });
    await ensureIndex(registrationsCol, { editionId: 1, participantType: 1 }, { name: "idx_registration_edition_type" });

    // ── 9. summitActivities ─────────────────────────────────────────────────
    const activitiesCollRaw = db.collection("summitActivities");
    const legacyDocs = await activitiesCollRaw.find({ contentStatus: { $exists: true } }).toArray();

    if (legacyDocs.length > 0) {
      console.log(`Migrating ${legacyDocs.length} legacy summitActivities documents to dual approval state...`);
      for (const doc of legacyDocs) {
        let isContentApproved = false;
        let draftStatus = "DRAFT";
        let approvedSnapshot = doc.approvedSnapshot;

        if (doc.contentStatus === "DRAFT") {
          isContentApproved = false;
          draftStatus = "DRAFT";
        } else if (doc.contentStatus === "IN_REVIEW") {
          isContentApproved = false;
          draftStatus = "IN_REVIEW";
        } else if (doc.contentStatus === "CHANGES_REQUESTED") {
          isContentApproved = false;
          draftStatus = "CHANGES_REQUESTED";
        } else if (doc.contentStatus === "APPROVED") {
          isContentApproved = true;
          draftStatus = "NONE";
          if (!approvedSnapshot && doc.draftSnapshot) {
            approvedSnapshot = doc.draftSnapshot;
          }
        }

        await activitiesCollRaw.updateOne(
          { _id: doc._id },
          {
            $set: {
              isContentApproved,
              draftStatus,
              ...(approvedSnapshot ? { approvedSnapshot } : {}),
            },
            $unset: { contentStatus: "" },
          }
        );
      }
      console.log("Legacy summitActivities migration complete.");
    }

    const summitActivitiesVal = {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "editionId",
          "organizationId",
          "createdBy",
          "type",
          "isContentApproved",
          "draftStatus",
          "draftSnapshot",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          editionId: { bsonType: "objectId" },
          organizationId: { bsonType: "objectId" },
          createdBy: { bsonType: "objectId" },
          type: { enum: ["WORKSHOP", "STAGE_PERFORMANCE"] },
          isContentApproved: { bsonType: "bool" },
          draftStatus: { enum: ["NONE", "DRAFT", "IN_REVIEW", "CHANGES_REQUESTED"] },
          draftSnapshot: { bsonType: "object" },
          approvedSnapshot: { bsonType: ["object", "null"] },
          review: { bsonType: ["object", "null"] },
          dataPermissionConfirmed: { bsonType: ["bool", "null"] },
          dataPermissionConfirmedAt: { bsonType: ["date", "null"] },
          dataPermissionConfirmedBy: { bsonType: ["objectId", "null"] },
          approvedAt: { bsonType: ["date", "null"] },
          approvedBy: { bsonType: ["objectId", "null"] },
          scheduleDraft: { bsonType: ["object", "null"] },
          publishedSchedule: { bsonType: ["object", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const activitiesCol = await initCollection(db, "summitActivities", summitActivitiesVal);
    await ensureIndex(activitiesCol, { editionId: 1, organizationId: 1 }, { name: "idx_activity_edition_org" });
    await ensureIndex(activitiesCol, { editionId: 1, type: 1 }, { name: "idx_activity_edition_type" });
    await ensureIndex(activitiesCol, { editionId: 1, isContentApproved: 1, draftStatus: 1 }, { name: "idx_activity_edition_approval_draft" });
    await ensureIndex(activitiesCol, { organizationId: 1, updatedAt: -1 }, { name: "idx_activity_org_updated" });

    // ── 10. summitCheckIns (Phase 5C) ───────────────────────────────────────
    const checkInsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["editionId", "registrationId", "dayKey", "checkedInAt", "checkedInBy", "method", "createdAt"],
        properties: {
          editionId: { bsonType: "objectId" },
          registrationId: { bsonType: "objectId" },
          dayKey: { bsonType: "string", minLength: 10, maxLength: 10 },
          checkedInAt: { bsonType: "date" },
          checkedInBy: { bsonType: "objectId" },
          method: { enum: ["MANUAL", "QR"] },
          createdAt: { bsonType: "date" },
        },
      },
    };
    const checkInsCol = await initCollection(db, "summitCheckIns", checkInsVal);
    await ensureIndex(checkInsCol, { registrationId: 1, dayKey: 1 }, { unique: true, name: "uniq_registration_day" });
    await ensureIndex(checkInsCol, { editionId: 1, dayKey: 1 }, { name: "idx_checkin_edition_day" });
    await ensureIndex(checkInsCol, { editionId: 1, checkedInAt: -1 }, { name: "idx_checkin_edition_time" });

    // ── 11. summitBoothAssignments (Phase 5C) ──────────────────────────────
    const boothAssignmentsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["editionId", "organizationId", "isPublished", "createdAt", "updatedAt"],
        properties: {
          editionId: { bsonType: "objectId" },
          organizationId: { bsonType: "objectId" },
          draftAssignment: { bsonType: ["object", "null"] },
          publishedAssignment: { bsonType: ["object", "null"] },
          isPublished: { bsonType: "bool" },
          assignedBy: { bsonType: ["objectId", "null"] },
          assignedAt: { bsonType: ["date", "null"] },
          publishedAt: { bsonType: ["date", "null"] },
          publishedBy: { bsonType: ["objectId", "null"] },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    };
    const boothCol = await initCollection(db, "summitBoothAssignments", boothAssignmentsVal);
    await ensureIndex(boothCol, { editionId: 1, organizationId: 1 }, { unique: true, name: "uniq_booth_edition_org" });
    await ensureIndex(boothCol, { editionId: 1, isPublished: 1 }, { name: "idx_booth_edition_published" });

    // ── 12. summitActivitySelections (Phase 5D) ───────────────────────────
    const selectionsVal = {
      $jsonSchema: {
        bsonType: "object",
        required: ["editionId", "registrationId", "activityId", "selectedAt", "createdAt"],
        properties: {
          editionId: { bsonType: "objectId" },
          registrationId: { bsonType: "objectId" },
          activityId: { bsonType: "objectId" },
          selectedAt: { bsonType: "date" },
          createdAt: { bsonType: "date" },
        },
      },
    };
    const selectionsCol = await initCollection(db, "summitActivitySelections", selectionsVal);
    await ensureIndex(selectionsCol, { registrationId: 1, activityId: 1 }, { unique: true, name: "uniq_registration_activity_selection" });
    await ensureIndex(selectionsCol, { editionId: 1, activityId: 1 }, { name: "idx_selection_edition_activity" });
    await ensureIndex(selectionsCol, { registrationId: 1, selectedAt: -1 }, { name: "idx_selection_registration_time" });

    // ── 13. summitActivityAttendances (Phase 5E) ───────────────────────────
    const attendanceVal = {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "editionId",
          "activityId",
          "registrationId",
          "activityDayKey",
          "source",
          "status",
          "attendedAt",
          "markedBy",
          "createdAt",
        ],
        properties: {
          editionId: { bsonType: "objectId" },
          activityId: { bsonType: "objectId" },
          registrationId: { bsonType: "objectId" },
          activityDayKey: { bsonType: "string" },
          source: { enum: ["SELECTED", "WALK_IN"] },
          status: { enum: ["PRESENT"] },
          attendedAt: { bsonType: "date" },
          markedBy: { bsonType: "objectId" },
          createdAt: { bsonType: "date" },
        },
      },
    };
    const attendanceCol = await initCollection(db, "summitActivityAttendances", attendanceVal);
    await ensureIndex(attendanceCol, { registrationId: 1, activityId: 1 }, { unique: true, name: "uniq_registration_activity_attendance" });
    await ensureIndex(attendanceCol, { editionId: 1, activityId: 1 }, { name: "idx_attendance_edition_activity" });
    await ensureIndex(attendanceCol, { activityId: 1, attendedAt: -1 }, { name: "idx_attendance_activity_time" });
    await ensureIndex(attendanceCol, { activityId: 1, source: 1 }, { name: "idx_attendance_activity_source" });

    console.log("MongoDB Phase 5E initialization completed successfully.");
  } catch (err) {
    console.error("MongoDB initialization failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
