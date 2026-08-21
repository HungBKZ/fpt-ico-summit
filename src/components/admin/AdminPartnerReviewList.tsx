"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/i18n/types";
import type { Organization, DraftStatus } from "@/lib/db/models/organization";
import {
  requestPartnerChangesAction,
  approveAndPublishPartnerAction,
} from "@/app/actions/partner-actions";

interface AdminPartnerReviewListProps {
  initialOrganizations: Organization[];
  dict: Dictionary;
}

export function AdminPartnerReviewList({
  initialOrganizations,
  dict,
}: AdminPartnerReviewListProps) {
  const searchParams = useSearchParams();
  const adminDict = dict.adminPartnerContent;
  const cms = dict.partnerCms;

  const initialTabParam = searchParams.get("tab");
  const defaultTab = (
    initialTabParam && ["IN_REVIEW", "PUBLISHED", "CHANGES_REQUESTED", "DRAFT", "ALL"].includes(initialTabParam)
      ? initialTabParam
      : "IN_REVIEW"
  ) as DraftStatus | "PUBLISHED" | "ALL";

  const targetOrgId = searchParams.get("organization");

  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [activeTab, setActiveTab] = useState<DraftStatus | "PUBLISHED" | "ALL">(defaultTab);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(() => {
    if (targetOrgId) {
      return initialOrganizations.find((o) => String(o._id) === targetOrgId) || null;
    }
    return null;
  });
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const [viewingTab, setViewingTab] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const filteredOrgs = organizations.filter((org) => {
    if (activeTab === "PUBLISHED") return org.isPublished;
    if (activeTab === "ALL") return true;
    return org.draftStatus === activeTab;
  });

  const handleApproveAndPublish = async (orgId: string) => {
    setLoadingOrgId(orgId);
    const res = await approveAndPublishPartnerAction(orgId);
    setLoadingOrgId(null);

    if (res.success) {
      setOrganizations((prev) =>
        prev.map((o) =>
          String(o._id) === orgId
            ? {
                ...o,
                isPublished: true,
                draftStatus: "NONE",
                publishedProfile: o.draftProfile || o.publishedProfile,
              }
            : o
        )
      );
      if (selectedOrg && String(selectedOrg._id) === orgId) {
        setSelectedOrg(null);
      }
    } else {
      alert(res.error || "Failed to publish profile.");
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedOrg || !feedbackInput.trim()) return;

    const orgId = String(selectedOrg._id);
    setLoadingOrgId(orgId);
    const res = await requestPartnerChangesAction(orgId, feedbackInput);
    setLoadingOrgId(null);

    if (res.success) {
      setOrganizations((prev) =>
        prev.map((o) =>
          String(o._id) === orgId
            ? { ...o, draftStatus: "CHANGES_REQUESTED" }
            : o
        )
      );
      setShowChangesModal(false);
      setSelectedOrg(null);
      setFeedbackInput("");
    } else {
      alert(res.error || "Failed to send request.");
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {[
          { key: "IN_REVIEW", label: adminDict.pendingTab },
          { key: "PUBLISHED", label: adminDict.publishedTab },
          { key: "CHANGES_REQUESTED", label: adminDict.changesRequestedTab },
          { key: "DRAFT", label: adminDict.draftsTab },
          { key: "ALL", label: "All Records" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as typeof activeTab)}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === t.key
                ? "bg-[var(--color-navy)] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Organization Cards / Table */}
      <div className="space-y-4">
        {filteredOrgs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            No partner organizations match the selected tab filter.
          </div>
        ) : (
          filteredOrgs.map((org) => {
            const orgId = String(org._id);
            const isLoading = loadingOrgId === orgId;
            const profileToDisplay = org.draftProfile || org.publishedProfile;

            return (
              <div
                key={orgId}
                className="p-5 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-4 min-w-[240px]">
                  {profileToDisplay?.logoUrl ? (
                    <div className="w-12 h-12 relative rounded-lg border border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                      <Image
                        src={profileToDisplay.logoUrl}
                        alt={org.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 border border-slate-200">
                      {org.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{org.name}</h3>
                    <p className="text-xs text-slate-500">
                      {org.type} • {org.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {org.draftStatus === "CHANGES_REQUESTED" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {cms.statusChangesRequested}
                    </span>
                  ) : org.draftStatus === "IN_REVIEW" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {cms.statusInReview}
                    </span>
                  ) : org.isPublished && org.draftStatus === "NONE" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {cms.statusPublished}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {cms.statusDraft}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrg(org);
                      setViewingTab("DRAFT");
                    }}
                    className="py-1.5 px-3 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                  >
                    {adminDict.reviewBtn}
                  </button>

                  {org.draftStatus === "IN_REVIEW" && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleApproveAndPublish(orgId)}
                      className="py-1.5 px-3.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {isLoading ? adminDict.publishing : adminDict.approvePublishBtn}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Inspection Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{adminDict.modalTitle}</h2>
                <p className="text-xs text-slate-500">
                  {selectedOrg.name} ({selectedOrg.type} • {selectedOrg.country})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Toggle view: Submitted Draft vs Currently Published */}
            {selectedOrg.isPublished && selectedOrg.publishedProfile && (
              <div className="flex gap-2 my-4">
                <button
                  type="button"
                  onClick={() => setViewingTab("DRAFT")}
                  className={`py-1 px-3 text-xs font-semibold rounded-md border ${
                    viewingTab === "DRAFT"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {adminDict.draftTab} ({selectedOrg.draftStatus})
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
                  {adminDict.publishedTabModal}
                </button>
              </div>
            )}

            {/* Content Snapshot Body */}
            {(() => {
              const snap =
                viewingTab === "PUBLISHED" && selectedOrg.publishedProfile
                  ? selectedOrg.publishedProfile
                  : selectedOrg.draftProfile || selectedOrg.publishedProfile;

              if (!snap) {
                return (
                  <p className="py-6 text-xs text-slate-500 italic">No content snapshot available.</p>
                );
              }

              return (
                <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
                  {/* Media & Links */}
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 border-b pb-1 text-xs">Media & Links</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Logo Preview */}
                      <div>
                        <span className="text-slate-500 block mb-1 font-semibold">Logo</span>
                        {snap.logo?.secureUrl || snap.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 relative rounded-lg border border-slate-200 bg-white p-1 overflow-hidden shrink-0">
                              <Image
                                src={snap.logo?.secureUrl || snap.logoUrl!}
                                alt="Logo preview"
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <a
                              href={snap.logo?.secureUrl || snap.logoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline text-[11px] truncate max-w-[140px]"
                            >
                              View File ↗
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No logo provided</span>
                        )}
                      </div>

                      {/* Showcase Cover Preview */}
                      <div>
                        <span className="text-slate-500 block mb-1 font-semibold">Showcase Cover Image</span>
                        {snap.coverImage?.secureUrl ? (
                          <div className="space-y-1">
                            <div className="aspect-video w-full relative rounded-lg border border-slate-200 bg-slate-900 overflow-hidden">
                              <Image
                                src={snap.coverImage.secureUrl}
                                alt="Cover preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <a
                              href={snap.coverImage.secureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline text-[11px] block truncate"
                            >
                              View Full Cover ↗
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No showcase cover uploaded</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1 font-semibold">Website URL</span>
                      {snap.websiteUrl ? (
                        <a
                          href={snap.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {snap.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </div>
                  </div>

                  {/* Public Contact */}
                  {snap.publicContact && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block mb-2 font-semibold">Public Contact</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-slate-400 block">Email</span>
                          <span>{snap.publicContact.email || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Phone</span>
                          <span>{snap.publicContact.phone || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Address</span>
                          <span>{snap.publicContact.address || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* English Content */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 border-b pb-1">English Content</h4>
                    <div>
                      <span className="font-semibold text-slate-700 block">Short Description</span>
                      <p className="text-slate-600">{snap.content?.en?.shortDescription || "-"}</p>
                    </div>
                    {snap.content?.en?.description && (
                      <div>
                        <span className="font-semibold text-slate-700 block">Full Overview</span>
                        <p className="text-slate-600 whitespace-pre-wrap">{snap.content.en.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Vietnamese Content */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 border-b pb-1">Vietnamese Content</h4>
                    <div>
                      <span className="font-semibold text-slate-700 block">Short Description</span>
                      <p className="text-slate-600">{snap.content?.vi?.shortDescription || "-"}</p>
                    </div>
                    {snap.content?.vi?.description && (
                      <div>
                        <span className="font-semibold text-slate-700 block">Full Overview</span>
                        <p className="text-slate-600 whitespace-pre-wrap">{snap.content.vi.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Modal Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                {adminDict.closeBtn}
              </button>

              {selectedOrg.draftStatus === "IN_REVIEW" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangesModal(true)}
                    className="py-2 px-4 bg-amber-600 text-white font-semibold text-xs rounded-xl hover:bg-amber-700 transition"
                  >
                    {adminDict.requestChangesBtn}
                  </button>

                  <button
                    type="button"
                    disabled={loadingOrgId === String(selectedOrg._id)}
                    onClick={() => handleApproveAndPublish(String(selectedOrg._id))}
                    className="py-2 px-4 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {loadingOrgId === String(selectedOrg._id)
                      ? adminDict.publishing
                      : adminDict.approvePublishBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Feedback Modal */}
      {showChangesModal && selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Request Changes for {selectedOrg.name}
            </h3>

            <p className="text-xs text-slate-600">
              Please provide clear feedback for the partner explaining what changes are required before approval.
            </p>

            <textarea
              rows={4}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="e.g., Please update the Vietnamese short description to be more concise and ensure the official website link is active..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChangesModal(false)}
                className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!feedbackInput.trim() || loadingOrgId === String(selectedOrg._id)}
                onClick={handleSendFeedback}
                className="py-2 px-4 bg-amber-600 text-white font-semibold text-xs rounded-xl hover:bg-amber-700 transition disabled:opacity-50"
              >
                {loadingOrgId === String(selectedOrg._id)
                  ? adminDict.requestingChanges
                  : "Send Feedback & Request Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
