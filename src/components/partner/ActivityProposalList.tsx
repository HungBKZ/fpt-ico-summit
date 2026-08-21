"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type {
  SummitActivity,
  ActivityType,
  WorkshopSnapshot,
  StagePerformanceSnapshot,
} from "@/lib/db/models/summit-activity";
import { createActivityDraftAction } from "@/app/actions/activity-actions";

interface ActivityProposalListProps {
  activities: SummitActivity[];
  attendanceMetricsMap?: Record<
    string,
    {
      selected: number;
      selectedPresent: number;
      walkIns: number;
      totalPresent: number;
      attendanceRatePercent: number;
    }
  >;
  locale: Locale;
  dict: Dictionary;
}

export function ActivityProposalList({
  activities,
  attendanceMetricsMap,
  locale,
  dict,
}: ActivityProposalListProps) {
  const router = useRouter();
  const actDict = dict.partnerActivities;
  const isVi = locale === "vi";

  const [filterType, setFilterType] = useState<"ALL" | ActivityType>("ALL");
  const [creatingType, setCreatingType] = useState<ActivityType | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async (type: ActivityType) => {
    setCreatingType(type);
    setError("");

    const res = await createActivityDraftAction(type);
    setCreatingType(null);

    if (res.success && res.activityId) {
      router.push(`/${locale}/dashboard/activities/${res.activityId}`);
    } else {
      setError(res.error || "Failed to create activity proposal.");
    }
  };

  const filtered = activities.filter((act) => {
    if (filterType === "ALL") return true;
    return act.type === filterType;
  });

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
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === "ALL"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {actDict.tabsAll} ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("WORKSHOP")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === "WORKSHOP"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {actDict.tabsWorkshops} ({activities.filter((a) => a.type === "WORKSHOP").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("STAGE_PERFORMANCE")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterType === "STAGE_PERFORMANCE"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {actDict.tabsPerformances} ({activities.filter((a) => a.type === "STAGE_PERFORMANCE").length})
          </button>
        </div>

        {/* Creation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={creatingType !== null}
            onClick={() => handleCreate("WORKSHOP")}
            className="py-2.5 px-4 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{creatingType === "WORKSHOP" ? "..." : actDict.proposeWorkshopBtn}</span>
          </button>
          <button
            type="button"
            disabled={creatingType !== null}
            onClick={() => handleCreate("STAGE_PERFORMANCE")}
            className="py-2.5 px-4 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{creatingType === "STAGE_PERFORMANCE" ? "..." : actDict.proposePerformanceBtn}</span>
          </button>
        </div>
      </div>

      {/* Proposal List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
            💡
          </div>
          <p className="text-xs text-slate-500 font-medium">{actDict.emptyList}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((act) => {
            const id = act._id?.toString();
            const snap = act.draftSnapshot;
            const isWorkshop = act.type === "WORKSHOP";
            const wsSnap = snap as WorkshopSnapshot;
            const psSnap = snap as StagePerformanceSnapshot;

            const title = (isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "Untitled Activity";
            const shortDesc = (isVi ? snap.shortDescription?.vi : snap.shortDescription?.en) || snap.shortDescription?.en || "";

            return (
              <div
                key={id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isWorkshop
                            ? "bg-blue-100 text-blue-900"
                            : "bg-orange-100 text-orange-900"
                        }`}
                      >
                        {isWorkshop ? actDict.typeWorkshop : actDict.typePerformance}
                      </span>
                      {getStatusBadge(act)}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {title}
                    </h3>

                    {shortDesc && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {shortDesc}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/${locale}/dashboard/activities/${id}`}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition shrink-0"
                  >
                    {dict.partnerScholarships.editBtn} →
                  </Link>
                </div>

                {/* Metadata Row */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block uppercase font-medium">{actDict.colDuration}</span>
                    <strong className="text-slate-800 font-semibold">{snap.durationMinutes} mins</strong>
                  </div>

                  {isWorkshop ? (
                    <div>
                      <span className="text-slate-400 block uppercase font-medium">Speakers</span>
                      <strong className="text-slate-800 font-semibold">
                        {wsSnap.speakers?.length || 0} speaker(s)
                      </strong>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-400 block uppercase font-medium">Performers</span>
                      <strong className="text-slate-800 font-semibold">
                        {psSnap.numberOfPerformers || 1} performer(s)
                      </strong>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block uppercase font-medium">{actDict.colUpdated}</span>
                    <span className="text-slate-700 font-medium">
                      {new Date(act.updatedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </span>
                  </div>
                </div>

                {/* Aggregate Attendance Metrics Badge for Published Content */}
                {id && attendanceMetricsMap && attendanceMetricsMap[id] && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl font-medium text-slate-700">
                    <span>
                      👥 <strong>Selected:</strong> {attendanceMetricsMap[id].selected}
                    </span>
                    <span>•</span>
                    <span>
                      ✅ <strong>Selected Attended:</strong> {attendanceMetricsMap[id].selectedPresent} ({attendanceMetricsMap[id].attendanceRatePercent}%)
                    </span>
                    <span>•</span>
                    <span>
                      🚶 <strong>Walk-ins:</strong> {attendanceMetricsMap[id].walkIns}
                    </span>
                    <span>•</span>
                    <span>
                      📊 <strong>Total Present:</strong> {attendanceMetricsMap[id].totalPresent}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
