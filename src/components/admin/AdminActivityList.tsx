"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SummitActivity } from "@/lib/db/models/summit-activity";
import { WORKSHOP_TRACKS, getTrackById, type WorkshopTrackId } from "@/lib/config/workshop-tracks";
import { getPerformanceScopeById } from "@/lib/config/performance-scopes";

export interface SerializedAdminActivity extends SummitActivity {
  orgName?: string;
  orgCountry?: string;
}

interface AdminActivityListProps {
  activities: SerializedAdminActivity[];
  total: number;
  page: number;
  totalPages: number;
  activeType: string;
  activeStatus: string;
  queryParam: string;
  trackBalanceSummary?: Record<WorkshopTrackId, { topicProposals: number; topicAccepted: number; finalApproved: number; scheduled: number }>;
  locale: Locale;
  dict: Dictionary;
}

export function AdminActivityList({
  activities,
  total,
  page,
  totalPages,
  activeType,
  activeStatus,
  queryParam,
  trackBalanceSummary,
  locale,
  dict,
}: AdminActivityListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admDict = dict.adminActivities;
  const isVi = locale === "vi";

  const [q, setQ] = useState(queryParam);
  const [selectedTrack, setSelectedTrack] = useState<string>(searchParams.get("trackId") || "All");

  const updateFilters = (newStatus?: string, newType?: string, newTrack?: string, newQ?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newStatus !== undefined) {
      if (newStatus === "All") params.delete("status");
      else params.set("status", newStatus);
    }

    if (newType !== undefined) {
      if (newType === "All") params.delete("type");
      else params.set("type", newType);
    }

    if (newTrack !== undefined) {
      if (newTrack === "All") params.delete("trackId");
      else params.set("trackId", newTrack);
    }

    if (newQ !== undefined) {
      if (!newQ.trim()) params.delete("q");
      else params.set("q", newQ.trim());
    }

    params.set("page", "1");
    router.push(`/${locale}/admin/activities?${params.toString()}`);
  };

  const getStatusBadge = (act: SummitActivity) => {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {act.type === "WORKSHOP" && (
          <>
            {act.topicReviewStatus === "ACCEPTED" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                ✓ {isVi ? "Chủ đề đã duyệt" : "Topic Accepted"}
              </span>
            ) : act.topicReviewStatus === "IN_REVIEW" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                ⏳ {isVi ? "Duyệt chủ đề" : "Topic Pending"}
              </span>
            ) : act.topicReviewStatus === "CHANGES_REQUESTED" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                ⚠ {isVi ? "Sửa chủ đề" : "Topic Revision"}
              </span>
            ) : null}
          </>
        )}

        {act.isContentApproved && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ {isVi ? "Nội dung đã duyệt" : "Content Approved"}
          </span>
        )}

        {act.draftStatus === "IN_REVIEW" && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {dict.partnerCms.statusInReview}
          </span>
        )}

        {act.draftStatus === "CHANGES_REQUESTED" && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {dict.partnerCms.statusChangesRequested}
          </span>
        )}

        {act.draftStatus === "DRAFT" && act.topicReviewStatus !== "IN_REVIEW" && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {act.isContentApproved ? (isVi ? "Bản sửa đổi" : "Draft Edits") : dict.partnerCms.statusDraft}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Track Balance Summary Panel (Correction #4 & #11) */}
      {trackBalanceSummary && (
        <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              📊 Workshop Track Balance Summary (HTQT Content Diversity)
            </span>
            <span className="text-xs text-slate-300 font-medium">
              20 Predefined Slots Planned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {WORKSHOP_TRACKS.map((track) => {
              const stats = trackBalanceSummary[track.id] || { topicProposals: 0, topicAccepted: 0, finalApproved: 0, scheduled: 0 };

              return (
                <div
                  key={track.id}
                  className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 space-y-1 text-xs"
                >
                  <span className="font-bold text-white block truncate text-[11px]" title={track.name[locale]}>
                    {track.name[locale]}
                  </span>
                  <div className="space-y-0.5 text-[10px] text-slate-300 font-medium">
                    <p>Proposals: <strong className="text-white">{stats.topicProposals}</strong></p>
                    <p>Accepted: <strong className="text-blue-300">{stats.topicAccepted}</strong></p>
                    <p>Approved: <strong className="text-emerald-300">{stats.finalApproved}</strong></p>
                    <p>Scheduled: <strong className="text-amber-300">{stats.scheduled}</strong></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
          {[
            { id: "IN_REVIEW", label: admDict.pendingTab },
            { id: "CHANGES_REQUESTED", label: admDict.changesRequestedTab },
            { id: "APPROVED", label: admDict.approvedTab },
            { id: "DRAFT", label: admDict.draftsTab },
            { id: "All", label: admDict.allTab },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilters(tab.id, undefined, undefined, undefined)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeStatus === tab.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Type & Track Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={activeType}
            onChange={(e) => updateFilters(undefined, e.target.value, undefined, undefined)}
            className="p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="All">{admDict.filterAllTypes}</option>
            <option value="WORKSHOP">{admDict.filterWorkshops}</option>
            <option value="STAGE_PERFORMANCE">{admDict.filterPerformances}</option>
          </select>

          {/* Track Filter */}
          <select
            value={selectedTrack}
            onChange={(e) => {
              setSelectedTrack(e.target.value);
              updateFilters(undefined, undefined, e.target.value, undefined);
            }}
            className="p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white max-w-xs"
          >
            <option value="All">All Tracks</option>
            {WORKSHOP_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name[locale]}
              </option>
            ))}
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilters(undefined, undefined, undefined, q);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or description..."
              className="p-2.5 rounded-xl border border-slate-300 text-xs w-44 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Table */}
      {activities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            No activity proposals matching your query.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">{admDict.colOrganization}</th>
                  <th className="p-4">{admDict.colType} / Scope</th>
                  <th className="p-4">{admDict.colTitle}</th>
                  <th className="p-4">{admDict.colStatus}</th>
                  <th className="p-4">{admDict.colSubmittedAt}</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act) => {
                  const id = act._id?.toString();
                  const snap = act.draftSnapshot;
                  const isWorkshop = act.type === "WORKSHOP";
                  const title = (isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "Untitled";

                  const trackDef = isWorkshop ? getTrackById(act.trackId) : undefined;
                  const scopeDef = !isWorkshop ? getPerformanceScopeById(act.performanceScopeId) : undefined;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">
                        {act.orgName || "Partner Organization"}
                        {act.orgCountry && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {act.orgCountry}
                          </span>
                        )}
                      </td>
                      <td className="p-4 space-y-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            isWorkshop
                              ? "bg-blue-100 text-blue-900"
                              : "bg-orange-100 text-orange-900"
                          }`}
                        >
                          {isWorkshop ? "Workshop" : "Performance"}
                        </span>
                        {trackDef && (
                          <span className="block text-[10px] font-semibold text-slate-600 truncate max-w-[150px]">
                            🎯 {trackDef.name[locale]}
                          </span>
                        )}
                        {scopeDef && (
                          <span className="block text-[10px] font-semibold text-orange-700 truncate max-w-[150px]">
                            🎭 {scopeDef.name[locale]}
                          </span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs font-semibold text-slate-800 truncate">
                        {title}
                      </td>
                      <td className="p-4">{getStatusBadge(act)}</td>
                      <td className="p-4 text-slate-600 font-medium">
                        {act.review?.submittedAt
                          ? new Date(act.review.submittedAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")
                          : new Date(act.updatedAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/${locale}/admin/activities/${id}`}
                          className="py-1.5 px-3 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition shadow-2xs"
                        >
                          {admDict.reviewBtn}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>
                Showing page {page} of {totalPages} ({total} items total)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", String(page - 1));
                      router.push(`/${locale}/admin/activities?${params.toString()}`);
                    }}
                    className="py-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Previous
                  </button>
                )}
                {page < totalPages && (
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("page", String(page + 1));
                      router.push(`/${locale}/admin/activities?${params.toString()}`);
                    }}
                    className="py-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
