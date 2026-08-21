"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SummitActivity } from "@/lib/db/models/summit-activity";

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
  locale,
  dict,
}: AdminActivityListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admDict = dict.adminActivities;
  const isVi = locale === "vi";

  const [q, setQ] = useState(queryParam);

  const updateFilters = (newStatus?: string, newType?: string, newQ?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newStatus !== undefined) {
      if (newStatus === "All") params.delete("status");
      else params.set("status", newStatus);
    }

    if (newType !== undefined) {
      if (newType === "All") params.delete("type");
      else params.set("type", newType);
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
        {act.isContentApproved && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ {isVi ? "Đã duyệt" : "Approved"}
          </span>
        )}

        {act.draftStatus === "IN_REVIEW" && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {dict.partnerCms.statusInReview}
          </span>
        )}

        {act.draftStatus === "CHANGES_REQUESTED" && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {dict.partnerCms.statusChangesRequested}
          </span>
        )}

        {act.draftStatus === "DRAFT" && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {act.isContentApproved ? (isVi ? "Bản sửa đổi" : "Draft Edits") : dict.partnerCms.statusDraft}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
              onClick={() => updateFilters(tab.id, undefined, undefined)}
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

        {/* Search & Type Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={activeType}
            onChange={(e) => updateFilters(undefined, e.target.value, undefined)}
            className="p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="All">{admDict.filterAllTypes}</option>
            <option value="WORKSHOP">{admDict.filterWorkshops}</option>
            <option value="STAGE_PERFORMANCE">{admDict.filterPerformances}</option>
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilters(undefined, undefined, q);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or description..."
              className="p-2.5 rounded-xl border border-slate-300 text-xs w-48 focus:ring-2 focus:ring-blue-500"
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
                  <th className="p-4">{admDict.colType}</th>
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
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isWorkshop
                              ? "bg-blue-100 text-blue-900"
                              : "bg-orange-100 text-orange-900"
                          }`}
                        >
                          {isWorkshop ? "Workshop" : "Performance"}
                        </span>
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
