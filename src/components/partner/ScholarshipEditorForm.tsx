"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Scholarship } from "@/lib/db/models/scholarship";
import { formatDateForInput } from "@/lib/utils/date-helpers";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  saveScholarshipDraftAction,
  submitScholarshipForReviewAction,
} from "@/app/actions/scholarship-actions";
import { getCloudinaryUploadSignatureAction } from "@/app/actions/upload-actions";

interface ScholarshipEditorFormProps {
  scholarship: Scholarship;
  locale: Locale;
  dict: Dictionary;
}

export function ScholarshipEditorForm({
  scholarship,
  locale,
  dict,
}: ScholarshipEditorFormProps) {
  const t = dict.partnerScholarships;
  const cms = dict.partnerCms;
  const isVi = locale === "vi";

  const draft = scholarship.draftSnapshot || scholarship.publishedSnapshot;
  const scholarshipIdStr = scholarship._id!.toString();

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Banner state initialization
  const [bannerUrl, setBannerUrl] = useState<string>(draft?.banner?.secureUrl || "");
  const [bannerPublicId, setBannerPublicId] = useState<string>(draft?.banner?.publicId || "");
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const isInReview = scholarship.draftStatus === "IN_REVIEW";

  // Calculate completion sections (4 mandatory items required for submission)
  const completionSections = [
    { key: "type", isComplete: Boolean(draft?.type) },
    { key: "titleEn", isComplete: Boolean(draft?.title?.en) },
    { key: "shortDescEn", isComplete: Boolean(draft?.shortDescription?.en) },
    { key: "officialUrl", isComplete: Boolean(draft?.officialUrl) },
  ];
  const completedCount = completionSections.filter((s) => s.isComplete).length;
  const completionPercent = Math.round((completedCount / 4) * 100);
  const hasViContent = Boolean(
    draft?.title?.vi || draft?.shortDescription?.vi || draft?.fullDescription?.vi
  );

  const handleBannerUpload = async (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: cms.uploadCoverErrorType });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: "error", text: cms.uploadCoverErrorSize });
      return;
    }

    setUploadingBanner(true);
    setMessage(null);

    try {
      const sigRes = await getCloudinaryUploadSignatureAction("banner", scholarshipIdStr);
      if (!sigRes.success || !sigRes.authorization) {
        setUploadingBanner(false);
        setMessage({ type: "error", text: sigRes.error || "Failed to authorize banner upload." });
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
      setUploadingBanner(false);

      if (cloudinaryRes.ok && result.secure_url) {
        setBannerUrl(result.secure_url);
        setBannerPublicId(result.public_id || result.secure_url);
        setMessage({ type: "success", text: "Scholarship banner uploaded successfully. Save draft to persist." });
      } else {
        setMessage({
          type: "error",
          text: result.error?.message || "Cloudinary banner upload failed.",
        });
      }
    } catch {
      setUploadingBanner(false);
      setMessage({ type: "error", text: "An error occurred during banner upload." });
    }
  };

  const handleSaveDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.set("scholarshipId", scholarshipIdStr);
    formData.set("bannerUrl", bannerUrl);
    formData.set("bannerPublicId", bannerPublicId);

    const res = await saveScholarshipDraftAction(formData);
    setSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: "Scholarship draft saved successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save draft." });
    }
  };

  const handleSubmitForReview = async (formEl: HTMLFormElement) => {
    setMessage(null);
    setSubmitting(true);

    const formData = new FormData(formEl);
    formData.set("scholarshipId", scholarshipIdStr);
    formData.set("bannerUrl", bannerUrl);
    formData.set("bannerPublicId", bannerPublicId);

    const res = await submitScholarshipForReviewAction(formData);
    setSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Scholarship submitted for review successfully." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to submit scholarship." });
    }
  };

  return (
    <form onSubmit={handleSaveDraft} className="space-y-8 text-xs">
      <input type="hidden" name="scholarshipId" value={scholarshipIdStr} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />
      <input type="hidden" name="bannerPublicId" value={bannerPublicId} />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          {/* Breadcrumbs & Back link */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href={`/${locale}/dashboard`} className="hover:text-blue-600 transition">
              {isVi ? "Tổng quan" : "Dashboard"}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/dashboard/scholarships`} className="hover:text-blue-600 transition">
              {isVi ? "Học bổng" : "Scholarships"}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              {isVi ? "Chỉnh sửa học bổng" : "Edit Scholarship"}
            </span>
          </div>
          <Link
            href={`/${locale}/dashboard/scholarships`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            ← {isVi ? "Quay lại Học bổng" : "Back to Scholarships"}
          </Link>
          <h1 className="text-xl font-bold text-[var(--color-navy)] pt-1">{t.editorTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.editorSubtitle}</p>
        </div>
      </div>

      {/* Admin Feedback Box */}
      {scholarship.draftStatus === "CHANGES_REQUESTED" && scholarship.review?.feedback && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Admin Review Feedback</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed pl-6 font-medium">
            {scholarship.review.feedback}
          </p>
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

      {/* Completion Progress Panel */}
      <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl border border-blue-100 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-800">
            {isVi ? "Mức độ Hoàn thiện Hồ sơ" : "Scholarship Completeness"}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-blue-700">
              {completedCount} / 4 {isVi ? "mục bắt buộc" : "mandatory items"} ({completionPercent}%)
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${hasViContent ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {isVi ? `Tiếng Việt: ${hasViContent ? "Đã cung cấp" : "Chưa nhập (Bỏ qua)"}` : `Vietnamese: ${hasViContent ? "Provided" : "Optional"}`}
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      {/* Basic Scholarship Information */}
      <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          1. {isVi ? "Thông tin Cơ bản & Loại hình" : "Basic Information & Type"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.typeLabel} *
            </label>
            <select
              name="type"
              disabled={isInReview}
              defaultValue={draft?.type || "SHORT_TERM"}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="SHORT_TERM">{t.shortTerm}</option>
              <option value="LONG_TERM">{t.longTerm}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.deadlineLabel}
            </label>
            <input
              type="date"
              name="applicationDeadline"
              disabled={isInReview}
              defaultValue={formatDateForInput(draft?.applicationDeadline)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">{t.deadlineHelp}</p>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t.officialUrlLabel} *
          </label>
          <input
            type="url"
            name="officialUrl"
            required
            disabled={isInReview}
            defaultValue={draft?.officialUrl || ""}
            placeholder="https://university.edu/scholarships/apply"
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Promotional 16:9 Banner Upload */}
      <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          2. {isVi ? "Banner Quảng bá Học bổng" : "Promotional Banner"}
        </h3>

        <p className="text-[11px] text-slate-500 leading-relaxed">{t.bannerHelp}</p>

        <input
          ref={bannerFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          disabled={isInReview || uploadingBanner}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleBannerUpload(e.target.files[0]);
            }
          }}
        />

        {bannerUrl ? (
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="aspect-video max-w-md w-full relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
              <Image
                src={bannerUrl}
                alt="Scholarship banner preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] text-slate-500 truncate max-w-xs">{bannerUrl}</p>
              {!isInReview && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadingBanner}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="py-1.5 px-3 bg-white text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
                  >
                    Replace Banner
                  </button>
                  <button
                    type="button"
                    disabled={uploadingBanner}
                    onClick={() => setBannerUrl("")}
                    className="py-1.5 px-3 bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg hover:bg-rose-100 transition"
                  >
                    Remove Draft Banner
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              if (!isInReview && !uploadingBanner) bannerFileInputRef.current?.click();
            }}
            className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 border-slate-300 bg-white hover:bg-slate-50 ${
              isInReview || uploadingBanner ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {uploadingBanner ? "Uploading banner..." : "Choose 16:9 Scholarship Banner"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, or WebP (max 8 MB)</p>
            </div>
          </div>
        )}
      </div>

      {/* Bilingual Content (EN Required, VI Optional) */}
      <div className="space-y-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
          3. {isVi ? "Nội dung Học bổng" : "Scholarship Content Details"}
        </h3>

        {/* English Content (REQUIRED) */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              {isVi ? "Nội dung Tiếng Anh (Bắt buộc)" : "English Content (Required)"}
            </h4>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              REQUIRED
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Tiêu đề Học bổng (Tiếng Anh)" : "Scholarship Title (EN)"} *
            </label>
            <input
              type="text"
              name="titleEn"
              required
              disabled={isInReview}
              defaultValue={draft?.title?.en || ""}
              placeholder="e.g. Excellence International Undergraduate Scholarship 2026"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Mô tả Ngắn (Tiếng Anh)" : "Short Description (EN)"} *
            </label>
            <textarea
              name="shortDescriptionEn"
              required
              rows={2}
              disabled={isInReview}
              defaultValue={draft?.shortDescription?.en || ""}
              placeholder="Concise summary rendered on public scholarship cards..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Mô tả Chi tiết (Tiếng Anh)" : "Full Description (EN)"}
            </label>
            <RichTextEditor
              name="fullDescriptionEn"
              disabled={isInReview}
              defaultValue={draft?.fullDescription?.en || ""}
              placeholder="Detailed scholarship program breakdown, curriculum, and benefits..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Quyền lợi & Hỗ trợ Tài chính (Tiếng Anh)" : "Funding & Financial Support (EN)"}
            </label>
            <RichTextEditor
              name="fundingSummaryEn"
              disabled={isInReview}
              defaultValue={draft?.fundingSummary?.en || ""}
              placeholder="e.g. 100% full tuition coverage plus $1,200/month living allowance..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Điều kiện Ứng tuyển (Tiếng Anh)" : "Eligibility Criteria (EN)"}
            </label>
            <RichTextEditor
              name="eligibilityEn"
              disabled={isInReview}
              defaultValue={draft?.eligibility?.en || ""}
              placeholder="GPA 3.5+, IELTS 6.5+, statement of purpose..."
            />
          </div>
        </div>

        {/* Vietnamese Content (OPTIONAL) */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                {isVi ? "Nội dung Tiếng Việt (Không bắt buộc)" : "Vietnamese Content (Optional)"}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isVi
                  ? "Bạn có thể bỏ qua phần này nếu chưa có nội dung tiếng Việt. Website sẽ tạm thời sử dụng nội dung tiếng Anh."
                  : "Vietnamese content is optional. If left blank, the English version will be used on the Vietnamese website."}
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
              OPTIONAL
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Tiêu đề Học bổng (Tiếng Việt)" : "Scholarship Title (VI)"}
            </label>
            <input
              type="text"
              name="titleVi"
              disabled={isInReview}
              defaultValue={draft?.title?.vi || ""}
              placeholder="Tùy chọn: Học bổng Đại học Quốc tế Xuất sắc 2026"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Mô tả Ngắn (Tiếng Việt)" : "Short Description (VI)"}
            </label>
            <textarea
              name="shortDescriptionVi"
              rows={2}
              disabled={isInReview}
              defaultValue={draft?.shortDescription?.vi || ""}
              placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ học bổng..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Mô tả Chi tiết (Tiếng Việt)" : "Full Description (VI)"}
            </label>
            <RichTextEditor
              name="fullDescriptionVi"
              disabled={isInReview}
              defaultValue={draft?.fullDescription?.vi || ""}
              placeholder="Chi tiết chương trình đào tạo, quyền lợi bằng Tiếng Việt..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Quyền lợi & Hỗ trợ Tài chính (Tiếng Việt)" : "Funding & Financial Support (VI)"}
            </label>
            <RichTextEditor
              name="fundingSummaryVi"
              disabled={isInReview}
              defaultValue={draft?.fundingSummary?.vi || ""}
              placeholder="Học bổng 100% học phí + Sinh hoạt phí hàng tháng..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isVi ? "Điều kiện Ứng tuyển (Tiếng Việt)" : "Eligibility Criteria (VI)"}
            </label>
            <RichTextEditor
              name="eligibilityVi"
              disabled={isInReview}
              defaultValue={draft?.eligibility?.vi || ""}
              placeholder="Điểm trung bình 8.0+, IELTS 6.5+..."
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {!isInReview && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving || submitting || uploadingBanner}
            className="py-2.5 px-5 bg-white text-slate-700 border border-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
          >
            {saving ? cms.saving : cms.saveDraftBtn}
          </button>

          <button
            type="button"
            disabled={saving || submitting || uploadingBanner}
            onClick={(e) => {
              const formEl = e.currentTarget.closest("form");
              if (formEl) handleSubmitForReview(formEl);
            }}
            className="py-2.5 px-6 bg-[var(--color-navy)] text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
          >
            {submitting ? cms.submitting : cms.submitReviewBtn}
          </button>
        </div>
      )}
    </form>
  );
}
