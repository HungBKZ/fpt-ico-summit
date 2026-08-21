"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/i18n/types";
import type { Scholarship } from "@/lib/db/models/scholarship";
import type { DraftStatus } from "@/lib/db/models/organization";
import { formatDateAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import {
  approveAndPublishScholarshipAction,
  requestScholarshipChangesAction,
} from "@/app/actions/scholarship-actions";
import { SafeHtml } from "@/components/ui/SafeHtml";

export interface EnrichedScholarship extends Scholarship {
  organizationName: string;
  organizationType: string;
  organizationCountry: string;
  organizationLogoUrl?: string;
}

interface AdminScholarshipReviewListProps {
  initialScholarships: EnrichedScholarship[];
  dict: Dictionary;
}

export function AdminScholarshipReviewList({
  initialScholarships,
  dict,
}: AdminScholarshipReviewListProps) {
  const searchParams = useSearchParams();
  const adminDict = dict.adminScholarships;
  const cms = dict.partnerCms;

  const initialTabParam = searchParams.get("tab");
  const defaultTab = (
    initialTabParam && ["IN_REVIEW", "PUBLISHED", "CHANGES_REQUESTED", "DRAFT", "ALL"].includes(initialTabParam)
      ? initialTabParam
      : "IN_REVIEW"
  ) as DraftStatus | "PUBLISHED" | "ALL";

  const targetScholarshipId = searchParams.get("scholarship");

  const [scholarships, setScholarships] = useState<EnrichedScholarship[]>(initialScholarships);
  const [activeTab, setActiveTab] = useState<DraftStatus | "PUBLISHED" | "ALL">(defaultTab);
  const [selectedScholarship, setSelectedScholarship] = useState<EnrichedScholarship | null>(() => {
    if (targetScholarshipId) {
      return initialScholarships.find((s) => String(s._id) === targetScholarshipId) || null;
    }
    return null;
  });
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewingTab, setViewingTab] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [actionError, setActionError] = useState("");

  const filteredScholarships = scholarships.filter((s) => {
    if (activeTab === "PUBLISHED") return s.isPublished;
    if (activeTab === "ALL") return true;
    return s.draftStatus === activeTab;
  });

  const handleApproveAndPublish = async (scholarshipIdStr: string) => {
    setLoadingId(scholarshipIdStr);
    setActionError("");

    const res = await approveAndPublishScholarshipAction(scholarshipIdStr);
    setLoadingId(null);

    if (res.success) {
      setScholarships((prev) =>
        prev.map((s) => {
          if (String(s._id) === scholarshipIdStr) {
            return {
              ...s,
              isPublished: true,
              draftStatus: "NONE" as DraftStatus,
              publishedSnapshot: s.draftSnapshot || s.publishedSnapshot,
              publishedAt: new Date(),
            };
          }
          return s;
        })
      );
      setSelectedScholarship(null);
    } else {
      setActionError(res.error || "Failed to publish scholarship.");
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedScholarship || !selectedScholarship._id) return;
    if (!feedbackInput.trim()) {
      setActionError(dict.adminPartnerContent.feedbackRequired);
      return;
    }

    const idStr = String(selectedScholarship._id);
    setLoadingId(idStr);
    setActionError("");

    const res = await requestScholarshipChangesAction(idStr, feedbackInput.trim());
    setLoadingId(null);

    if (res.success) {
      setScholarships((prev) =>
        prev.map((s) => {
          if (String(s._id) === idStr) {
            return {
              ...s,
              draftStatus: "CHANGES_REQUESTED" as DraftStatus,
              review: {
                ...s.review,
                feedback: feedbackInput.trim(),
                reviewedAt: new Date(),
              },
            };
          }
          return s;
        })
      );
      setShowChangesModal(false);
      setSelectedScholarship(null);
      setFeedbackInput("");
    } else {
      setActionError(res.error || "Failed to request changes.");
    }
  };

  const renderStatusPill = (s: Scholarship) => {
    if (s.draftStatus === "CHANGES_REQUESTED") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          {cms.statusChangesRequested}
        </span>
      );
    }
    if (s.draftStatus === "IN_REVIEW") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          {cms.statusInReview}
        </span>
      );
    }
    if (s.isPublished && s.draftStatus === "NONE") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {cms.statusPublished}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {cms.statusDraft}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto font-semibold">
        {[
          { key: "IN_REVIEW", label: adminDict.pendingTab },
          { key: "CHANGES_REQUESTED", label: adminDict.changesRequestedTab },
          { key: "PUBLISHED", label: adminDict.publishedTab },
          { key: "DRAFT", label: adminDict.draftsTab },
          { key: "ALL", label: adminDict.allTab },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as DraftStatus | "PUBLISHED" | "ALL")}
            className={`py-1.5 px-3.5 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[var(--color-navy)] text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-xl">
          {actionError}
        </div>
      )}

      {/* Review Table / Cards */}
      {filteredScholarships.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-semibold">No scholarship submissions match this filter.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {filteredScholarships.map((s) => {
            const snap = s.draftSnapshot || s.publishedSnapshot;
            const titleEn = snap?.title?.en || "Untitled";
            const titleVi = snap?.title?.vi || "Chưa có tiêu đề";
            const bannerUrl = snap?.banner?.secureUrl;
            const deadlineStr = formatDateAsiaHoChiMinh(snap?.applicationDeadline, "en");

            return (
              <div
                key={s._id?.toString()}
                className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center gap-4">
                  {bannerUrl ? (
                    <div className="w-16 h-10 relative rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shrink-0">
                      <Image
                        src={bannerUrl}
                        alt={titleEn}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                      {snap?.type === "LONG_TERM" ? "LONG" : "SHORT"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{titleEn}</h4>
                      <span className="text-slate-400">/</span>
                      <h5 className="font-semibold text-slate-600 text-xs">{titleVi}</h5>
                      {renderStatusPill(s)}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Provider: <strong className="text-slate-700">{s.organizationName}</strong> ({s.organizationCountry}) • Deadline: {deadlineStr || "Rolling"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedScholarship(s);
                    setViewingTab("DRAFT");
                    setActionError("");
                  }}
                  className="py-2 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition shadow-2xs"
                >
                  {adminDict.reviewBtn} →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspection Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  {selectedScholarship.organizationName} ({selectedScholarship.organizationCountry})
                </span>
                <h3 className="text-base font-bold text-slate-900">{adminDict.modalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScholarship(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Toggle view: Submitted Draft vs Currently Published */}
            {selectedScholarship.isPublished && selectedScholarship.publishedSnapshot && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewingTab("DRAFT")}
                  className={`py-1 px-3 text-xs font-semibold rounded-md border ${
                    viewingTab === "DRAFT"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  Submitted Draft ({selectedScholarship.draftStatus})
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTab("PUBLISHED")}
                  className={`py-1 px-3 text-xs font-semibold rounded-md border ${
                    viewingTab === "PUBLISHED"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  Currently Published
                </button>
              </div>
            )}

            {/* Content Body */}
            {(() => {
              const snap =
                viewingTab === "PUBLISHED" && selectedScholarship.publishedSnapshot
                  ? selectedScholarship.publishedSnapshot
                  : selectedScholarship.draftSnapshot || selectedScholarship.publishedSnapshot;

              if (!snap) return <p className="text-slate-500 italic">No snapshot content available.</p>;

              return (
                <div className="space-y-4">
                  {/* Banner */}
                  {snap.banner?.secureUrl && (
                    <div className="aspect-video max-w-md w-full relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <Image
                        src={snap.banner.secureUrl}
                        alt="Scholarship banner preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Title & Type */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block font-semibold">Title (EN)</span>
                      <span className="font-bold text-slate-900">{snap.title?.en || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Title (VI)</span>
                      <span className="font-bold text-slate-900">{snap.title?.vi || "Not provided — English content will be used."}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Type</span>
                      <span className="font-bold text-blue-700">{snap.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Application Deadline</span>
                      <span className="font-bold text-slate-900">
                        {formatDateAsiaHoChiMinh(snap.applicationDeadline, "en") || "Rolling Admission"}
                      </span>
                    </div>
                  </div>

                  {/* Short Descriptions */}
                  <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block font-semibold">Short Description (EN)</span>
                      <p className="text-slate-800 mt-0.5">{snap.shortDescription?.en || "Not provided"}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block font-semibold">Short Description (VI)</span>
                      <p className="text-slate-800 mt-0.5">{snap.shortDescription?.vi || "Not provided — English content will be used."}</p>
                    </div>
                  </div>

                  {/* Full Descriptions (Rich Text) */}
                  {(snap.fullDescription?.en || snap.fullDescription?.vi) && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block font-semibold mb-1">Full Description (EN)</span>
                        <SafeHtml content={snap.fullDescription?.en} fallbackText="Not provided" />
                      </div>
                      {snap.fullDescription?.vi && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500 block font-semibold mb-1">Full Description (VI)</span>
                          <SafeHtml content={snap.fullDescription?.vi} fallbackText="Not provided" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Funding & Financial Support (Rich Text) */}
                  {(snap.fundingSummary?.en || snap.fundingSummary?.vi) && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block font-semibold mb-1">Funding & Financial Support (EN)</span>
                        <SafeHtml content={snap.fundingSummary?.en} fallbackText="Not provided" />
                      </div>
                      {snap.fundingSummary?.vi && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500 block font-semibold mb-1">Funding & Financial Support (VI)</span>
                          <SafeHtml content={snap.fundingSummary?.vi} fallbackText="Not provided" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Eligibility Criteria (Rich Text) */}
                  {(snap.eligibility?.en || snap.eligibility?.vi) && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block font-semibold mb-1">Eligibility Criteria (EN)</span>
                        <SafeHtml content={snap.eligibility?.en} fallbackText="Not provided" />
                      </div>
                      {snap.eligibility?.vi && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500 block font-semibold mb-1">Eligibility Criteria (VI)</span>
                          <SafeHtml content={snap.eligibility?.vi} fallbackText="Not provided" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Official URL */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold mb-1">Official Application Link</span>
                    <a
                      href={snap.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-bold break-all"
                    >
                      {snap.officialUrl} ↗
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* Modal Action Buttons */}
            {selectedScholarship.draftStatus === "IN_REVIEW" && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={loadingId === String(selectedScholarship._id)}
                  onClick={() => setShowChangesModal(true)}
                  className="py-2.5 px-4 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition"
                >
                  {adminDict.requestChangesBtn}
                </button>

                <button
                  type="button"
                  disabled={loadingId === String(selectedScholarship._id)}
                  onClick={() => handleApproveAndPublish(String(selectedScholarship._id))}
                  className="py-2.5 px-6 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  {loadingId === String(selectedScholarship._id) ? "Publishing..." : adminDict.approveBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Changes Feedback Modal */}
      {showChangesModal && selectedScholarship && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-rose-800">Request Changes with Feedback</h3>
            <p className="text-xs text-slate-600">
              Specify what corrections the partner must make before resubmitting.
            </p>

            <textarea
              rows={4}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="e.g. Please update the official application link and provide Vietnamese funding summary..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowChangesModal(false);
                  setFeedbackInput("");
                }}
                className="py-2 px-4 bg-white text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestChanges}
                disabled={loadingId === String(selectedScholarship._id)}
                className="py-2 px-4 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
