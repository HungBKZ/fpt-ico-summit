"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberSafeActivityDTO } from "@/lib/utils/member-dto";
import { MemberActivityCard } from "./MemberActivityCard";
import { MemberActivityDetailModal } from "./MemberActivityDetailModal";
import { WORKSHOP_TRACKS, type WorkshopTrackId } from "@/lib/config/workshop-tracks";
import {
  selectSummitActivityAction,
  unselectSummitActivityAction,
} from "@/app/actions/activity-selection-actions";

interface MemberActivityBrowserProps {
  activities: MemberSafeActivityDTO[];
  userSelections: string[]; // Array of selected activity IDs
  selectableActivityIds?: string[];
  attendedActivityIds?: string[];
  isRegistered: boolean;
  orgMap: Record<string, { name: string; country: string }>;
  locale: Locale;
  dict: Dictionary;
}

export function MemberActivityBrowser({
  activities,
  userSelections: initialSelections,
  selectableActivityIds,
  attendedActivityIds,
  isRegistered,
  orgMap,
  locale,
  dict,
}: MemberActivityBrowserProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "WORKSHOP" | "STAGE_PERFORMANCE" | "MY_SELECTIONS">("ALL");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<WorkshopTrackId | "ALL">("ALL");
  const [selections, setSelections] = useState<string[]>(initialSelections);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedModalActivity, setSelectedModalActivity] = useState<MemberSafeActivityDTO | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const mDict = dict.memberActivities;

  // Filter activities based on tab & track
  const filteredActivities = activities.filter((act) => {
    if (activeTab === "MY_SELECTIONS") {
      return selections.includes(act._id);
    }
    const isSelectable = selectableActivityIds
      ? selectableActivityIds.includes(act._id)
      : act.isSelectable;

    if (!isSelectable) return false;

    if (activeTab === "WORKSHOP" && act.type !== "WORKSHOP") return false;
    if (activeTab === "STAGE_PERFORMANCE" && act.type !== "STAGE_PERFORMANCE") return false;

    if (selectedTrackFilter !== "ALL" && act.type === "WORKSHOP") {
      if (act.trackId !== selectedTrackFilter) return false;
    }

    return true;
  });

  const getHasConflict = (act: MemberSafeActivityDTO): boolean => {
    if (!selections.includes(act._id) || !act.publishedSchedule) return false;
    const sched = act.publishedSchedule;

    for (const otherId of selections) {
      if (otherId === act._id) continue;
      const other = activities.find((a) => a._id === otherId);
      const otherSched = other?.publishedSchedule;
      if (!otherSched) continue;

      if (sched.dateKey === otherSched.dateKey) {
        if (sched.startTime < otherSched.endTime && sched.endTime > otherSched.startTime) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSelect = async (activityId: string) => {
    setFeedback(null);
    setProcessingId(activityId);

    const res = await selectSummitActivityAction(activityId);
    setProcessingId(null);

    if (res.success) {
      if (!selections.includes(activityId)) {
        setSelections((prev) => [...prev, activityId]);
      }
      setFeedback({ type: "success", msg: "Activity added to your Summit itinerary!" });
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to join activity." });
    }
  };

  const handleUnselect = async (activityId: string) => {
    setFeedback(null);
    setProcessingId(activityId);

    const res = await unselectSummitActivityAction(activityId);
    setProcessingId(null);

    if (res.success) {
      setSelections((prev) => prev.filter((id) => id !== activityId));
      setFeedback({ type: "success", msg: "Activity removed from your itinerary." });
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to remove activity." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy)]">
            {mDict?.title || "Optional Summit Activities"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mDict?.subtitle || "Browse workshops and cultural stage performances. Selection is optional and has no seat quota limits."}
          </p>
        </div>

        {!isRegistered && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              ⚠️ Summit Registration Required to Save Selections
            </p>
            <p className="leading-relaxed">
              You can browse activities, but you must complete your main Summit Registration before adding workshops or stage performances to your itinerary.
            </p>
            <Link
              href={`/${locale}/dashboard/registration`}
              className="inline-flex items-center gap-1 py-1.5 px-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition shadow-2xs mt-1"
            >
              Complete Registration Now →
            </Link>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Tabs & Track Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mDict?.tabAll || "All Activities"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WORKSHOP")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "WORKSHOP"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mDict?.tabWorkshops || "Workshops"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("STAGE_PERFORMANCE")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "STAGE_PERFORMANCE"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mDict?.tabPerformances || "Stage Performances"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MY_SELECTIONS")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "MY_SELECTIONS"
                  ? "bg-[var(--color-navy)] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⭐ {mDict?.tabMySelections || "My Selections"} ({selections.length})
            </button>
          </div>
        </div>

        {/* Workshop Track Filter Buttons */}
        {(activeTab === "ALL" || activeTab === "WORKSHOP") && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedTrackFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                selectedTrackFilter === "ALL"
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Tracks
            </button>
            {WORKSHOP_TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrackFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  selectedTrackFilter === t.id
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                🎯 {t.name[locale]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Activity Cards */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            {activeTab === "MY_SELECTIONS"
              ? "You haven't selected any optional activities yet."
              : "No activities available for the selected category/track."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((act) => {
            const isSelected = selections.includes(act._id);
            const isAttended = Boolean(attendedActivityIds && attendedActivityIds.includes(act._id));
            const hasConflict = getHasConflict(act);
            const isProcessing = processingId === act._id;
            const org = orgMap[act.organizationId];

            return (
              <MemberActivityCard
                key={act._id}
                activity={act}
                isSelected={isSelected}
                isAttended={isAttended}
                hasConflict={hasConflict}
                isProcessing={isProcessing}
                isRegistered={isRegistered}
                organizationName={org?.name || "Institution"}
                organizationCountry={org?.country || "Global"}
                locale={locale}
                onSelect={() => handleSelect(act._id)}
                onUnselect={() => handleUnselect(act._id)}
                onViewDetails={() => setSelectedModalActivity(act)}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedModalActivity && (
        <MemberActivityDetailModal
          activity={selectedModalActivity}
          isSelected={selections.includes(selectedModalActivity._id)}
          isProcessing={processingId === selectedModalActivity._id}
          isRegistered={isRegistered}
          orgName={orgMap[selectedModalActivity.organizationId]?.name || "Institution"}
          orgCountry={orgMap[selectedModalActivity.organizationId]?.country || "Global"}
          locale={locale}
          dict={dict}
          onClose={() => setSelectedModalActivity(null)}
          onSelect={() => handleSelect(selectedModalActivity._id)}
          onUnselect={() => handleUnselect(selectedModalActivity._id)}
        />
      )}
    </div>
  );
}
