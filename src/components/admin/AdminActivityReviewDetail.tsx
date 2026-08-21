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
import {
  requestActivityChangesAction,
  approveActivityContentAction,
  reviewTopicProposalAction,
} from "@/app/actions/activity-actions";
import { SafeHtml } from "@/components/ui/SafeHtml";
import { getTrackById } from "@/lib/config/workshop-tracks";
import { getPerformanceScopeById } from "@/lib/config/performance-scopes";

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

  const trackDef = isWorkshop ? getTrackById(activity.trackId) : undefined;
  const scopeDef = !isWorkshop ? getPerformanceScopeById(activity.performanceScopeId) : undefined;

  const [feedback, setFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTopicRejectModal, setShowTopicRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Stage A: Admin accepts Topic Proposal
  const handleAcceptTopic = async () => {
    setSubmitting(true);
    setError("");

    const res = await reviewTopicProposalAction(activity._id!.toString(), "ACCEPT");
    setSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Failed to accept topic proposal.");
    }
  };

  // Stage A: Admin requests topic changes
  const handleRequestTopicChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError(admDict.feedbackRequired);
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await reviewTopicProposalAction(activity._id!.toString(), "REQUEST_CHANGES", feedback);
    setSubmitting(false);

    if (res.success) {
      setShowTopicRejectModal(false);
      router.refresh();
    } else {
      setError(res.error || "Failed to request topic changes.");
    }
  };

  // Stage B: Admin approves Final Content
  const handleApproveContent = async () => {
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

  // Stage B: Admin requests content changes
  const handleRequestContentChanges = async (e: React.FormEvent) => {
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
      setError(res.error || "Failed to request content changes.");
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isWorkshop
                  ? "bg-blue-100 text-blue-900"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>

            {trackDef && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                🎯 Track: {trackDef.name[locale]}
              </span>
            )}

            {scopeDef && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                🎭 Scope: {scopeDef.name[locale]}
              </span>
            )}

            <span className="text-xs font-semibold text-slate-500">
              Provider: <strong className="text-slate-900">{activity.orgName || "Organization"}</strong> ({activity.orgCountry || "Global"})
            </span>
          </div>

          <h1 className="text-lg font-bold text-[var(--color-navy)]">
            {(isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "Untitled Activity"}
          </h1>
        </div>

        {/* Stage B Content Approval Action Buttons */}
        <div className="flex items-center gap-2">
          {activity.draftStatus === "IN_REVIEW" && (
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
                onClick={handleApproveContent}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                {submitting ? "Approving..." : "Approve Final Content"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stage A Topic Proposal Review Box (For Workshops) */}
      {isWorkshop && (
        <div className="p-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                STAGE A: WORKSHOP TOPIC PROPOSAL REVIEW
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                Topic Scope: {trackDef?.name[locale] || "General Track"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {activity.topicReviewStatus === "ACCEPTED" ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-full text-xs">
                  ✓ Topic Accepted & Locked
                </span>
              ) : activity.topicReviewStatus === "IN_REVIEW" ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-full text-xs">
                  ⏳ Topic Review Pending
                </span>
              ) : activity.topicReviewStatus === "CHANGES_REQUESTED" ? (
                <span className="px-3 py-1 bg-rose-100 text-rose-900 border border-rose-300 font-bold rounded-full text-xs">
                  ⚠ Topic Changes Requested
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-blue-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase">Selected Track</span>
              <strong className="text-slate-900">{trackDef?.name[locale]}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-medium block uppercase">Topic Selection Type</span>
              <strong className="text-slate-900">
                {activity.topicSelectionType === "CUSTOM" ? "Custom Proposed Topic" : "Pre-approved Suggested Topic"}
              </strong>
            </div>

            {activity.customTopicTitle && (
              <div className="md:col-span-2 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Custom Topic Rationale</span>
                <p className="font-bold text-slate-900">{activity.customTopicTitle}</p>
                <p className="text-slate-700 text-xs">{activity.customTopicFitReason}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <span className="text-[10px] text-slate-400 font-medium block uppercase">Tentative Title & Concept Rationale</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{ws.title?.en}</p>
              <p className="text-slate-700 text-xs mt-1 leading-relaxed">{ws.shortDescription?.en}</p>
            </div>
          </div>

          {/* Stage A Topic Decision Buttons */}
          {activity.topicReviewStatus === "IN_REVIEW" && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowTopicRejectModal(true)}
                className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs"
              >
                Request Topic Changes
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleAcceptTopic}
                className="py-2 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                {submitting ? "Accepting..." : "Accept Topic Proposal (Stage A) ✓"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inspection Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary & Descriptions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              STAGE B: FINAL CONTENT & AGENDA DETAILS
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
                  {ws.materialSharingPermission && (
                    <div className="pt-2 border-t border-slate-100 font-sans">
                      <span className="text-[10px] text-slate-400 block uppercase">Sharing Permission</span>
                      <strong className="text-blue-900 font-bold">{ws.materialSharingPermission}</strong>
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
                </>
              )}
            </div>
          </div>

          {/* Operational Requirements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Operational Requirements
            </h2>

            {isWorkshop ? (
              <ul className="space-y-1.5 text-xs font-medium text-slate-700">
                <li>• Session Duration: <strong>30 mins (Fixed)</strong></li>
                <li>• Interpretation: <strong>{ws.interpretationRequired ? `YES (${ws.interpretationNotes || ""})` : "No"}</strong></li>
                <li>• Projector: <strong>{ws.technicalRequirements?.projector ? "YES" : "No"}</strong></li>
                <li>• Microphone: <strong>{ws.technicalRequirements?.microphone ? "YES" : "No"}</strong></li>
                <li>• Audio Speakers: <strong>{ws.technicalRequirements?.speakersAudio ? "YES" : "No"}</strong></li>
                <li>• High-speed Internet: <strong>{ws.technicalRequirements?.internet ? "YES" : "No"}</strong></li>
                <li>• Whiteboard: <strong>{ws.technicalRequirements?.whiteboard ? "YES" : "No"}</strong></li>
              </ul>
            ) : (
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <p>Performers: <strong>{ps.numberOfPerformers}</strong></p>
                <p>Duration: <strong>{ps.durationMinutes} mins</strong></p>
                {ps.stageRequirements?.microphonesRequired && (
                  <p>Mics Needed: <strong>{ps.stageRequirements.microphonesRequired}</strong></p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage A Topic Reject Modal */}
      {showTopicRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              Request Workshop Topic Changes (Stage A)
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Feedback Note for Partner *
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what specific edits are required for the topic proposal..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTopicRejectModal(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRequestTopicChanges}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                {submitting ? "Sending..." : "Send Topic Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage B Content Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              Request Final Content Changes (Stage B)
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Feedback Note for Partner *
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what specific content edits are required..."
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
                onClick={handleRequestContentChanges}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                {submitting ? "Sending..." : "Send Content Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
