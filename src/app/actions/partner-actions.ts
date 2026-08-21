"use server";

import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/db/mongodb";
import { requireAdmin, requirePartner } from "@/lib/auth/authorization";
import {
  getOrganizationById,
  updateDraftProfile,
  submitProfileForReview,
  requestProfileChanges,
  publishOrganizationProfile,
} from "@/lib/db/repositories/organizations";
import { confirmActiveEditionParticipation } from "@/lib/db/repositories/organization-participations";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import type {
  OrganizationProfileSnapshot,
  OrganizationMediaAsset,
} from "@/lib/db/models/organization";

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
 * Server-side verification of Cloudinary media asset using Cloudinary Admin/Resource API.
 * Ensures resource belongs to expected organization namespace, is a valid image, format is allowed,
 * and bytes <= maxSizeBytes. Returns verified normalized media metadata.
 */
async function verifyCloudinaryMediaAsset(
  publicId: string,
  expectedFolderPrefix: string,
  maxSizeBytes: number
): Promise<OrganizationMediaAsset> {
  if (!publicId) {
    throw new Error("Missing publicId for Cloudinary asset verification.");
  }

  if (!publicId.startsWith(expectedFolderPrefix)) {
    throw new Error(`Invalid asset namespace. Asset must belong to folder: ${expectedFolderPrefix}`);
  }

  // Ensure Cloudinary credentials are set before querying API
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
      `Image size (${Math.round(resource.bytes / 1024)} KB) exceeds max limit of ${Math.round(
        maxSizeBytes / (1024 * 1024)
      )} MB.`
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
 * Server Action: PARTNER saves draft profile.
 */
export async function savePartnerDraftAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();

    if (!dbUser.organizationId) {
      return { success: false, error: "Partner account is not linked to an Organization." };
    }

    const orgIdStr = dbUser.organizationId.toString();
    const logoUrl = String(formData.get("logoUrl") || "").trim();
    const logoPublicId = String(formData.get("logoPublicId") || "").trim();

    const coverUrl = String(formData.get("coverUrl") || "").trim();
    const coverPublicId = String(formData.get("coverPublicId") || "").trim();

    const websiteUrl = String(formData.get("websiteUrl") || "").trim();

    if (logoUrl && !isValidPublicUrl(logoUrl)) {
      return { success: false, error: "Logo URL must be a valid http:// or https:// link." };
    }

    if (coverUrl && !isValidPublicUrl(coverUrl)) {
      return { success: false, error: "Cover Image URL must be a valid http:// or https:// link." };
    }

    if (websiteUrl && !isValidPublicUrl(websiteUrl)) {
      return { success: false, error: "Website URL must be a valid http:// or https:// link." };
    }

    // Verify Logo Media Asset if Cloudinary publicId provided
    let verifiedLogo: OrganizationMediaAsset | undefined = undefined;
    if (logoPublicId && logoPublicId.startsWith("fpt-ico-summit/organizations/")) {
      try {
        const logoFolderPrefix = `fpt-ico-summit/organizations/${orgIdStr}/logos`;
        verifiedLogo = await verifyCloudinaryMediaAsset(logoPublicId, logoFolderPrefix, 5 * 1024 * 1024);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Logo verification failed.";
        return { success: false, error: `Logo Verification Error: ${msg}` };
      }
    } else if (logoUrl) {
      verifiedLogo = {
        publicId: logoPublicId || logoUrl,
        secureUrl: logoUrl,
      };
    }

    // Verify Cover Media Asset if Cloudinary publicId provided
    let verifiedCover: OrganizationMediaAsset | undefined = undefined;
    if (coverPublicId && coverPublicId.startsWith("fpt-ico-summit/organizations/")) {
      try {
        const coverFolderPrefix = `fpt-ico-summit/organizations/${orgIdStr}/covers`;
        verifiedCover = await verifyCloudinaryMediaAsset(coverPublicId, coverFolderPrefix, 8 * 1024 * 1024);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Cover verification failed.";
        return { success: false, error: `Cover Image Verification Error: ${msg}` };
      }
    } else if (coverUrl) {
      verifiedCover = {
        publicId: coverPublicId || coverUrl,
        secureUrl: coverUrl,
      };
    }

    const publicContactEmail = String(formData.get("publicContactEmail") || "").trim();
    const publicContactPhone = String(formData.get("publicContactPhone") || "").trim();
    const publicContactAddress = String(formData.get("publicContactAddress") || "").trim();

    const shortDescriptionEn = String(formData.get("shortDescriptionEn") || "").trim();
    const descriptionEn = String(formData.get("descriptionEn") || "").trim();
    const shortDescriptionVi = String(formData.get("shortDescriptionVi") || "").trim();
    const descriptionVi = String(formData.get("descriptionVi") || "").trim();

    const draftProfile: OrganizationProfileSnapshot = {
      logo: verifiedLogo,
      coverImage: verifiedCover,
      logoUrl: verifiedLogo?.secureUrl || logoUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      publicContact: {
        email: publicContactEmail || undefined,
        phone: publicContactPhone || undefined,
        address: publicContactAddress || undefined,
      },
      content: {
        en: {
          shortDescription: shortDescriptionEn,
          description: descriptionEn || undefined,
        },
        vi: {
          shortDescription: shortDescriptionVi,
          description: descriptionVi || undefined,
        },
      },
    };

    const updatedOrg = await updateDraftProfile(dbUser.organizationId, draftProfile);

    if (!updatedOrg) {
      return { success: false, error: "Failed to update draft profile." };
    }

    await createAuditEntry({
      action: "ORG_PROFILE_DRAFT_SAVED",
      actorUserId: dbUser._id,
      organizationId: dbUser.organizationId,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save draft.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: PARTNER submits draft profile for review.
 */
export async function submitPartnerProfileAction(formData?: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();

    if (!dbUser.organizationId) {
      return { success: false, error: "Partner account is not linked to an Organization." };
    }

    // If form data is provided, save draft first
    if (formData) {
      const saveRes = await savePartnerDraftAction(formData);
      if (!saveRes.success) {
        return saveRes;
      }
    }

    const org = await getOrganizationById(dbUser.organizationId);
    if (!org || !org.draftProfile) {
      return { success: false, error: "Please save draft profile content before submitting." };
    }

    const { content } = org.draftProfile;
    if (!content?.en?.shortDescription || !content.en.shortDescription.trim()) {
      return {
        success: false,
        error: "English short description is required before submitting for review.",
      };
    }

    await submitProfileForReview(dbUser.organizationId);

    await createAuditEntry({
      action: "ORG_PROFILE_SUBMITTED",
      actorUserId: dbUser._id,
      organizationId: dbUser.organizationId,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit profile for review.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action (ADMIN ONLY): Request changes with required feedback.
 * Executes using MongoDB Convenient Transaction API (`session.withTransaction`).
 * Built-in retries for TransientTransactionError & UnknownTransactionCommitResult.
 */
export async function requestPartnerChangesAction(
  organizationIdStr: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  const { dbUser } = await requireAdmin();

  if (!organizationIdStr || !feedback.trim()) {
    return { success: false, error: "Organization ID and feedback text are required." };
  }

  const orgId = new ObjectId(organizationIdStr);
  const client = await getMongoClient();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Update status to CHANGES_REQUESTED and record review feedback
      await requestProfileChanges(orgId, dbUser._id!, feedback, session);

      // 2. Record audit log entry
      await createAuditEntry(
        {
          action: "ORG_PROFILE_CHANGES_REQUESTED",
          actorUserId: dbUser._id,
          organizationId: orgId,
          metadata: { feedback: feedback.trim() },
        },
        session
      );
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to request changes.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}

/**
 * Server Action (ADMIN ONLY): Approve & Publish Partner profile.
 * CONVENIENT TRANSACTION API (`session.withTransaction`):
 * Built-in automatic retry handling for TransientTransactionError and UnknownTransactionCommitResult.
 * Executes operations sequentially (no Promise.all / parallel calls).
 * 1. Verifies Admin & IN_REVIEW status
 * 2. Copies draftProfile to publishedProfile, sets isPublished = true, draftStatus = "NONE"
 * 3. Upserts OrganizationParticipation (CONFIRMED) for active SummitEdition
 * 4. Records ORG_PROFILE_PUBLISHED and ORG_PARTICIPATION_CONFIRMED audit events
 */
export async function approveAndPublishPartnerAction(
  organizationIdStr: string
): Promise<{ success: boolean; error?: string }> {
  const { dbUser } = await requireAdmin();

  if (!organizationIdStr) {
    return { success: false, error: "Organization ID is required." };
  }

  const orgId = new ObjectId(organizationIdStr);
  const client = await getMongoClient();
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Publish content snapshot
      await publishOrganizationProfile(orgId, dbUser._id!, session);

      // 2. Confirm active summit edition participation
      await confirmActiveEditionParticipation(orgId, session);

      // 3. Record audit log: ORG_PROFILE_PUBLISHED
      await createAuditEntry(
        {
          action: "ORG_PROFILE_PUBLISHED",
          actorUserId: dbUser._id,
          organizationId: orgId,
        },
        session
      );

      // 4. Record audit log: ORG_PARTICIPATION_CONFIRMED
      await createAuditEntry(
        {
          action: "ORG_PARTICIPATION_CONFIRMED",
          actorUserId: dbUser._id,
          organizationId: orgId,
        },
        session
      );
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve and publish.";
    return { success: false, error: msg };
  } finally {
    await session.endSession();
  }
}
