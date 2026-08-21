"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberSafeActivityDTO } from "@/lib/utils/member-dto";
import { MemberActivityCard } from "./MemberActivityCard";
import { MemberActivityDetailModal } from "./MemberActivityDetailModal";
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
  const [selections, setSelections] = useState<string[]>(initialSelections);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedModalActivity, setSelectedModalActivity] = useState<MemberSafeActivityDTO | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const mDict = dict.memberActivities;

  // Filter activities based on tab
  const filteredActivities = activities.filter((act) => {
    if (activeTab === "MY_SELECTIONS") {
      return selections.includes(act._id);
    }
    // Only show activities eligible for selection in selectable tabs
    const isSelectable = selectableActivityIds
      ? selectableActivityIds.includes(act._id)
      : act.isSelectable;

    if (!isSelectable) return false;

    if (activeTab === "WORKSHOP") return act.type === "WORKSHOP";
    if (activeTab === "STAGE_PERFORMANCE") return act.type === "STAGE_PERFORMANCE";
    return true;
  });

  // Calculate schedule conflicts among current selections (republished schedule detection)
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
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
            {mDict?.subtitle ||
              "Workshops and Stage Performances are optional activities within the FPT ICO Summit. You may join one, multiple, or none of these activities."}
          </p>
        </div>

        {/* Registration Requirement Notice */}
        {!isRegistered && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex flex-wrap items-center justify-between gap-3">
            <span>⚠️ {mDict?.mustRegisterNotice || "Please register for FPT ICO Summit before selecting optional activities."}</span>
            <Link
              href={`/${locale}/dashboard/registration`}
              className="px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg text-xs font-bold hover:opacity-90 transition"
            >
              Register Now →
            </Link>
          </div>
        )}
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

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: mDict?.tabAll || "All Activities" },
            { id: "WORKSHOP", label: mDict?.tabWorkshops || "Workshops" },
            { id: "STAGE_PERFORMANCE", label: mDict?.tabPerformances || "Stage Performances" },
            {
              id: "MY_SELECTIONS",
              label: `${mDict?.tabMySelections || "My Selections"} (${selections.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium px-3 hidden sm:inline">
          Showing {filteredActivities.length} activities
        </span>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium text-xs">
            {activeTab === "MY_SELECTIONS"
              ? "You have not selected any optional activities yet. Browse Workshops & Performances to add them to your itinerary!"
              : "No optional activities are currently available in this category."}
          </div>
        ) : (
          filteredActivities.map((act) => {
            const org = orgMap[act.organizationId] || { name: "Institution", country: "" };
            const isSel = selections.includes(act._id);
            const hasConflict = getHasConflict(act);

            const hasAttended = Boolean(attendedActivityIds?.includes(act._id));

            return (
              <MemberActivityCard
                key={act._id}
                activity={act}
                orgName={org.name}
                orgCountry={org.country}
                isSelected={isSel}
                isRegistered={isRegistered}
                hasScheduleConflict={hasConflict}
                hasAttended={hasAttended}
                onSelect={handleSelect}
                onUnselect={handleUnselect}
                onViewDetails={(activity) => setSelectedModalActivity(activity)}
                isProcessing={processingId === act._id}
                locale={locale}
                dict={dict}
              />
            );
          })
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedModalActivity && (
        <MemberActivityDetailModal
          activity={selectedModalActivity}
          orgName={orgMap[selectedModalActivity.organizationId]?.name || "Institution"}
          orgCountry={orgMap[selectedModalActivity.organizationId]?.country || ""}
          isSelected={selections.includes(selectedModalActivity._id)}
          isRegistered={isRegistered}
          onClose={() => setSelectedModalActivity(null)}
          onSelect={handleSelect}
          onUnselect={handleUnselect}
          isProcessing={processingId === selectedModalActivity._id}
          locale={locale}
          dict={dict}
        />
      )}
    </div>
  );
}
