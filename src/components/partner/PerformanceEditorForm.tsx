"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type {
  SummitActivity,
  StagePerformanceSnapshot,
  MediaAsset,
} from "@/lib/db/models/summit-activity";
import { saveActivityDraftAction, submitActivityForReviewAction } from "@/app/actions/activity-actions";
import { getCloudinaryUploadSignatureAction } from "@/app/actions/upload-actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface PerformanceEditorFormProps {
  activity: SummitActivity;
  locale: Locale;
  dict: Dictionary;
}

export function PerformanceEditorForm({
  activity,
  dict,
}: PerformanceEditorFormProps) {
  const router = useRouter();
  const actDict = dict.partnerActivities;
  const cmsDict = dict.partnerCms;

  const snap = activity.draftSnapshot as StagePerformanceSnapshot;
  const isReadOnly = activity.draftStatus === "IN_REVIEW";
  const id = activity._id!.toString();

  const [culturalMeaningEn, setCulturalMeaningEn] = useState(snap.culturalMeaning?.en || "");
  const [culturalMeaningVi, setCulturalMeaningVi] = useState(snap.culturalMeaning?.vi || "");

  const [performanceCover, setPerformanceCover] = useState<MediaAsset | undefined>(snap.performanceCover);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");

  const [materialAccessConfirmed, setMaterialAccessConfirmed] = useState(
    Boolean(snap.materialAccessConfirmed)
  );
  const [dataPermissionConfirmed, setDataPermissionConfirmed] = useState(
    Boolean(snap.dataPermissionConfirmed)
  );

  const [backingTrackUrl, setBackingTrackUrl] = useState(snap.backingTrackUrl || "");
  const [demoVideoUrl, setDemoVideoUrl] = useState(snap.demoVideoUrl || "");
  const [supportingContentUrl, setSupportingContentUrl] = useState(snap.supportingContentUrl || "");

  const hasMaterialLinks = Boolean(
    backingTrackUrl.trim() || demoVideoUrl.trim() || supportingContentUrl.trim()
  );

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setCoverError("Image file size must not exceed 8 MB.");
      return;
    }

    setCoverUploading(true);
    setCoverError("");

    try {
      const sigRes = await getCloudinaryUploadSignatureAction("activity_cover", id);
      if (!sigRes.success || !sigRes.authorization) {
        setCoverError(sigRes.error || "Failed to authorize upload.");
        setCoverUploading(false);
        return;
      }

      const { cloudName, apiKey, timestamp, folder, signature, uploadPreset } = sigRes.authorization;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("signature", signature);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload to Cloudinary failed.");
      }

      const data = await res.json();
      setPerformanceCover({
        publicId: data.public_id,
        secureUrl: data.secure_url,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        resourceType: "image",
      });
    } catch (err: unknown) {
      setCoverError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setCoverUploading(false);
    }
  };

  const buildFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set("culturalMeaningEn", culturalMeaningEn);
    formData.set("culturalMeaningVi", culturalMeaningVi);
    formData.set("backingTrackUrl", backingTrackUrl);
    formData.set("demoVideoUrl", demoVideoUrl);
    formData.set("supportingContentUrl", supportingContentUrl);
    if (performanceCover?.publicId) {
      formData.set("coverPublicId", performanceCover.publicId);
    }
    formData.set("materialAccessConfirmed", String(materialAccessConfirmed));
    formData.set("dataPermissionConfirmed", String(dataPermissionConfirmed));
    return formData;
  };

  const handleSaveDraftClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (!form) return;

    setSaving(true);
    setError("");

    const formData = buildFormData(form);
    const res = await saveActivityDraftAction(id, formData);
    setSaving(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Failed to save draft.");
    }
  };

  const handleSubmitReviewClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (!form) return;

    if (hasMaterialLinks && !materialAccessConfirmed) {
      setError(actDict.materialAccessNotice);
      return;
    }

    if (!dataPermissionConfirmed) {
      setError(actDict.dataPermissionConfirmLabel);
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = buildFormData(form);
    const res = await submitActivityForReviewAction(id, formData);
    setSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Failed to submit proposal.");
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8 text-xs">
      {/* Approved Content Notice when editing draft */}
      {activity.isContentApproved && activity.draftStatus === "DRAFT" && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            ✓ Previously Approved Proposal (Draft Revision Mode)
          </p>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            This proposal has an approved content snapshot. You are currently editing a draft revision. The approved content remains active until your new revision is submitted and re-approved by Admins.
          </p>
        </div>
      )}

      {/* Admin Feedback Banner */}
      {activity.draftStatus === "CHANGES_REQUESTED" && activity.review?.feedback && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            ⚠️ {cmsDict.statusChangesRequested}
          </p>
          <p className="text-xs text-rose-700 leading-relaxed font-medium">
            {activity.review.feedback}
          </p>
        </div>
      )}

      {/* In Review Read-Only Banner */}
      {isReadOnly && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl font-medium">
          ℹ️ {cmsDict.inReviewNotice}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          1. Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Performance Title (English) *
            </label>
            <input
              type="text"
              name="titleEn"
              required
              disabled={isReadOnly}
              defaultValue={snap.title?.en}
              placeholder="e.g. Traditional Fan Dance"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Performance Title (Vietnamese - Optional)
            </label>
            <input
              type="text"
              name="titleVi"
              disabled={isReadOnly}
              defaultValue={snap.title?.vi}
              placeholder="Ví dụ: Múa Quạt Truyền Thống"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Performance Type *</label>
            <select
              name="performanceType"
              disabled={isReadOnly}
              defaultValue={snap.performanceType || "CULTURAL_PERFORMANCE"}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="TRADITIONAL_MUSIC">Traditional Music</option>
              <option value="MODERN_MUSIC">Modern / Pop Music</option>
              <option value="DANCE">Dance / Choreography</option>
              <option value="FASHION_SHOW">Fashion Show / Costume</option>
              <option value="CULTURAL_PERFORMANCE">Cultural Performance</option>
              <option value="INSTRUMENTAL">Instrumental Performance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Country or Culture Represented *
            </label>
            <input
              type="text"
              name="countryOrCultureRepresented"
              required
              disabled={isReadOnly}
              defaultValue={snap.countryOrCultureRepresented}
              placeholder="e.g. Japan / Traditional Kimono Culture"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Number of Performers *
            </label>
            <input
              type="number"
              name="numberOfPerformers"
              min={1}
              required
              disabled={isReadOnly}
              defaultValue={snap.numberOfPerformers || 1}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Duration (Minutes) *
            </label>
            <input
              type="number"
              name="durationMinutes"
              min={1}
              required
              disabled={isReadOnly}
              defaultValue={snap.durationMinutes || 15}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
      </section>

      {/* 2. Performance Content */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          2. Performance Content
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Short Description (English) *
            </label>
            <textarea
              name="shortDescEn"
              rows={3}
              required
              disabled={isReadOnly}
              defaultValue={snap.shortDescription?.en}
              placeholder="Brief overview of the performance (max 300 chars)"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Short Description (Vietnamese - Optional)
            </label>
            <textarea
              name="shortDescVi"
              rows={3}
              disabled={isReadOnly}
              defaultValue={snap.shortDescription?.vi}
              placeholder="Tóm tắt ngắn gọn bằng tiếng Việt"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cultural Meaning / Context (English - Rich Text)
            </label>
            <RichTextEditor
              value={culturalMeaningEn}
              onChange={setCulturalMeaningEn}
              placeholder="Cultural story, heritage significance..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cultural Meaning / Context (Vietnamese - Rich Text)
            </label>
            <RichTextEditor
              value={culturalMeaningVi}
              onChange={setCulturalMeaningVi}
              placeholder="Ý nghĩa văn hóa bằng tiếng Việt..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              MC Introduction Script (English / Vietnamese)
            </label>
            <textarea
              name="mcIntroEn"
              rows={2}
              disabled={isReadOnly}
              defaultValue={snap.mcIntroduction?.en}
              placeholder="Suggested host introduction script..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
      </section>

      {/* 3. Internal Representative Contact */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          3. Performance Representative Contact (Internal Privacy Protected)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contact Person Name *
            </label>
            <input
              type="text"
              name="contactPersonName"
              required
              disabled={isReadOnly}
              defaultValue={snap.contactPersonName}
              placeholder="e.g. John Smith"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Email *
            </label>
            <input
              type="email"
              name="email"
              required
              disabled={isReadOnly}
              defaultValue={snap.email}
              placeholder="contact@performance-group.com"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Phone / WhatsApp
            </label>
            <input
              type="text"
              name="phoneOrWhatsapp"
              disabled={isReadOnly}
              defaultValue={snap.phoneOrWhatsapp}
              placeholder="+1 234 567 890"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            />
          </div>
        </div>
      </section>

      {/* 4. Performance Cover Image */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          4. Performance Cover Image
        </h2>

        {performanceCover?.secureUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={performanceCover.secureUrl}
                alt="Performance Cover"
                fill
                className="object-cover"
              />
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setPerformanceCover(undefined)}
                className="py-1 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg text-xs"
              >
                Remove Cover Image
              </button>
            )}
          </div>
        ) : (
          <div>
            {!isReadOnly && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={coverUploading}
                onChange={handleCoverUpload}
                className="text-xs"
              />
            )}
            {coverUploading && <p className="text-xs text-blue-600 font-semibold mt-1">Uploading image...</p>}
            {coverError && <p className="text-xs text-rose-600 font-semibold mt-1">{coverError}</p>}
          </div>
        )}
      </section>

      {/* 5. Media & Audio Links (LINKS ONLY) */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          5. Media & Backing Track Links
        </h2>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl font-medium space-y-1">
          <p className="font-bold text-xs">⚠️ {actDict.materialAccessNotice}</p>
          <p className="text-[11px] leading-relaxed">
            Provide accessible HTTP/HTTPS links to backing audio tracks (e.g. Google Drive, OneDrive) and demo videos (YouTube, Vimeo, Drive).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Backing Track / Audio File Link
            </label>
            <input
              type="url"
              name="backingTrackUrl"
              disabled={isReadOnly}
              value={backingTrackUrl}
              onChange={(e) => setBackingTrackUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Demo Video Link
            </label>
            <input
              type="url"
              name="demoVideoUrl"
              disabled={isReadOnly}
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supporting Material Link
            </label>
            <input
              type="url"
              name="supportingContentUrl"
              disabled={isReadOnly}
              value={supportingContentUrl}
              onChange={(e) => setSupportingContentUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>
        </div>
      </section>

      {/* 6. Stage & Audio Technical Requirements */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          6. Stage & Audio Technical Requirements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Microphones Required
            </label>
            <input
              type="number"
              name="microphonesRequired"
              min={0}
              disabled={isReadOnly}
              defaultValue={snap.stageRequirements?.microphonesRequired}
              placeholder="e.g. 2 wireless mics"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Props / Instruments
            </label>
            <input
              type="text"
              name="propsOrInstruments"
              disabled={isReadOnly}
              defaultValue={snap.stageRequirements?.propsOrInstruments}
              placeholder="e.g. 1 acoustic guitar, 4 fans"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Stage Setup & Spatial Notes
            </label>
            <textarea
              name="stageSetupRequirements"
              rows={2}
              disabled={isReadOnly}
              defaultValue={snap.stageRequirements?.stageSetupRequirements}
              placeholder="Positioning, entrances, exits..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Audio & Lighting Requirements
            </label>
            <textarea
              name="audioRequirements"
              rows={2}
              disabled={isReadOnly}
              defaultValue={snap.stageRequirements?.audioRequirements}
              placeholder="Lighting focus, audio cue timings..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>
      </section>

      {/* 7. Declarations & Required Confirmations */}
      <section className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
        <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200/60 pb-2">
          7. Declarations & Mandatory Confirmations
        </h2>

        {/* Confirmation A: Material Link Access (Shown ONLY when material links exist) */}
        {hasMaterialLinks && (
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              disabled={isReadOnly}
              checked={materialAccessConfirmed}
              onChange={(e) => setMaterialAccessConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-bold text-slate-900 leading-snug">
              {actDict.materialAccessConfirmLabel} *
            </span>
          </label>
        )}

        {/* Confirmation B: Third-Party Data & Media Authorization (ALWAYS visible) */}
        <label className={`flex items-start gap-2.5 cursor-pointer ${hasMaterialLinks ? "pt-2 border-t border-blue-200/60" : ""}`}>
          <input
            type="checkbox"
            disabled={isReadOnly}
            checked={dataPermissionConfirmed}
            onChange={(e) => setDataPermissionConfirmed(e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="font-bold text-slate-900 leading-snug">
            {actDict.dataPermissionConfirmLabel} *
          </span>
        </label>
      </section>

      {/* Action Footer */}
      {!isReadOnly && (
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={saving || submitting}
            onClick={handleSaveDraftClick}
            className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition shadow-2xs disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={saving || submitting}
            onClick={handleSubmitReviewClick}
            className="py-3 px-6 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      )}
    </form>
  );
}
