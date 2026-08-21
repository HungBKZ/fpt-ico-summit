"use server";

import { v2 as cloudinary } from "cloudinary";
import { requirePartner } from "@/lib/auth/authorization";
import { getOrganizationById } from "@/lib/db/repositories/organizations";

export interface CloudinaryUploadAuthorization {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadPreset: string;
  allowedFormats: string;
  maxFileSize: number;
}

/**
 * Server Action: Generates a secure, short-lived Cloudinary upload signature.
 * Strictly checks that caller is an authenticated PARTNER with a verified organizationId.
 * Supports signed enforcement for "logo" (max 5 MB), "cover" (max 8 MB), and "banner" (max 8 MB).
 */
export async function getCloudinaryUploadSignatureAction(
  assetType: "logo" | "cover" | "banner" | "activity_cover" = "logo",
  targetId?: string
): Promise<{
  success: boolean;
  authorization?: CloudinaryUploadAuthorization;
  error?: string;
}> {
  try {
    const { dbUser } = await requirePartner();

    if (!dbUser.organizationId) {
      return { success: false, error: "No organization associated with this partner account." };
    }

    const org = await getOrganizationById(dbUser.organizationId);
    if (!org || !org._id) {
      return { success: false, error: "Organization not found." };
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) are missing on the server environment.",
      };
    }

    let folder = `fpt-ico-summit/organizations/${org._id.toString()}/logos`;
    let uploadPreset = process.env.CLOUDINARY_LOGO_PRESET || "fpt_ico_partner_logo";
    let maxFileSize = 5 * 1024 * 1024;

    if (assetType === "cover") {
      folder = `fpt-ico-summit/organizations/${org._id.toString()}/covers`;
      uploadPreset = process.env.CLOUDINARY_COVER_PRESET || "fpt_ico_partner_cover";
      maxFileSize = 8 * 1024 * 1024;
    } else if (assetType === "banner") {
      if (!targetId) {
        return { success: false, error: "Scholarship ID is required for banner upload authorization." };
      }
      folder = `fpt-ico-summit/organizations/${org._id.toString()}/scholarships/${targetId}/banners`;
      uploadPreset = process.env.CLOUDINARY_SCHOLARSHIP_PRESET || "fpt_ico_scholarship_banner";
      maxFileSize = 8 * 1024 * 1024;
    } else if (assetType === "activity_cover") {
      if (!targetId) {
        return { success: false, error: "Activity ID is required for activity image upload authorization." };
      }
      const presetName = process.env.CLOUDINARY_ACTIVITY_IMAGE_PRESET || "fpt_ico_activity_image";
      if (!presetName || presetName === "ml_default") {
        return {
          success: false,
          error: "Cloudinary upload preset CLOUDINARY_ACTIVITY_IMAGE_PRESET=fpt_ico_activity_image is missing on server environment.",
        };
      }
      folder = `fpt-ico-summit/organizations/${org._id.toString()}/activities/${targetId}/images`;
      uploadPreset = presetName;
      maxFileSize = 8 * 1024 * 1024;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const allowedFormats = "jpg,jpeg,png,webp";

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
      upload_preset: uploadPreset,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return {
      success: true,
      authorization: {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
        uploadPreset,
        allowedFormats,
        maxFileSize,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate upload signature.";
    return { success: false, error: msg };
  }
}
