"use server";

import { ObjectId } from "mongodb";
import { requirePartner, requireAdmin } from "@/lib/auth/authorization";
import { getMongoClient } from "@/lib/db/mongodb";
import {
  createScholarship,
  getScholarshipById,
  updateScholarshipDraft,
  submitScholarshipForReview,
  requestScholarshipChanges,
  approveAndPublishScholarship,
} from "@/lib/db/repositories/scholarships";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import { parseInputDateToUtc } from "@/lib/utils/date-helpers";
import { sanitizeHtml } from "@/lib/utils/sanitizer";
import type {
  ScholarshipSnapshot,
  ScholarshipType,
} from "@/lib/db/models/scholarship";
import type { OrganizationMediaAsset } from "@/lib/db/models/organization";
import { v2 as cloudinary } from "cloudinary";

function isValidPublicUrl(urlStr: string): boolean {
  if (!urlStr) return true;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Server-side verification of Cloudinary banner asset using Cloudinary Admin/Resource API.
 */
async function verifyCloudinaryBannerAsset(
  publicId: string,
  expectedFolderPrefix: string,
  maxSizeBytes: number = 8 * 1024 * 1024
): Promise<OrganizationMediaAsset> {
  if (!publicId) {
    throw new Error("Missing publicId for banner verification.");
  }

  if (!publicId.startsWith(expectedFolderPrefix)) {
    throw new Error(`Invalid banner asset namespace. Expected folder: ${expectedFolderPrefix}`);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const resource = await cloudinary.api.resource(publicId);
  if (!resource || resource.resource_type !== "image") {
    throw new Error("Cloudinary resource is not a valid image.");
  }

  const allowedFormats = ["jpg", "jpeg", "png", "webp"];
  if (!allowedFormats.includes((resource.format || "").toLowerCase())) {
    throw new Error(`Unsupported image format (${resource.format}). Accepted: JPG, PNG, WebP.`);
  }

  if (typeof resource.bytes === "number" && resource.bytes > maxSizeBytes) {
    throw new Error(
      `Banner size (${Math.round(resource.bytes / 1024)} KB) exceeds max limit of 8 MB.`
    );
  }

  if (!resource.width || !resource.height || resource.width <= 0 || resource.height <= 0) {
    throw new Error("Invalid image dimensions.");
  }

  return {
    publicId: resource.public_id,
    secureUrl: resource.secure_url,
    assetId: resource.asset_id,
    width: resource.width,
    height: resource.height,
    format: resource.format,
    bytes: resource.bytes,
  };
}

/**
 * Server Action: PARTNER initializes a new draft Scholarship.
 * Returns the created scholarship ID for initial routing to the editor.
 */
export async function createScholarshipAction(): Promise<{
  success: boolean;
  scholarshipId?: string;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "Partner account is not linked to an Organization." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    let createdId: ObjectId | null = null;

    try {
      await session.withTransaction(async () => {
        const initialSnapshot: ScholarshipSnapshot = {
          type: "SHORT_TERM",
          title: { en: "New Scholarship Opportunity", vi: "Cơ hội học bổng mới" },
          shortDescription: { en: "", vi: "" },
          officialUrl: "",
        };

        const created = await createScholarship(
          {
            organizationId: dbUser.organizationId!,
            createdBy: dbUser._id!,
            draftSnapshot: initialSnapshot,
          },
          session
        );

        createdId = created._id || null;

        await createAuditEntry(
          {
            action: "SCHOLARSHIP_CREATED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { scholarshipId: createdId ? createdId.toString() : undefined },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    if (!createdId) {
      return { success: false, error: "Failed to create scholarship DRAFT record." };
    }

    const finalId: ObjectId = createdId;
    return { success: true, scholarshipId: finalId.toString() };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create scholarship.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: PARTNER saves draft updates to an existing Scholarship.
 */
export async function saveScholarshipDraftAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "Partner account is not linked to an Organization." };
    }

    const scholarshipIdStr = String(formData.get("scholarshipId") || "").trim();
    if (!scholarshipIdStr) {
      return { success: false, error: "Missing scholarshipId." };
    }

    const scholarshipId = new ObjectId(scholarshipIdStr);
    const existing = await getScholarshipById(scholarshipId);

    if (!existing || !existing.organizationId.equals(dbUser.organizationId)) {
      return { success: false, error: "Scholarship not found or unauthorized access." };
    }

    if (existing.draftStatus === "IN_REVIEW") {
      return { success: false, error: "Cannot edit scholarship while under review." };
    }

    const type = (String(formData.get("type") || "SHORT_TERM").trim() as ScholarshipType);
    const titleEn = String(formData.get("titleEn") || "").trim();
    const titleVi = String(formData.get("titleVi") || "").trim();
    const shortDescEn = String(formData.get("shortDescriptionEn") || "").trim();
    const shortDescVi = String(formData.get("shortDescriptionVi") || "").trim();
    const fullDescEn = String(formData.get("fullDescriptionEn") || "").trim();
    const fullDescVi = String(formData.get("fullDescriptionVi") || "").trim();
    const officialUrl = String(formData.get("officialUrl") || "").trim();
    const applicationDeadlineStr = String(formData.get("applicationDeadline") || "").trim();
    const fundingEn = String(formData.get("fundingSummaryEn") || "").trim();
    const fundingVi = String(formData.get("fundingSummaryVi") || "").trim();
    const eligibilityEn = String(formData.get("eligibilityEn") || "").trim();
    const eligibilityVi = String(formData.get("eligibilityVi") || "").trim();

    const bannerUrl = String(formData.get("bannerUrl") || "").trim();
    const bannerPublicId = String(formData.get("bannerPublicId") || "").trim();

    if (officialUrl && !isValidPublicUrl(officialUrl)) {
      return { success: false, error: "Official Link must be a valid http:// or https:// URL." };
    }

    // Verify Cloudinary Banner Asset if publicId provided
    let verifiedBanner: OrganizationMediaAsset | undefined = undefined;
    if (bannerPublicId && bannerPublicId.startsWith("fpt-ico-summit/organizations/")) {
      try {
        const expectedFolder = `fpt-ico-summit/organizations/${dbUser.organizationId.toString()}/scholarships/${scholarshipIdStr}/banners`;
        verifiedBanner = await verifyCloudinaryBannerAsset(bannerPublicId, expectedFolder, 8 * 1024 * 1024);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Banner verification failed.";
        return { success: false, error: `Banner Verification Error: ${msg}` };
      }
    } else if (bannerUrl) {
      verifiedBanner = {
        publicId: bannerPublicId || bannerUrl,
        secureUrl: bannerUrl,
      };
    }

    const applicationDeadline = parseInputDateToUtc(applicationDeadlineStr);

    const fullDescEnClean = sanitizeHtml(fullDescEn);
    const fullDescViClean = sanitizeHtml(fullDescVi);
    const fundingEnClean = sanitizeHtml(fundingEn);
    const fundingViClean = sanitizeHtml(fundingVi);
    const eligibilityEnClean = sanitizeHtml(eligibilityEn);
    const eligibilityViClean = sanitizeHtml(eligibilityVi);

    const updatedSnapshot: ScholarshipSnapshot = {
      type,
      title: { en: titleEn, vi: titleVi },
      shortDescription: { en: shortDescEn, vi: shortDescVi },
      officialUrl,
      applicationDeadline,
      banner: verifiedBanner,
    };

    if (fullDescEnClean || fullDescViClean) {
      updatedSnapshot.fullDescription = { en: fullDescEnClean, vi: fullDescViClean };
    }
    if (fundingEnClean || fundingViClean) {
      updatedSnapshot.fundingSummary = { en: fundingEnClean, vi: fundingViClean };
    }
    if (eligibilityEnClean || eligibilityViClean) {
      updatedSnapshot.eligibility = { en: eligibilityEnClean, vi: eligibilityViClean };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await updateScholarshipDraft(scholarshipId, updatedSnapshot, session);

        await createAuditEntry(
          {
            action: "SCHOLARSHIP_DRAFT_SAVED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { scholarshipId: scholarshipIdStr },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save scholarship draft.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: PARTNER submits Scholarship draft for Admin review.
 * Business Rule: English content is REQUIRED. Vietnamese content is OPTIONAL.
 */
export async function submitScholarshipForReviewAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();
    if (!dbUser.organizationId) {
      return { success: false, error: "Partner account is not linked to an Organization." };
    }

    const scholarshipIdStr = String(formData.get("scholarshipId") || "").trim();
    if (!scholarshipIdStr) {
      return { success: false, error: "Missing scholarshipId." };
    }

    const scholarshipId = new ObjectId(scholarshipIdStr);

    // Save current form inputs first
    const saveRes = await saveScholarshipDraftAction(formData);
    if (!saveRes.success) {
      return saveRes;
    }

    const scholarship = await getScholarshipById(scholarshipId);
    if (!scholarship || !scholarship.organizationId.equals(dbUser.organizationId)) {
      return { success: false, error: "Scholarship not found or unauthorized access." };
    }

    const snap = scholarship.draftSnapshot;
    if (!snap) {
      return { success: false, error: "Draft snapshot is missing." };
    }

    // Mandatory submission fields: English Title, English Short Description, Official Link
    if (!snap.title?.en || !snap.title.en.trim()) {
      return { success: false, error: "English Scholarship Title is required for submission." };
    }

    if (!snap.shortDescription?.en || !snap.shortDescription.en.trim()) {
      return { success: false, error: "English Short Description is required for submission." };
    }

    if (!snap.officialUrl || !isValidPublicUrl(snap.officialUrl)) {
      return { success: false, error: "A valid Official Link URL (http:// or https://) is required for submission." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await submitScholarshipForReview(scholarshipId, dbUser._id!, session);

        await createAuditEntry(
          {
            action: "SCHOLARSHIP_SUBMITTED",
            actorUserId: dbUser._id,
            organizationId: dbUser.organizationId,
            metadata: { scholarshipId: scholarshipIdStr },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit scholarship.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: ADMIN requests changes on a submitted Scholarship.
 */
export async function requestScholarshipChangesAction(
  scholarshipIdStr: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireAdmin();

    if (!feedback || !feedback.trim()) {
      return { success: false, error: "Feedback explanation is required when requesting changes." };
    }

    const scholarshipId = new ObjectId(scholarshipIdStr);
    const scholarship = await getScholarshipById(scholarshipId);

    if (!scholarship || scholarship.draftStatus !== "IN_REVIEW") {
      return { success: false, error: "Scholarship is not currently pending review." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await requestScholarshipChanges(scholarshipId, dbUser._id!, feedback.trim(), session);

        await createAuditEntry(
          {
            action: "SCHOLARSHIP_CHANGES_REQUESTED",
            actorUserId: dbUser._id,
            organizationId: scholarship.organizationId,
            metadata: { scholarshipId: scholarshipIdStr, feedback: feedback.trim() },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to request changes.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: ADMIN approves & publishes a submitted Scholarship.
 */
export async function approveAndPublishScholarshipAction(
  scholarshipIdStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { dbUser } = await requireAdmin();

    const scholarshipId = new ObjectId(scholarshipIdStr);
    const scholarship = await getScholarshipById(scholarshipId);

    if (!scholarship || scholarship.draftStatus !== "IN_REVIEW") {
      return { success: false, error: "Scholarship is not currently pending review." };
    }

    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const published = await approveAndPublishScholarship(scholarshipId, dbUser._id!, session);
        if (!published) {
          throw new Error("Publishing operation failed.");
        }

        await createAuditEntry(
          {
            action: "SCHOLARSHIP_PUBLISHED",
            actorUserId: dbUser._id,
            organizationId: scholarship.organizationId,
            metadata: { scholarshipId: scholarshipIdStr },
          },
          session
        );
      });
    } finally {
      await session.endSession();
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve and publish scholarship.";
    return { success: false, error: msg };
  }
}
