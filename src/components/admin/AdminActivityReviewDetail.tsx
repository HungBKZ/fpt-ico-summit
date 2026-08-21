"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type {
  SummitActivity,
  WorkshopSnapshot,
  StagePerformanceSnapshot,
} from "@/lib/db/models/summit-activity";
import { requestActivityChangesAction, approveActivityContentAction } from "@/app/actions/activity-actions";
import { SafeHtml } from "@/components/ui/SafeHtml";

export interface SerializedAdminActivityDetail extends SummitActivity {
  orgName?: string;
  orgCountry?: string;
}

interface AdminActivityReviewDetailProps {
  activity: SerializedAdminActivityDetail;
  locale: Locale;
  dict: Dictionary;
}

export function AdminActivityReviewDetail({
  activity,
  locale,
  dict,
}: AdminActivityReviewDetailProps) {
  const router = useRouter();
  const admDict = dict.adminActivities;
  const isVi = locale === "vi";

  const snap = activity.draftSnapshot;
  const isWorkshop = activity.type === "WORKSHOP";
  const ws = snap as WorkshopSnapshot;
  const ps = snap as StagePerformanceSnapshot;

  const [feedback, setFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setSubmitting(true);
    setError("");

    const res = await approveActivityContentAction(activity._id!.toString());
    setSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Failed to approve activity content.");
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError(admDict.feedbackRequired);
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await requestActivityChangesAction(activity._id!.toString(), feedback);
    setSubmitting(false);

    if (res.success) {
      setShowRejectModal(false);
      router.refresh();
    } else {
      setError(res.error || "Failed to request changes.");
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {/* Header Info & Action Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isWorkshop
                  ? "bg-blue-100 text-blue-900"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Provider: <strong className="text-slate-900">{activity.orgName || "Organization"}</strong> ({activity.orgCountry || "Global"})
            </span>
          </div>

          <h1 className="text-lg font-bold text-[var(--color-navy)]">
            {(isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "Untitled Activity"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activity.draftStatus !== "NONE" && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowRejectModal(true)}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition"
              >
                {admDict.requestChangesBtn}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleApprove}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                {submitting ? "Approving..." : admDict.approveBtn}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Previously Approved Revision Notice */}
      {activity.isContentApproved && activity.draftStatus !== "NONE" && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            ✓ Previously Approved Content (Draft Revision Under Moderation)
          </p>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            This activity already has an active approved snapshot. You are currently reviewing a draft revision submitted by the partner. Approving will replace the approved snapshot with the current draft.
          </p>
        </div>
      )}

      {/* Review Feedback Display if present */}
      {activity.review?.feedback && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
          <p className="font-bold text-amber-900 text-xs">⚠️ Previous Feedback Note:</p>
          <p className="text-amber-800 leading-relaxed font-medium">{activity.review.feedback}</p>
        </div>
      )}

      {/* Inspection Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary & Descriptions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Content & Overview
            </h2>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Short Description (EN)</span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium mt-0.5">{snap.shortDescription?.en}</p>
            </div>

            {snap.shortDescription?.vi && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Short Description (VI)</span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium mt-0.5">{snap.shortDescription.vi}</p>
              </div>
            )}

            {isWorkshop && ws.fullDescription?.en && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Full Description (EN)</span>
                <div className="mt-1 text-slate-800 leading-relaxed">
                  <SafeHtml content={ws.fullDescription.en} />
                </div>
              </div>
            )}

            {!isWorkshop && ps.culturalMeaning?.en && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-medium">Cultural Meaning & Context</span>
                <div className="mt-1 text-slate-800 leading-relaxed">
                  <SafeHtml content={ps.culturalMeaning.en} />
                </div>
              </div>
            )}
          </div>

          {/* Speakers / Performers Details */}
          {isWorkshop ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Registered Speakers ({ws.speakers?.length || 0})
              </h2>

              <div className="space-y-4">
                {ws.speakers?.map((sp, idx) => (
                  <div key={sp.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">{sp.fullName}</strong>
                      <span className="text-[10px] font-semibold text-slate-500">{sp.country}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{sp.positionTitle} — {sp.organizationName}</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{sp.shortBio?.en}</p>
                    
                    {/* PRIVACY PROTECTED INTERNAL CONTACT */}
                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
                      <span>Internal Email: <strong>{sp.email}</strong></span>
                      {sp.phoneOrWhatsapp && <span>Phone: <strong>{sp.phoneOrWhatsapp}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Internal Representative Contact
              </h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
                <p>Contact Name: <strong className="text-slate-900">{ps.contactPersonName}</strong></p>
                <p>Email: <strong className="text-slate-900">{ps.email}</strong></p>
                {ps.phoneOrWhatsapp && <p>Phone/WhatsApp: <strong className="text-slate-900">{ps.phoneOrWhatsapp}</strong></p>}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Requirements (1 Col) */}
        <div className="space-y-6">
          {/* Cover Image */}
          {(ws.coverImage?.secureUrl || ps.performanceCover?.secureUrl) && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Cover Image
              </h2>
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                <Image
                  src={ws.coverImage?.secureUrl || ps.performanceCover!.secureUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Submitted Material Links (Internal)
            </h2>

            <div className="space-y-2 font-mono text-[11px]">
              {isWorkshop ? (
                <>
                  {ws.slideUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Slide Link</span>
                      <a href={ws.slideUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ws.slideUrl}
                      </a>
                    </div>
                  )}
                  {ws.supportingContentUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Supporting Content Link</span>
                      <a href={ws.supportingContentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ws.supportingContentUrl}
                      </a>
                    </div>
                  )}
                  {ws.referenceUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Reference Link</span>
                      <a href={ws.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ws.referenceUrl}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {ps.backingTrackUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Backing Track Audio Link</span>
                      <a href={ps.backingTrackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ps.backingTrackUrl}
                      </a>
                    </div>
                  )}
                  {ps.demoVideoUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Demo Video Link</span>
                      <a href={ps.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ps.demoVideoUrl}
                      </a>
                    </div>
                  )}
                  {ps.supportingContentUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Supporting Material Link</span>
                      <a href={ps.supportingContentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">
                        {ps.supportingContentUrl}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Technical / Stage Requirements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Operational Requirements
            </h2>

            {isWorkshop ? (
              <ul className="space-y-1.5 text-xs font-medium text-slate-700">
                <li>• Projector: <strong>{ws.technicalRequirements?.projector ? "YES" : "No"}</strong></li>
                <li>• Microphone: <strong>{ws.technicalRequirements?.microphone ? "YES" : "No"}</strong></li>
                <li>• Audio Speakers: <strong>{ws.technicalRequirements?.speakersAudio ? "YES" : "No"}</strong></li>
                <li>• High-speed Internet: <strong>{ws.technicalRequirements?.internet ? "YES" : "No"}</strong></li>
                <li>• Whiteboard: <strong>{ws.technicalRequirements?.whiteboard ? "YES" : "No"}</strong></li>
                {ws.technicalRequirements?.otherEquipment && (
                  <li className="pt-1 text-slate-500">Other: {ws.technicalRequirements.otherEquipment}</li>
                )}
              </ul>
            ) : (
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <p>Performers: <strong>{ps.numberOfPerformers}</strong></p>
                {ps.stageRequirements?.microphonesRequired && (
                  <p>Mics Needed: <strong>{ps.stageRequirements.microphonesRequired}</strong></p>
                )}
                {ps.stageRequirements?.propsOrInstruments && (
                  <p>Props: <strong>{ps.stageRequirements.propsOrInstruments}</strong></p>
                )}
                {ps.stageRequirements?.stageSetupRequirements && (
                  <p className="text-slate-500">Setup: {ps.stageRequirements.stageSetupRequirements}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Changes Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              {admDict.requestChangesBtn}
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Feedback Note for Partner *
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what specific edits are required..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRequestChanges}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
