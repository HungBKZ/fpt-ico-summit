"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  createShowcaseEntry,
  getShowcaseEntryById,
  updateShowcaseEntry,
  deleteShowcaseEntry,
} from "@/lib/db/repositories/partner-showcase";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import type {
  ShowcaseRelationshipStatus,
  ShowcaseLogo,
} from "@/lib/db/models/partner-showcase";

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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
 * Server-side verification of uploaded Cloudinary showcase logo asset.
 * Enforces admin authorization, expected path prefix, image type, format, size, and dimensions.
 */
async function verifyCloudinaryShowcaseLogoAsset(
  publicId: string,
  showcaseEntryId: string
): Promise<ShowcaseLogo> {
  if (!publicId) {
    throw new Error("Missing publicId for showcase logo verification.");
  }

  const expectedPrefix = `fpt-ico-summit/showcase/logos/${showcaseEntryId}/`;
  if (!publicId.startsWith(expectedPrefix)) {
    throw new Error(`Invalid logo asset namespace. Expected folder prefix: ${expectedPrefix}`);
  }

  configureCloudinary();

  const resource = await cloudinary.api.resource(publicId);
  if (!resource || resource.resource_type !== "image") {
    throw new Error("Cloudinary resource is not a valid image.");
  }

  const allowedFormats = ["jpg", "jpeg", "png", "webp"];
  if (!allowedFormats.includes((resource.format || "").toLowerCase())) {
    throw new Error(`Unsupported logo format (${resource.format}). Accepted formats: JPG, PNG, WebP.`);
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (typeof resource.bytes === "number" && resource.bytes > maxSizeBytes) {
    throw new Error(`Logo file size (${Math.round(resource.bytes / 1024)} KB) exceeds max limit of 5 MB.`);
  }

  if (!resource.width || !resource.height || resource.width <= 0 || resource.height <= 0) {
    throw new Error("Invalid image dimensions returned by Cloudinary.");
  }

  return {
    publicId: resource.public_id,
    secureUrl: resource.secure_url,
    width: resource.width,
    height: resource.height,
  };
}

/**
 * Safely attempts Cloudinary asset deletion without blocking the primary flow if it fails.
 */
async function safeDestroyCloudinaryAsset(publicId?: string) {
  if (!publicId) return;
  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.warn("Could not delete Cloudinary asset:", publicId, err);
  }
}

export interface CreateShowcaseEntryActionInput {
  displayName: string;
  country?: string;
  websiteUrl?: string;
  relationshipStatus: ShowcaseRelationshipStatus;
  displayOrder?: number;
  displayConsentConfirmed?: boolean;
  isVisible?: boolean;
  organizationId?: string;
}

/**
 * Server Action: Creates a new Partner Showcase Entry.
 * Follows the two-step lifecycle:
 * An entry is created (defaulting to hidden if no logo exists yet).
 * Invariant: If isVisible is set to true, consent and a verified logo MUST be present.
 */
