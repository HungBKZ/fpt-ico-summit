"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import type { SummitActivity, WorkshopSnapshot, StagePerformanceSnapshot } from "@/lib/db/models/summit-activity";
import {
  saveActivityScheduleAction,
  publishActivityScheduleAction,
} from "@/app/actions/staff-actions";

interface StaffSchedulingConsoleProps {
  editionDays: string[];
  activities: SummitActivity[];
  stats: {
    unscheduled: number;
    scheduled: number;
    published: number;
  };
  orgMap: Record<string, { name: string; country: string }>;
  selectionCounts?: Record<string, number>;
  locale: Locale;
  dict: Dictionary;
}

export function StaffSchedulingConsole({
  editionDays,
  activities: initialActivities,
  stats,
  orgMap,
  selectionCounts,
  locale,
}: StaffSchedulingConsoleProps) {
  const router = useRouter();
  const [activitiesList, setActivitiesList] = useState<SummitActivity[]>(initialActivities);
  const [activeTab, setActiveTab] = useState<"WORKSHOP" | "STAGE_PERFORMANCE">("WORKSHOP");
  const [statusFilter, setStatusFilter] = useState<"All" | "UNSCHEDULED" | "DRAFT_ONLY" | "PUBLISHED">("All");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [prevInitial, setPrevInitial] = useState(initialActivities);
  if (prevInitial !== initialActivities) {
    setPrevInitial(initialActivities);
    setActivitiesList(initialActivities);
  }

  // Filter activities
  const filteredActivities = activitiesList.filter((act) => {
    if (act.type !== activeTab) return false;
    if (statusFilter === "UNSCHEDULED") {
      return !act.scheduleDraft && !act.publishedSchedule;
    }
    if (statusFilter === "DRAFT_ONLY") {
      return Boolean(act.scheduleDraft);
    }
    if (statusFilter === "PUBLISHED") {
      return Boolean(act.publishedSchedule);
    }
    return true;
  });

  const selectedActivity = activitiesList.find((a) => a._id?.toString() === selectedActivityId);

  // Form states for selected activity
  const [dateKey, setDateKey] = useState(
    selectedActivity?.scheduleDraft?.dateKey || (editionDays.length > 0 ? editionDays[0] : "")
  );
  const [startTime, setStartTime] = useState(selectedActivity?.scheduleDraft?.startTime || "09:00");
  const [endTime, setEndTime] = useState(selectedActivity?.scheduleDraft?.endTime || "10:00");
  const [venue, setVenue] = useState(selectedActivity?.scheduleDraft?.venue || "");
  const [operationalNotes, setOperationalNotes] = useState(
    selectedActivity?.scheduleDraft?.operationalNotes || ""
  );

  const handleSelectActivity = (act: SummitActivity) => {
    const idStr = act._id!.toString();
    setSelectedActivityId(idStr);
    setFeedback(null);

    const eff = act.scheduleDraft || act.publishedSchedule;
    setDateKey(eff?.dateKey || (editionDays.length > 0 ? editionDays[0] : ""));
    setStartTime(eff?.startTime || "09:00");
    setEndTime(eff?.endTime || "10:00");
    setVenue(eff?.venue || "");
    setOperationalNotes(eff?.operationalNotes || "");
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) return;

    setIsSaving(true);
    setFeedback(null);

    const res = await saveActivityScheduleAction(
      selectedActivityId,
      dateKey,
      startTime,
      endTime,
      venue,
      operationalNotes
    );

    setIsSaving(false);

    if (res.success) {
      if (res.scheduleDraft) {
        setActivitiesList((prev) =>
          prev.map((act) =>
            act._id?.toString() === selectedActivityId
              ? { ...act, scheduleDraft: res.scheduleDraft }
              : act
          )
        );
      }
      setFeedback({ type: "success", msg: "Schedule draft saved successfully." });
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to save schedule draft." });
    }
  };

  const handlePublishSchedule = async () => {
    if (!selectedActivityId) return;

    setIsPublishing(true);
    setFeedback(null);

    const res = await publishActivityScheduleAction(selectedActivityId);
    setIsPublishing(false);

    if (res.success) {
      if (res.publishedSchedule) {
        setActivitiesList((prev) =>
          prev.map((act) =>
            act._id?.toString() === selectedActivityId
              ? { ...act, publishedSchedule: res.publishedSchedule, scheduleDraft: undefined }
              : act
          )
        );
      }
      setFeedback({ type: "success", msg: "Schedule published to Partner and public program view!" });
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to publish schedule." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">
          Activity Scheduling Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Schedule approved Workshops and Stage Performances for the Summit master timetable.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Approved Unscheduled
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {stats.unscheduled}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/30">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Scheduled (Draft)
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {stats.scheduled}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Published Schedules
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {stats.published}
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

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Activity Type Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("WORKSHOP");
              setSelectedActivityId(null);
            }}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "WORKSHOP"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎤 Workshops
          </button>
          <button
            onClick={() => {
              setActiveTab("STAGE_PERFORMANCE");
              setSelectedActivityId(null);
            }}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "STAGE_PERFORMANCE"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎭 Stage Performances
          </button>
        </div>

        {/* Schedule Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "All", label: "All" },
            { id: "UNSCHEDULED", label: "Unscheduled" },
            { id: "DRAFT_ONLY", label: "Draft Schedule" },
            { id: "PUBLISHED", label: "Published" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Layout: Approved Activities List on Left, Schedule Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Activity List */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Content-Approved Proposals ({filteredActivities.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredActivities.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                No approved {activeTab === "WORKSHOP" ? "workshops" : "performances"} match current filters.
              </p>
            ) : (
              filteredActivities.map((act) => {
                const idStr = act._id!.toString();
                const isSelected = idStr === selectedActivityId;
                const org = orgMap[act.organizationId.toString()];
                const snapshot = act.approvedSnapshot;
                const title = snapshot?.title?.en || "Untitled";

                const isPublished = Boolean(act.publishedSchedule);
                const hasDraft = Boolean(act.scheduleDraft);

                return (
                  <button
                    key={idStr}
                    onClick={() => handleSelectActivity(act)}
                    className={`w-full text-left p-4 rounded-xl transition border ${
                      isSelected
                        ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)] font-bold shadow-2xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold leading-snug block">
                        {title}
                      </span>
                      {isPublished ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          Published
                        </span>
                      ) : hasDraft ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 text-blue-800 shrink-0">
                          Scheduled Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 shrink-0">
                          Unscheduled
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] block mt-1 ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {org?.name || "Institution"} • {snapshot?.durationMinutes || 0} min
                      {selectionCounts && selectionCounts[idStr] ? (
                        <span className="ml-2 font-bold text-emerald-400">
                          👥 {selectionCounts[idStr]} selected
                        </span>
                      ) : null}
                    </span>

                    {(act.scheduleDraft || act.publishedSchedule) && (
                      <span
                        className={`text-[10px] font-mono block mt-1 ${
                          isSelected ? "text-blue-200" : "text-blue-700 font-semibold"
                        }`}
                      >
                        📅 {(act.scheduleDraft || act.publishedSchedule)?.dateKey} •{" "}
                        {(act.scheduleDraft || act.publishedSchedule)?.startTime}-
                        {(act.scheduleDraft || act.publishedSchedule)?.endTime} @{" "}
                        {(act.scheduleDraft || act.publishedSchedule)?.venue}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Schedule Editor & Approved Preview */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          {selectedActivity && selectedActivity.approvedSnapshot ? (
            <>
              {/* Approved Content Preview (Read from approvedSnapshot ONLY) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  ✓ Approved Proposal Metadata (Read-Only)
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedActivity.approvedSnapshot.title.en}
                </h3>
                <p className="text-slate-600">
                  <strong>Organization:</strong> {orgMap[selectedActivity.organizationId.toString()]?.name}
                </p>
                <p className="text-slate-600">
                  <strong>Duration:</strong> {selectedActivity.approvedSnapshot.durationMinutes} minutes
                </p>

                {selectedActivity.type === "WORKSHOP" ? (
                  <>
                    <p className="text-slate-600">
                      <strong>Format / Language:</strong>{" "}
                      {(selectedActivity.approvedSnapshot as WorkshopSnapshot).format} /{" "}
                      {(selectedActivity.approvedSnapshot as WorkshopSnapshot).language}
                    </p>
                    <p className="text-slate-600">
                      <strong>Speakers:</strong>{" "}
                      {(selectedActivity.approvedSnapshot as WorkshopSnapshot).speakers
                        ?.map((sp) => `${sp.fullName} (${sp.positionTitle}, ${sp.organizationName})`)
                        .join("; ") || "None"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600">
                      <strong>Performance Type / Performers:</strong>{" "}
                      {(selectedActivity.approvedSnapshot as StagePerformanceSnapshot).performanceType} /{" "}
                      {(selectedActivity.approvedSnapshot as StagePerformanceSnapshot).numberOfPerformers} performers
                    </p>
                    <p className="text-slate-600">
                      <strong>Contact:</strong>{" "}
                      {(selectedActivity.approvedSnapshot as StagePerformanceSnapshot).contactPersonName} (
                      {(selectedActivity.approvedSnapshot as StagePerformanceSnapshot).email})
                    </p>
                  </>
                )}
              </div>

              {/* Schedule Editor Form */}
              <form onSubmit={handleSaveSchedule} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Schedule Details
                </h3>

                {/* Day Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Summit Date
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {editionDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDateKey(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          dateKey === day
                            ? "bg-[var(--color-navy)] text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {formatDayKeyLabel(day, locale)} ({day})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Start Time (HH:mm, 24h)
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      End Time (HH:mm, 24h)
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Venue / Room / Stage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Venue / Room / Stage (Free-text)
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Alpha 201, Innovation Hub, Main Stage, Cultural Stage"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Operational Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Operational Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={operationalNotes}
                    onChange={(e) => setOperationalNotes(e.target.value)}
                    placeholder="Internal setup notes, technician assignments, mic checks..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isSaving ? "Saving Schedule..." : "Save Schedule Draft"}
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishSchedule}
                    disabled={isPublishing || isSaving || !selectedActivity.scheduleDraft}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isPublishing ? "Publishing..." : "Publish Schedule"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-xs text-slate-400 p-8 text-center">
              Select an approved activity proposal from the left list to edit its schedule.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
