"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type {
  SummitActivity,
  WorkshopSnapshot,
  WorkshopSpeaker,
  MediaAsset,
  MaterialSharingPermission,
} from "@/lib/db/models/summit-activity";
import { saveActivityDraftAction, submitActivityForReviewAction } from "@/app/actions/activity-actions";
import { getCloudinaryUploadSignatureAction } from "@/app/actions/upload-actions";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getTrackById } from "@/lib/config/workshop-tracks";

interface WorkshopEditorFormProps {
  activity: SummitActivity;
  locale?: Locale;
  dict: Dictionary;
}

export function WorkshopEditorForm({
  activity,
  locale = "en",
  dict,
}: WorkshopEditorFormProps) {
  const router = useRouter();
  const actDict = dict.partnerActivities;
  const cmsDict = dict.partnerCms;
  const isVi = locale === "vi";

  const snap = activity.draftSnapshot as WorkshopSnapshot;
  const isReadOnly = activity.draftStatus === "IN_REVIEW";
  const id = activity._id!.toString();

  const trackDef = getTrackById(activity.trackId);

  // Controlled states for rich text & speakers
  const [fullDescEn, setFullDescEn] = useState(snap.fullDescription?.en || "");
  const [fullDescVi, setFullDescVi] = useState(snap.fullDescription?.vi || "");
  const [keyTakeawaysEn, setKeyTakeawaysEn] = useState(snap.keyTakeaways?.en || "");
  const [keyTakeawaysVi, setKeyTakeawaysVi] = useState(snap.keyTakeaways?.vi || "");

  const [speakers, setSpeakers] = useState<WorkshopSpeaker[]>(snap.speakers || []);
  const [coverImage, setCoverImage] = useState<MediaAsset | undefined>(snap.coverImage);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState("");

  const [interpretationRequired, setInterpretationRequired] = useState(Boolean(snap.interpretationRequired));
  const [interpretationNotes, setInterpretationNotes] = useState(snap.interpretationNotes || "");
  const [materialSharingPermission, setMaterialSharingPermission] = useState<MaterialSharingPermission>(
    snap.materialSharingPermission || "INTERNAL_USE_ONLY"
  );

  const [materialAccessConfirmed, setMaterialAccessConfirmed] = useState(
    Boolean(snap.materialAccessConfirmed)
  );
  const [dataPermissionConfirmed, setDataPermissionConfirmed] = useState(
    Boolean(snap.dataPermissionConfirmed)
  );

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Cover image signed upload handler
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
      setCoverImage({
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

  // Controlled states for material links
  const [slideUrl, setSlideUrl] = useState(snap.slideUrl || "");
  const [supportingContentUrl, setSupportingContentUrl] = useState(snap.supportingContentUrl || "");
  const [referenceUrl, setReferenceUrl] = useState(snap.referenceUrl || "");

  const hasMaterialLinks = Boolean(
    slideUrl.trim() || supportingContentUrl.trim() || referenceUrl.trim()
  );

  // Speaker array management
  const addSpeaker = () => {
    const newSpeaker: WorkshopSpeaker = {
      id: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fullName: "",
      positionTitle: "",
      organizationName: "",
      country: "",
      shortBio: { en: "" },
      email: "",
    };
    setSpeakers([...speakers, newSpeaker]);
  };

  const updateSpeaker = (speakerId: string, updates: Partial<WorkshopSpeaker>) => {
    setSpeakers(
      speakers.map((sp) => (sp.id === speakerId ? { ...sp, ...updates } : sp))
    );
  };

  const removeSpeaker = (speakerId: string) => {
    setSpeakers(speakers.filter((sp) => sp.id !== speakerId));
  };

  const buildFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set("fullDescEn", fullDescEn);
    formData.set("fullDescVi", fullDescVi);
    formData.set("keyTakeawaysEn", keyTakeawaysEn);
    formData.set("keyTakeawaysVi", keyTakeawaysVi);
    formData.set("speakersJson", JSON.stringify(speakers));
    if (coverImage?.publicId) {
      formData.set("coverPublicId", coverImage.publicId);
    }
    formData.set("interpretationRequired", String(interpretationRequired));
    formData.set("interpretationNotes", interpretationNotes);
    formData.set("materialSharingPermission", materialSharingPermission);
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
      {/* Track & Topic Identity Card */}
      <div className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-2xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            🎯 WORKSHOP TRACK & SCOPE
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            {trackDef ? (isVi ? trackDef.name.vi : trackDef.name.en) : "Track General"}
          </span>
        </div>

        {activity.acceptedTopicSnapshot ? (
          <div className="p-3 bg-white/80 rounded-xl border border-blue-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              ✓ Locked Accepted Topic (Stage A)
            </span>
            <p className="text-xs font-bold text-slate-900">
              {activity.acceptedTopicSnapshot.tentativeTitle.en}
            </p>
            <p className="text-[11px] text-slate-600">
              {activity.acceptedTopicSnapshot.conceptSummary.en}
            </p>
          </div>
        ) : activity.topicReviewStatus === "IN_REVIEW" ? (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium">
            ⏳ Topic proposal is currently under Admin Review. Final content submission will unlock once topic is accepted.
          </div>
        ) : null}
      </div>

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
              Workshop Title (English) *
            </label>
            <input
              type="text"
              name="titleEn"
              required
              disabled={isReadOnly}
              defaultValue={snap.title?.en}
              placeholder="e.g. AI in Global Higher Education"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Workshop Title (Vietnamese - Optional)
            </label>
            <input
              type="text"
              name="titleVi"
              disabled={isReadOnly}
              defaultValue={snap.title?.vi}
              placeholder="Ví dụ: Trí tuệ nhân tạo trong Giáo dục Độc lập"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Presentation Language *</label>
            <select
              name="language"
              disabled={isReadOnly}
              defaultValue={snap.language || "ENGLISH"}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="ENGLISH">English</option>
              <option value="VIETNAMESE">Vietnamese</option>
              <option value="BILINGUAL">Bilingual (English & Vietnamese)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Format *</label>
            <select
              name="format"
              disabled={isReadOnly}
              defaultValue={snap.format || "TALK"}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="TALK">Keynote / Presentation Talk</option>
              <option value="WORKSHOP">Interactive Workshop</option>
              <option value="PANEL">Panel Discussion</option>
              <option value="INTERACTIVE_SESSION">Interactive Session</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Fixed 30-min Duration Rule Read-Only Badge */}
          <div className="md:col-span-2 p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">
                ⏱️ Standard Workshop Session Duration
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Standard format: 20 min presentation · 7 min Q&A · 3 min transition
              </span>
            </div>
            <span className="px-3 py-1 bg-white text-blue-900 font-bold text-xs rounded-lg border border-slate-300">
              30 Minutes (Fixed)
            </span>
          </div>

          {/* Language Interpretation Preferences */}
          <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={interpretationRequired}
                onChange={(e) => setInterpretationRequired(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-bold text-slate-800">
                🌐 Interpretation Required? (Phiên dịch song song)
              </span>
            </label>

            {interpretationRequired && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Interpretation Language / Notes
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={interpretationNotes}
                  onChange={(e) => setInterpretationNotes(e.target.value)}
                  placeholder="e.g. English to Vietnamese consecutive interpretation needed"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Audience
            </label>
            <input
              type="text"
              name="targetAudience"
              disabled={isReadOnly}
              defaultValue={snap.targetAudience}
              placeholder="e.g. High school students, University students, Educators"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
      </section>

      {/* 2. Workshop Content */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          2. Workshop Content & Takeaways
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
              placeholder="Brief summary for agenda display (max 300 chars)"
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
              placeholder="Tóm tắt ngắn hiển thị trên chương trình"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Description (English - Rich Text)
            </label>
            <RichTextEditor
              value={fullDescEn}
              onChange={setFullDescEn}
              placeholder="Detailed workshop summary, agenda highlights..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Description (Vietnamese - Rich Text)
            </label>
            <RichTextEditor
              value={fullDescVi}
              onChange={setFullDescVi}
              placeholder="Mô tả chi tiết bằng tiếng Việt..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Key Takeaways (English - Rich Text)
            </label>
            <RichTextEditor
              value={keyTakeawaysEn}
              onChange={setKeyTakeawaysEn}
              placeholder="Key learning outcomes for participants..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Key Takeaways (Vietnamese - Rich Text)
            </label>
            <RichTextEditor
              value={keyTakeawaysVi}
              onChange={setKeyTakeawaysVi}
              placeholder="Giá trị đạt được sau workshop..."
            />
          </div>
        </div>
      </section>

      {/* 3. Speaker Information */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider">
            3. Speaker Information (At least 1 required)
          </h2>
          {!isReadOnly && (
            <button
              type="button"
              onClick={addSpeaker}
              className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg text-xs transition"
            >
              + Add Speaker
            </button>
          )}
        </div>

        {speakers.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">
            No speakers added yet. Click &quot;+ Add Speaker&quot; above to register workshop speakers.
          </p>
        ) : (
          <div className="space-y-6">
            {speakers.map((sp, idx) => (
              <div
                key={sp.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Speaker #{idx + 1}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeSpeaker(sp.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={sp.fullName}
                      onChange={(e) => updateSpeaker(sp.id, { fullName: e.target.value })}
                      placeholder="e.g. Prof. Jane Doe"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Position / Title *</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={sp.positionTitle}
                      onChange={(e) => updateSpeaker(sp.id, { positionTitle: e.target.value })}
                      placeholder="e.g. Dean of International Office"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Organization *</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={sp.organizationName}
                      onChange={(e) => updateSpeaker(sp.id, { organizationName: e.target.value })}
                      placeholder="e.g. Global University"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Country *</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={sp.country}
                      onChange={(e) => updateSpeaker(sp.id, { country: e.target.value })}
                      placeholder="e.g. Australia"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Short Bio (English) *</label>
                    <textarea
                      rows={2}
                      disabled={isReadOnly}
                      value={sp.shortBio?.en || ""}
                      onChange={(e) =>
                        updateSpeaker(sp.id, {
                          shortBio: { ...sp.shortBio, en: e.target.value },
                        })
                      }
                      placeholder="Brief background summary..."
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Internal Contact Email * (PRIVACY PROTECTED)
                    </label>
                    <input
                      type="email"
                      disabled={isReadOnly}
                      value={sp.email}
                      onChange={(e) => updateSpeaker(sp.id, { email: e.target.value })}
                      placeholder="speaker@university.edu"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Internal Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={sp.phoneOrWhatsapp || ""}
                      onChange={(e) => updateSpeaker(sp.id, { phoneOrWhatsapp: e.target.value })}
                      placeholder="+1 234 567 890"
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Workshop Materials & Sharing Rights */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          4. Workshop Materials & Post-Event Sharing Permissions
        </h2>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl font-medium space-y-1">
          <p className="font-bold text-xs">⚠️ {actDict.materialAccessNotice}</p>
          <p className="text-[11px] leading-relaxed">
            Provide accessible HTTP/HTTPS links (e.g. Google Drive, OneDrive, Canva, Dropbox).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Slide / Presentation Link
            </label>
            <input
              type="url"
              name="slideUrl"
              disabled={isReadOnly}
              value={slideUrl}
              onChange={(e) => setSlideUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/..."
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reference / Institutional Link
            </label>
            <input
              type="url"
              name="referenceUrl"
              disabled={isReadOnly}
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://university.edu/workshop-info"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>
        </div>

        {/* Post-Event Material Sharing Permission */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label className="block font-bold text-slate-800 text-xs">
            📄 Post-Event Material Sharing Permission * (Quyền chia sẻ tài liệu)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border cursor-pointer">
              <input
                type="radio"
                name="materialSharingPermission"
                value="PUBLICLY_SHAREABLE"
                disabled={isReadOnly}
                checked={materialSharingPermission === "PUBLICLY_SHAREABLE"}
                onChange={() => setMaterialSharingPermission("PUBLICLY_SHAREABLE")}
              />
              <span className="font-semibold text-slate-800">Publicly Shareable</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border cursor-pointer">
              <input
                type="radio"
                name="materialSharingPermission"
                value="INTERNAL_USE_ONLY"
                disabled={isReadOnly}
                checked={materialSharingPermission === "INTERNAL_USE_ONLY"}
                onChange={() => setMaterialSharingPermission("INTERNAL_USE_ONLY")}
              />
              <span className="font-semibold text-slate-800">Internal Use Only</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border cursor-pointer">
              <input
                type="radio"
                name="materialSharingPermission"
                value="DO_NOT_SHARE"
                disabled={isReadOnly}
                checked={materialSharingPermission === "DO_NOT_SHARE"}
                onChange={() => setMaterialSharingPermission("DO_NOT_SHARE")}
              />
              <span className="font-semibold text-slate-800">Do Not Share</span>
            </label>
          </div>
        </div>
      </section>

      {/* 5. Promotional Image */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          5. Workshop Promotional Cover Image
        </h2>

        {coverImage?.secureUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={coverImage.secureUrl}
                alt="Workshop Cover"
                fill
                className="object-cover"
              />
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setCoverImage(undefined)}
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

      {/* 6. Technical Requirements */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-navy)] uppercase tracking-wider border-b border-slate-100 pb-2">
          6. Technical Equipment Requirements
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="techProjector"
              value="true"
              disabled={isReadOnly}
              defaultChecked={snap.technicalRequirements?.projector}
              className="rounded"
            />
            <span className="font-semibold text-slate-700">Projector / Screen</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="techMicrophone"
              value="true"
              disabled={isReadOnly}
              defaultChecked={snap.technicalRequirements?.microphone}
              className="rounded"
            />
            <span className="font-semibold text-slate-700">Microphone</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="techSpeakersAudio"
              value="true"
              disabled={isReadOnly}
              defaultChecked={snap.technicalRequirements?.speakersAudio}
              className="rounded"
            />
            <span className="font-semibold text-slate-700">Audio Speakers</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="techInternet"
              value="true"
              disabled={isReadOnly}
              defaultChecked={snap.technicalRequirements?.internet}
              className="rounded"
            />
            <span className="font-semibold text-slate-700">High-speed Internet</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="techWhiteboard"
              value="true"
              disabled={isReadOnly}
              defaultChecked={snap.technicalRequirements?.whiteboard}
              className="rounded"
            />
            <span className="font-semibold text-slate-700">Whiteboard / Flipchart</span>
          </label>
        </div>
      </section>

      {/* 7. Declarations & Required Confirmations */}
      <section className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
        <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200/60 pb-2">
          7. Declarations & Mandatory Confirmations
        </h2>

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
            {submitting ? "Submitting..." : "Submit Final Content for Review"}
          </button>
        </div>
      )}
    </form>
  );
}