export async function createShowcaseEntryAction(
  input: CreateShowcaseEntryActionInput
): Promise<{
  success: boolean;
  showcaseEntryId?: string;
  error?: string;
}> {
  try {
    const { dbUser } = await requireAdmin();

    const displayName = input.displayName?.trim();
    if (!displayName) {
      return { success: false, error: "Institution / Organization Name is required." };
    }

    const validStatuses: ShowcaseRelationshipStatus[] = ["INVITED", "CONFIRMED", "NETWORK_PARTNER"];
    if (!validStatuses.includes(input.relationshipStatus)) {
      return { success: false, error: "Invalid relationship status." };
    }

    if (input.websiteUrl && !isValidPublicUrl(input.websiteUrl)) {
      return { success: false, error: "Official Website must be a valid HTTP or HTTPS URL." };
    }

    const isVisible = Boolean(input.isVisible);
    const displayConsentConfirmed = Boolean(input.displayConsentConfirmed);

    // Strict visibility invariant check
    if (isVisible) {
      if (!displayConsentConfirmed) {
        return {
          success: false,
          error: "Public display consent must be confirmed before making an entry visible.",
        };
      }
      return {
        success: false,
        error: "A verified logo must be uploaded before making an entry visible on the homepage.",
      };
    }

    let organizationId: ObjectId | undefined;
    if (input.organizationId !== undefined && input.organizationId !== null) {
      const trimmedOrg = typeof input.organizationId === "string" ? input.organizationId.trim() : "";
      if (trimmedOrg && trimmedOrg.toLowerCase() !== "none") {
        if (ObjectId.isValid(trimmedOrg)) {
          organizationId = new ObjectId(trimmedOrg);
        } else {
          return { success: false, error: "Invalid organization ID." };
        }
      }
    }

    const entry = await createShowcaseEntry({
      displayName,
      country: input.country?.trim() || undefined,
      websiteUrl: input.websiteUrl?.trim() || undefined,
      relationshipStatus: input.relationshipStatus,
      displayOrder: Number(input.displayOrder) || 0,
      isVisible: false,
      displayConsentConfirmed,
      organizationId,
      createdBy: dbUser._id!,
    });

    await createAuditEntry({
      action: "SHOWCASE_ENTRY_CREATED",
      actorUserId: dbUser._id,
      showcaseEntryId: entry._id,
      metadata: {
        displayName: entry.displayName,
        relationshipStatus: entry.relationshipStatus,
        isVisible: false,
      },
    });

    revalidatePath("/[locale]/admin/showcase", "page");
    revalidatePath("/[locale]", "page");

    return {
      success: true,
      showcaseEntryId: entry._id?.toString(),
    };
  } catch (err: unknown) {
    const errDetails =
      (err as { errInfo?: { details?: unknown } })?.errInfo?.details ??
      (err as { errInfo?: unknown })?.errInfo;
    if (errDetails) {
      console.error(
        "[createShowcaseEntryAction] Validation failure details:\n" +
          JSON.stringify(errDetails, null, 2)
      );
    }
    const msg =
      err instanceof Error
        ? err.message.includes("Document failed validation")
          ? "Document failed validation. Please verify all fields are valid."
          : err.message
        : "Failed to create showcase entry.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Uploads & verifies a logo asset, attaching it to an existing showcase entry.
 */
export async function attachShowcaseLogoAction(
  showcaseEntryId: string,
  publicId: string
): Promise<{
  success: boolean;
  logo?: ShowcaseLogo;
  error?: string;
}> {
  try {
    const { dbUser } = await requireAdmin();

    if (!showcaseEntryId || !ObjectId.isValid(showcaseEntryId)) {
      return { success: false, error: "Invalid showcase entry ID." };
    }

    const entry = await getShowcaseEntryById(showcaseEntryId);
    if (!entry) {
      return { success: false, error: "Showcase entry not found." };
    }

    const verifiedLogo = await verifyCloudinaryShowcaseLogoAsset(publicId, showcaseEntryId);

    // If an older logo existed and is being replaced, clean it up from Cloudinary
    if (entry.logo?.publicId && entry.logo.publicId !== verifiedLogo.publicId) {
      await safeDestroyCloudinaryAsset(entry.logo.publicId);
    }

    await updateShowcaseEntry(showcaseEntryId, {
      logo: verifiedLogo,
    });

    await createAuditEntry({
      action: "SHOWCASE_LOGO_UPDATED",
      actorUserId: dbUser._id,
      showcaseEntryId: entry._id,
      metadata: {
        publicId: verifiedLogo.publicId,
        secureUrl: verifiedLogo.secureUrl,
      },
    });

    revalidatePath("/[locale]/admin/showcase", "page");
    revalidatePath("/[locale]", "page");

    return {
      success: true,
      logo: verifiedLogo,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to attach showcase logo.";
    return { success: false, error: msg };
  }
}

export interface UpdateShowcaseEntryActionInput {
  displayName?: string;
  country?: string;
  websiteUrl?: string;
  relationshipStatus?: ShowcaseRelationshipStatus;
  displayOrder?: number;
  displayConsentConfirmed?: boolean;
  isVisible?: boolean;
  organizationId?: string | null;
}

/**
 * Server Action: Updates an existing Showcase Entry metadata, consent, and visibility.
 */
export async function updateShowcaseEntryAction(
  showcaseEntryId: string,
  input: UpdateShowcaseEntryActionInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requireAdmin();

    if (!showcaseEntryId || !ObjectId.isValid(showcaseEntryId)) {
      return { success: false, error: "Invalid showcase entry ID." };
    }

    const existing = await getShowcaseEntryById(showcaseEntryId);
    if (!existing) {
      return { success: false, error: "Showcase entry not found." };
    }

    if (input.displayName !== undefined && !input.displayName.trim()) {
      return { success: false, error: "Institution / Organization Name cannot be empty." };
    }

    if (input.relationshipStatus !== undefined) {
      const validStatuses: ShowcaseRelationshipStatus[] = ["INVITED", "CONFIRMED", "NETWORK_PARTNER"];
      if (!validStatuses.includes(input.relationshipStatus)) {
        return { success: false, error: "Invalid relationship status." };
      }
    }

    // Normalize country: empty / whitespace -> $unset (null), otherwise trimmed string
    let normalizedCountry: string | null | undefined;
    if (input.country !== undefined) {
      if (input.country === null || !input.country.trim()) {
        normalizedCountry = null;
      } else {
        normalizedCountry = input.country.trim();
      }
    }

    // Normalize websiteUrl: empty / whitespace -> $unset (null), otherwise validated URL
    let normalizedWebsiteUrl: string | null | undefined;
    if (input.websiteUrl !== undefined) {
      if (input.websiteUrl === null || !input.websiteUrl.trim()) {
        normalizedWebsiteUrl = null;
      } else {
        const trimmedUrl = input.websiteUrl.trim();
        if (!isValidPublicUrl(trimmedUrl)) {
          return { success: false, error: "Official Website must be a valid HTTP or HTTPS URL." };
        }
        normalizedWebsiteUrl = trimmedUrl;
      }
    }

    const targetVisibility = input.isVisible !== undefined ? input.isVisible : existing.isVisible;
    const targetConsent =
      input.displayConsentConfirmed !== undefined
        ? input.displayConsentConfirmed
        : existing.displayConsentConfirmed;

    // Strict visibility invariant check
    if (targetVisibility) {
      if (!targetConsent) {
        return {
          success: false,
          error: "Public display consent must be confirmed before making an entry visible on the website.",
        };
      }
      if (!existing.logo?.publicId || !existing.logo?.secureUrl) {
        return {
          success: false,
          error: "A valid verified logo is required before making an entry visible on the homepage.",
        };
      }
    }

    // Normalize organizationId:
    // empty / whitespace / "None" (case-insensitive) -> $unset (null)
    // valid ObjectId string -> ObjectId
    // invalid non-empty value -> reject safely
    // undefined -> do not modify
    let organizationId: ObjectId | null | undefined;
    if (input.organizationId !== undefined) {
      if (
        input.organizationId === null ||
        input.organizationId === "" ||
        (typeof input.organizationId === "string" &&
          (!input.organizationId.trim() ||
            input.organizationId.trim().toLowerCase() === "none"))
      ) {
        organizationId = null;
      } else if (
        typeof input.organizationId === "string" &&
        ObjectId.isValid(input.organizationId.trim())
      ) {
        organizationId = new ObjectId(input.organizationId.trim());
      } else {
        return { success: false, error: "Invalid organization ID." };
      }
    }

    // Safe diagnostic log excluding any secrets
    const safePayload = {
      showcaseEntryId,
      displayName: input.displayName?.trim(),
      country: normalizedCountry,
      websiteUrl: normalizedWebsiteUrl,
      relationshipStatus: input.relationshipStatus,
      displayOrder: input.displayOrder !== undefined ? Number(input.displayOrder) : undefined,
      displayConsentConfirmed: input.displayConsentConfirmed,
      isVisible: input.isVisible,
      organizationId: organizationId ? organizationId.toString() : organizationId,
    };
    console.log(
      "[updateShowcaseEntryAction] Safe normalized update payload:\n" +
        JSON.stringify(safePayload, null, 2)
    );

    await updateShowcaseEntry(showcaseEntryId, {
      displayName: input.displayName?.trim(),
      country: normalizedCountry,
      websiteUrl: normalizedWebsiteUrl,
      relationshipStatus: input.relationshipStatus,
      displayOrder: input.displayOrder !== undefined ? Number(input.displayOrder) : undefined,
      displayConsentConfirmed: input.displayConsentConfirmed,
      isVisible: input.isVisible,
      organizationId,
    });

    await createAuditEntry({
      action: "SHOWCASE_ENTRY_UPDATED",
      actorUserId: dbUser._id,
      showcaseEntryId: existing._id,
      metadata: {
        updatedFields: Object.keys(input),
      },
    });

    revalidatePath("/[locale]/admin/showcase", "page");
    revalidatePath("/[locale]", "page");

    return { success: true };
  } catch (err: unknown) {
    const errDetails =
      (err as { errInfo?: { details?: unknown } })?.errInfo?.details ??
      (err as { errInfo?: unknown })?.errInfo;
    if (errDetails) {
      console.error(
        "[updateShowcaseEntryAction] Validation failure details:\n" +
          JSON.stringify(errDetails, null, 2)
      );
    }
    const msg =
      err instanceof Error
        ? err.message.includes("Document failed validation")
          ? "Document failed validation. Please verify all fields are valid."
          : err.message
        : "Failed to update showcase entry.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Toggles visibility for a showcase entry.
 */
export async function toggleShowcaseVisibilityAction(
  showcaseEntryId: string,
  isVisible: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { dbUser } = await requireAdmin();

    if (!showcaseEntryId || !ObjectId.isValid(showcaseEntryId)) {
      return { success: false, error: "Invalid showcase entry ID." };
    }

    const existing = await getShowcaseEntryById(showcaseEntryId);
    if (!existing) {
      return { success: false, error: "Showcase entry not found." };
    }

    if (isVisible) {
      if (!existing.displayConsentConfirmed) {
        return {
          success: false,
          error: "Public display consent must be confirmed before making an entry visible.",
        };
      }
      if (!existing.logo?.publicId || !existing.logo?.secureUrl) {
        return {
          success: false,
          error: "A valid verified logo must be attached before making an entry visible.",
        };
      }
    }

    await updateShowcaseEntry(showcaseEntryId, { isVisible });

    await createAuditEntry({
      action: "SHOWCASE_ENTRY_VISIBILITY_CHANGED",
      actorUserId: dbUser._id,
      showcaseEntryId: existing._id,
      metadata: {
        displayName: existing.displayName,
        isVisible,
      },
    });

    revalidatePath("/[locale]/admin/showcase", "page");
    revalidatePath("/[locale]", "page");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update visibility.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Deletes a showcase entry and cleans up Cloudinary logo asset.
 */
export async function deleteShowcaseEntryAction(
  showcaseEntryId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();

    if (!showcaseEntryId || !ObjectId.isValid(showcaseEntryId)) {
      return { success: false, error: "Invalid showcase entry ID." };
    }

    const existing = await getShowcaseEntryById(showcaseEntryId);
    if (!existing) {
      return { success: false, error: "Showcase entry not found." };
    }

    // Safely delete Cloudinary logo asset
    if (existing.logo?.publicId) {
      await safeDestroyCloudinaryAsset(existing.logo.publicId);
    }

    await deleteShowcaseEntry(showcaseEntryId);

    revalidatePath("/[locale]/admin/showcase", "page");
    revalidatePath("/[locale]", "page");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete showcase entry.";
    return { success: false, error: msg };
  }
}
