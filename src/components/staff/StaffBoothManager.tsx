"use client";

import { useState } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { BoothWithOrgInfo } from "@/lib/db/repositories/summit-booth-assignments";
import {
  saveBoothAssignmentDraftAction,
  publishBoothAssignmentAction,
  getBoothPhotoUploadSignatureAction,
} from "@/app/actions/staff-actions";

interface StaffBoothManagerProps {
  booths: BoothWithOrgInfo[];
  total: number;
  page: number;
  totalPages: number;
  currentStatus: string;
  searchQuery: string;
  stats: {
    totalAssigned: number;
    published: number;
    draftOnly: number;
  };
  confirmedOrgs: Array<{ _id: string; name: string; country: string; type: string }>;
  locale: Locale;
  dict: Dictionary;
}

export function StaffBoothManager({
  booths,
  stats,
  confirmedOrgs,
}: StaffBoothManagerProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    confirmedOrgs.length > 0 ? confirmedOrgs[0]._id : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Find booth record for selected org
  const activeBooth = booths.find((b) => b.organizationId.toString() === selectedOrgId);
  const activeOrg = confirmedOrgs.find((o) => o._id === selectedOrgId);

  // Controlled form state
  const [boothLabel, setBoothLabel] = useState(activeBooth?.draftAssignment?.boothLabel || "");
  const [locationText, setLocationText] = useState(activeBooth?.draftAssignment?.locationText || "");
  const [note, setNote] = useState(activeBooth?.draftAssignment?.note || "");
  const [photoPublicId, setPhotoPublicId] = useState(activeBooth?.draftAssignment?.boothPhoto?.publicId || "");
  const [photoSecureUrl, setPhotoSecureUrl] = useState(activeBooth?.draftAssignment?.boothPhoto?.secureUrl || "");

  // Update form fields when selected org changes
  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    setFeedback(null);
    const b = booths.find((x) => x.organizationId.toString() === orgId);
    setBoothLabel(b?.draftAssignment?.boothLabel || "");
    setLocationText(b?.draftAssignment?.locationText || "");
    setNote(b?.draftAssignment?.note || "");
    setPhotoPublicId(b?.draftAssignment?.boothPhoto?.publicId || "");
    setPhotoSecureUrl(b?.draftAssignment?.boothPhoto?.secureUrl || "");
  };

  // Signed Cloudinary upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrgId) return;

    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: "error", msg: "Photo file size exceeds 8 MB limit." });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const sigRes = await getBoothPhotoUploadSignatureAction(selectedOrgId);
      if (!sigRes.success || !sigRes.authorization) {
        throw new Error(sigRes.error || "Failed to authorize upload.");
      }

      const auth = sigRes.authorization;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", auth.apiKey);
      formData.append("timestamp", String(auth.timestamp));
      formData.append("signature", auth.signature);
      formData.append("folder", auth.folder);
      formData.append("upload_preset", auth.uploadPreset);

      const cloudUrl = `https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`;
      const uploadRes = await fetch(cloudUrl, { method: "POST", body: formData });
      const data = await uploadRes.json();

      if (!data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
      }

      setPhotoPublicId(data.public_id);
      setPhotoSecureUrl(data.secure_url);
      setFeedback({ type: "success", msg: "Photo uploaded. Click 'Save Draft' to persist changes." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setFeedback({ type: "error", msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;

    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("boothLabel", boothLabel);
    formData.append("locationText", locationText);
    formData.append("note", note);
    formData.append("photoPublicId", photoPublicId);
    formData.append("photoSecureUrl", photoSecureUrl);

    const res = await saveBoothAssignmentDraftAction(selectedOrgId, formData);
    setIsSaving(false);

    if (res.success) {
      setFeedback({ type: "success", msg: "Booth assignment draft saved successfully." });
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to save draft." });
    }
  };

  const handlePublish = async () => {
    if (!activeBooth?._id) {
      setFeedback({ type: "error", msg: "Please save draft before publishing." });
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    const res = await publishBoothAssignmentAction(activeBooth._id.toString());
    setIsPublishing(false);

    if (res.success) {
      setFeedback({ type: "success", msg: "Booth assignment published to Partner!" });
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to publish." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">
          Booth Management Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Assign booth numbers, hall locations, and photos to participating Partner institutions.
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Assigned
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {stats.totalAssigned}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Published to Partners
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {stats.published}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Draft Only
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {stats.draftOnly}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <span>{feedback.type === "success" ? "✅" : "⚠️"} {feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Layout: Org List on Left, Booth Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization Picker */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Confirmed Partner Institutions ({confirmedOrgs.length})
          </h2>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {confirmedOrgs.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                No confirmed participating organizations for the active Summit edition.
              </p>
            ) : (
              confirmedOrgs.map((org) => {
                const isSelected = org._id === selectedOrgId;
                const b = booths.find((x) => x.organizationId.toString() === org._id);
                const isPublished = b?.isPublished;

                return (
                  <button
                    key={org._id}
                    onClick={() => handleSelectOrg(org._id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[var(--color-navy)] text-white font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-xs block font-semibold leading-snug">
                        {org.name}
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSelected ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {org.country} • {org.type}
                      </span>
                    </div>

                    {isPublished ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Published
                      </span>
                    ) : b?.draftAssignment ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 shrink-0">
                        Draft
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Booth Editor Form */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {activeOrg ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{activeOrg.name}</h2>
                  <p className="text-xs text-slate-500">{activeOrg.country} • {activeOrg.type}</p>
                </div>
                {activeBooth?.isPublished ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                    Published Assignment
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border border-slate-200">
                    Draft Only
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveDraft} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booth Number / Label (Free-text)
                  </label>
                  <input
                    type="text"
                    value={boothLabel}
                    onChange={(e) => setBoothLabel(e.target.value)}
                    placeholder="e.g. A12, Booth A12-A13, Korea Zone - Booth 3"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Hall Area (Free-text)
                  </label>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="e.g. International Expo Zone — Alpha Hall"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Partner Operational Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Notes for partner institution regarding setup, entrance proximity, etc."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Booth Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booth Photo (Upload / Mobile Camera)
                  </label>
                  {photoSecureUrl ? (
                    <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-slate-200 mb-2">
                      <Image src={photoSecureUrl} alt="Booth photo" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPublicId("");
                          setPhotoSecureUrl("");
                        }}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {isUploading && <p className="text-[10px] text-blue-600 font-bold mt-1">Uploading photo to Cloudinary...</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isSaving ? "Saving Draft..." : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || isSaving || !boothLabel}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isPublishing ? "Publishing..." : "Publish to Partner"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-xs text-slate-400 p-8 text-center">
              Select a partner organization from the left list to edit booth assignment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
