"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Organization } from "@/lib/db/models/organization";
import {
  savePartnerDraftAction,
  submitPartnerProfileAction,
} from "@/app/actions/partner-actions";
import { getCloudinaryUploadSignatureAction } from "@/app/actions/upload-actions";

interface OrganizationEditorFormProps {
  organization: Organization;
  locale: Locale;
  dict: Dictionary;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function OrganizationEditorForm({
  organization,
  locale,
  dict,
}: OrganizationEditorFormProps) {
  const cms = dict.partnerCms;
  const draft = organization.draftProfile || organization.publishedProfile;

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logo state initialization
  const [logoUrl, setLogoUrl] = useState<string>(draft?.logoUrl || draft?.logo?.secureUrl || "");
  const [logoPublicId, setLogoPublicId] = useState<string>(draft?.logo?.publicId || "");

  // Cover Image state initialization
  const [coverUrl, setCoverUrl] = useState<string>(draft?.coverImage?.secureUrl || "");
  const [coverPublicId, setCoverPublicId] = useState<string>(draft?.coverImage?.publicId || "");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const isInReview = organization.draftStatus === "IN_REVIEW";

  // Calculate profile completion out of 6 sections
  const completionSections = [
    { key: "identity", isComplete: true },
    { key: "logo", isComplete: Boolean(logoUrl) },
    { key: "cover", isComplete: Boolean(coverUrl) },
    { key: "website", isComplete: Boolean(draft?.websiteUrl) },
    { key: "contact", isComplete: Boolean(draft?.publicContact?.email || draft?.publicContact?.phone) },
    { key: "content", isComplete: Boolean(draft?.content?.en?.shortDescription && draft?.content?.vi?.shortDescription) },
  ];
  const completedCount = completionSections.filter((s) => s.isComplete).length;
  const completionPercent = Math.round((completedCount / 6) * 100);

  // Render localized single status pill
  const renderStatusPill = () => {
    if (organization.draftStatus === "CHANGES_REQUESTED") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
          {cms.statusChangesRequested}
        </span>
      );
    }
    if (organization.draftStatus === "IN_REVIEW") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
          {cms.statusInReview}
        </span>
      );
    }
    if (organization.isPublished && organization.draftStatus === "NONE") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
          {cms.statusPublished}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
        {cms.statusDraft}
      </span>
    );
  };

  // Secure Cloudinary Signed File Upload
  const handleFileUpload = async (file: File) => {
    setMessage(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMessage({ type: "error", text: cms.uploadErrorSize });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setMessage({ type: "error", text: cms.uploadErrorType });
      return;
    }

    setUploadingLogo(true);

    try {
      // Step 1: Request signed upload authorization from server
      const authRes = await getCloudinaryUploadSignatureAction();
      if (!authRes.success || !authRes.authorization) {
        setUploadingLogo(false);
        setMessage({ type: "error", text: authRes.error || "Failed to authorize upload." });
        return;
      }

      const { cloudName, apiKey, timestamp, folder, signature, uploadPreset } = authRes.authorization;

      // Step 2: Upload directly from client browser to Cloudinary signed endpoint
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("folder", folder);
      if (uploadPreset) uploadData.append("upload_preset", uploadPreset);
      uploadData.append("signature", signature);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await cloudinaryRes.json();
      setUploadingLogo(false);

      if (cloudinaryRes.ok && result.secure_url) {
        setLogoUrl(result.secure_url);
        setLogoPublicId(result.public_id || result.secure_url);
        setMessage({ type: "success", text: "Logo uploaded successfully. Save draft to persist." });
      } else {
        setMessage({
          type: "error",
          text: result.error?.message || "Cloudinary logo upload failed.",
        });
      }
    } catch {
      setUploadingLogo(false);
      setMessage({ type: "error", text: "An error occurred during logo upload." });
    }
  };

  const handleCoverUpload = async (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: cms.uploadCoverErrorType });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: "error", text: cms.uploadCoverErrorSize });
      return;
    }

    setUploadingCover(true);
    setMessage(null);

    try {
      const sigRes = await getCloudinaryUploadSignatureAction("cover");
      if (!sigRes.success || !sigRes.authorization) {
        setUploadingCover(false);
        setMessage({ type: "error", text: sigRes.error || "Failed to authorize cover upload." });
        return;
      }

      const { cloudName, apiKey, timestamp, folder, signature, uploadPreset } = sigRes.authorization;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("folder", folder);
      if (uploadPreset) uploadData.append("upload_preset", uploadPreset);
      uploadData.append("signature", signature);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await cloudinaryRes.json();
      setUploadingCover(false);

      if (cloudinaryRes.ok && result.secure_url) {
        setCoverUrl(result.secure_url);
        setCoverPublicId(result.public_id || result.secure_url);
        setMessage({ type: "success", text: "Cover image uploaded successfully. Save draft to persist." });
      } else {
        setMessage({
          type: "error",
          text: result.error?.message || "Cloudinary cover upload failed.",
        });
      }
    } catch {
      setUploadingCover(false);
      setMessage({ type: "error", text: "An error occurred during cover upload." });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isInReview || uploadingLogo || uploadingCover) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoUrl);
    formData.set("logoPublicId", logoPublicId);
    formData.set("coverUrl", coverUrl);
    formData.set("coverPublicId", coverPublicId);

    const res = await savePartnerDraftAction(formData);
    setSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: "Draft saved successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save draft." });
    }
  };

  const handleSubmitForReview = async (formEl: HTMLFormElement) => {
    setMessage(null);
    setSubmitting(true);

    const formData = new FormData(formEl);
    formData.set("logoUrl", logoUrl);
    formData.set("logoPublicId", logoPublicId);
    formData.set("coverUrl", coverUrl);
    formData.set("coverPublicId", coverPublicId);

    const res = await submitPartnerProfileAction(formData);
    setSubmitting(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: "Profile submitted for review successfully.",
      });
      window.location.reload();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to submit profile." });
    }
  };

  return (
    <form onSubmit={handleSaveDraft} className="space-y-8">
      {/* Hidden inputs for logo & cover media state */}
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="logoPublicId" value={logoPublicId} />
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="coverPublicId" value={coverPublicId} />
      {/* Top Title & Single Localized Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          {/* Breadcrumbs & Back link */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href={`/${locale}/dashboard`} className="hover:text-blue-600 transition">
              {locale === "vi" ? "Tổng quan" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              {locale === "vi" ? "Hồ sơ Đơn vị" : "Organization Profile"}
            </span>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            ← {locale === "vi" ? "Quay lại Tổng quan" : "Back to Dashboard"}
          </Link>
          <h2 className="text-xl font-bold text-[var(--color-navy)] pt-1">{cms.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{cms.subtitle}</p>
        </div>

        <div>{renderStatusPill()}</div>
      </div>

      {/* Profile Completion Guidance Panel */}
      <div className="p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl border border-blue-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-navy)] text-white flex items-center justify-center font-bold text-xs">
              {completionPercent}%
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">{cms.profileGuideTitle}</h3>
              <p className="text-[11px] text-slate-600 font-medium">
                {completedCount}/6 {cms.profileCompletionText}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition flex items-center gap-1"
          >
            <span>{guideOpen ? "Thu gọn" : "Chi tiết"}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transform transition-transform ${guideOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-blue-200/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-navy)] transition-all duration-300 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {guideOpen && (
          <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-blue-100">
            {cms.profileGuideSubtitle}
          </p>
        )}
      </div>

      {/* Feedback Banner if CHANGES_REQUESTED */}
      {organization.draftStatus === "CHANGES_REQUESTED" && organization.review?.feedback && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-1">
          <p className="font-bold">{cms.changesRequestedBanner}</p>
          <p className="whitespace-pre-wrap text-rose-700 leading-relaxed">{organization.review.feedback}</p>
        </div>
      )}

      {/* In Review Banner */}
      {isInReview && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
          <p className="font-bold">{cms.inReviewNotice}</p>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Hidden input for logoUrl form submission */}
      <input type="hidden" name="logoUrl" value={logoUrl} />

      {/* Official Identity Section (Read-Only) */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Official Identity (Read-Only)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Category</span>
            <span className="font-semibold text-slate-900">{organization.type}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Organization Name</span>
            <span className="font-semibold text-slate-900">{organization.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Country / Jurisdiction</span>
            <span className="font-semibold text-slate-900">{organization.country}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
          {cms.identityNotice}
        </p>
      </div>

      {/* Media & Links Section with Direct Drag-and-Drop Image Upload */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          Media & Links
        </h3>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            {cms.uploadLogoLabel}
          </label>
          <p className="text-[11px] text-slate-500 leading-relaxed">{cms.uploadLogoHelp}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={isInReview || uploadingLogo}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {logoUrl ? (
            /* Uploaded Image Preview Box */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 p-1">
                  <Image
                    src={logoUrl}
                    alt={`${organization.name} logo`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Draft Logo Active</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{logoUrl}</p>
                </div>
              </div>

              {!isInReview && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 bg-white text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
                  >
                    {cms.uploadReplaceBtn}
                  </button>
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => setLogoUrl("")}
                    className="py-1.5 px-3 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg hover:bg-rose-100 transition"
                  >
                    {cms.uploadRemoveBtn}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (!isInReview && !uploadingLogo) fileInputRef.current?.click();
              }}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50"
              } ${isInReview || uploadingLogo ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {uploadingLogo ? cms.uploadingMsg : cms.uploadChooseBtn}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Drag and drop PNG, JPG, or WebP (max 5 MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Showcase Cover Image Upload Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            {cms.uploadCoverLabel}
          </label>
          <p className="text-[11px] text-slate-500 leading-relaxed">{cms.uploadCoverHelp}</p>

          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={isInReview || uploadingCover}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCoverUpload(e.target.files[0]);
              }
            }}
          />

          {coverUrl ? (
            /* Uploaded Cover Image Preview Box */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="aspect-video max-w-md w-full relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
                <Image
                  src={coverUrl}
                  alt={`${organization.name} showcase cover`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{coverUrl}</p>

                {!isInReview && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="py-1.5 px-3 bg-white text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
                    >
                      {cms.uploadCoverReplaceBtn}
                    </button>
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => setCoverUrl("")}
                      className="py-1.5 px-3 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg hover:bg-rose-100 transition"
                    >
                      {cms.uploadCoverRemoveBtn}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cover Image Select Zone */
            <div
              onClick={() => {
                if (!isInReview && !uploadingCover) coverFileInputRef.current?.click();
              }}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 ${
                isInReview || uploadingCover ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {uploadingCover ? "Uploading cover..." : cms.uploadCoverChooseBtn}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  16:9 landscape image recommended (max 8 MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cms.websiteUrlLabel}
          </label>
            <input
              type="url"
              name="websiteUrl"
              disabled={isInReview}
              defaultValue={draft?.websiteUrl || ""}
              placeholder="https://example.com"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>

      {/* Public Contact Information */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-sm font-bold text-[var(--color-navy)]">
            Public Contact Information
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{cms.contactHelp}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {cms.publicEmailLabel}
            </label>
            <input
              type="email"
              name="publicContactEmail"
              disabled={isInReview}
              defaultValue={draft?.publicContact?.email || ""}
              placeholder="contact@university.edu"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {cms.publicPhoneLabel}
            </label>
            <input
              type="text"
              name="publicContactPhone"
              disabled={isInReview}
              defaultValue={draft?.publicContact?.phone || ""}
              placeholder="+84 292 3730 688"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {cms.publicAddressLabel}
            </label>
            <input
              type="text"
              name="publicContactAddress"
              disabled={isInReview}
              defaultValue={draft?.publicContact?.address || ""}
              placeholder="Bangkok, Thailand"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* English Content */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          English Content (EN)
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cms.shortDescEnLabel}
          </label>
          <p className="text-[11px] text-slate-500 mb-1.5">{cms.shortDescHelp}</p>
          <textarea
            name="shortDescriptionEn"
            rows={3}
            disabled={isInReview}
            required
            defaultValue={draft?.content?.en?.shortDescription || ""}
            placeholder="A leading technological university located in Bangkok..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cms.descEnLabel}
          </label>
          <p className="text-[11px] text-slate-500 mb-1.5">{cms.fullDescHelp}</p>
          <textarea
            name="descriptionEn"
            rows={5}
            disabled={isInReview}
            defaultValue={draft?.content?.en?.description || ""}
            placeholder="Comprehensive university details, faculties, and international exchange programs..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>
      </div>

      {/* Vietnamese Content */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          Vietnamese Content (VI)
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cms.shortDescViLabel}
          </label>
          <p className="text-[11px] text-slate-500 mb-1.5">{cms.shortDescHelp}</p>
          <textarea
            name="shortDescriptionVi"
            rows={3}
            disabled={isInReview}
            required
            defaultValue={draft?.content?.vi?.shortDescription || ""}
            placeholder="Trường đại học công nghệ hàng đầu tọa lạc tại Bangkok..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {cms.descViLabel}
          </label>
          <p className="text-[11px] text-slate-500 mb-1.5">{cms.fullDescHelp}</p>
          <textarea
            name="descriptionVi"
            rows={5}
            disabled={isInReview}
            defaultValue={draft?.content?.vi?.description || ""}
            placeholder="Thông tin tổng quan về các khoa đào tạo và chương trình hợp tác quốc tế..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>
      </div>

      {/* Action Controls */}
      {!isInReview && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving || submitting || uploadingLogo}
            className="py-2.5 px-5 bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl hover:bg-slate-200 transition disabled:opacity-50"
          >
            {saving ? cms.saving : cms.saveDraftBtn}
          </button>

          <button
            type="button"
            disabled={saving || submitting || uploadingLogo}
            onClick={(e) => {
              const form = (e.target as HTMLElement).closest("form");
              if (form) handleSubmitForReview(form);
            }}
            className="py-2.5 px-5 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
          >
            {submitting ? cms.submitting : cms.submitReviewBtn}
          </button>
        </div>
      )}
    </form>
  );
}
