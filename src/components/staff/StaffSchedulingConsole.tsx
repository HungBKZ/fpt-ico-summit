"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import type { SummitActivity } from "@/lib/db/models/summit-activity";
import { WORKSHOP_SLOTS, getWorkshopSlotById } from "@/lib/config/workshop-slots";
import { getTrackById } from "@/lib/config/workshop-tracks";
import { getPerformanceScopeById } from "@/lib/config/performance-scopes";
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
  const isVi = locale === "vi";
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
  const [workshopSlotId, setWorkshopSlotId] = useState<string>(
    selectedActivity?.scheduleDraft?.workshopSlotId || selectedActivity?.publishedSchedule?.workshopSlotId || "WS_2026_01"
  );
  const [dateKey, setDateKey] = useState(
    selectedActivity?.scheduleDraft?.dateKey || (editionDays.length > 0 ? editionDays[0] : "")
  );
  const [startTime, setStartTime] = useState(selectedActivity?.scheduleDraft?.startTime || "08:30");
  const [endTime, setEndTime] = useState(selectedActivity?.scheduleDraft?.endTime || "09:00");
  const [venue, setVenue] = useState(selectedActivity?.scheduleDraft?.venue || "");
  const [operationalNotes, setOperationalNotes] = useState(
    selectedActivity?.scheduleDraft?.operationalNotes || ""
  );

  const handleSelectActivity = (act: SummitActivity) => {
    const idStr = act._id!.toString();
    setSelectedActivityId(idStr);
    setFeedback(null);

    const eff = act.scheduleDraft || act.publishedSchedule;
    if (act.type === "WORKSHOP") {
      const slotId = eff?.workshopSlotId || "WS_2026_01";
      setWorkshopSlotId(slotId);
      const slotDef = getWorkshopSlotById(slotId);
      if (slotDef) {
        setDateKey(slotDef.dateKey);
        setStartTime(slotDef.startTime);
        setEndTime(slotDef.endTime);
      }
    } else {
      setDateKey(eff?.dateKey || (editionDays.length > 0 ? editionDays[0] : ""));
      setStartTime(eff?.startTime || "09:00");
      setEndTime(eff?.endTime || "10:00");
    }

    setVenue(eff?.venue || "");
    setOperationalNotes(eff?.operationalNotes || "");
  };

  const handleSlotChange = (slotId: string) => {
    setWorkshopSlotId(slotId);
    const slotDef = getWorkshopSlotById(slotId);
    if (slotDef) {
      setDateKey(slotDef.dateKey);
      setStartTime(slotDef.startTime);
      setEndTime(slotDef.endTime);
    }
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
      operationalNotes,
      activeTab === "WORKSHOP" ? workshopSlotId : undefined
    );

    setIsSaving(false);

    if (res.success && res.scheduleDraft) {
      setFeedback({ type: "success", msg: "Schedule draft saved successfully." });
      setActivitiesList((prev) =>
        prev.map((act) =>
          act._id?.toString() === selectedActivityId
            ? { ...act, scheduleDraft: res.scheduleDraft }
            : act
        )
      );
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

    if (res.success && res.publishedSchedule) {
      setFeedback({ type: "success", msg: "Schedule published successfully!" });
      setActivitiesList((prev) =>
        prev.map((act) =>
          act._id?.toString() === selectedActivityId
            ? { ...act, publishedSchedule: res.publishedSchedule, scheduleDraft: undefined }
            : act
        )
      );
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to publish schedule." });
    }
  };

  // Check occupied slots
  const getSlotOccupant = (slotId: string) => {
    for (const act of activitiesList) {
      if (act._id?.toString() === selectedActivityId) continue;
      if (act.type !== "WORKSHOP") continue;
      if (act.scheduleDraft?.workshopSlotId === slotId) {
        const title = act.approvedSnapshot?.title?.en || act.draftSnapshot?.title?.en || "Workshop";
        return { title, status: "DRAFT" };
      }
      if (act.publishedSchedule?.workshopSlotId === slotId) {
        const title = act.approvedSnapshot?.title?.en || act.draftSnapshot?.title?.en || "Workshop";
        return { title, status: "PUBLISHED" };
      }
    }
    return null;
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Overview Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Unscheduled Approved Activities
          </span>
          <span className="text-2xl font-bold text-amber-600">{stats.unscheduled}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Draft Schedules (Internal Staff Only)
          </span>
          <span className="text-2xl font-bold text-blue-600">{stats.scheduled}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Published Schedules (Public & Partner)
          </span>
          <span className="text-2xl font-bold text-emerald-600">{stats.published}</span>
        </div>
      </div>

      {/* Main Console Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("WORKSHOP");
                setSelectedActivityId(null);
              }}
              className={`py-2 px-4 rounded-xl font-bold transition ${
                activeTab === "WORKSHOP"
                  ? "bg-[var(--color-navy)] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Workshops (20 Predefined Slots)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("STAGE_PERFORMANCE");
                setSelectedActivityId(null);
              }}
              className={`py-2 px-4 rounded-xl font-bold transition ${
                activeTab === "STAGE_PERFORMANCE"
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Stage Performances (Flexible)
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px]">
            {[
              { id: "All", label: "All Statuses" },
              { id: "UNSCHEDULED", label: "Unscheduled" },
              { id: "DRAFT_ONLY", label: "Draft Scheduled" },
              { id: "PUBLISHED", label: "Published" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as "All" | "UNSCHEDULED" | "DRAFT_ONLY" | "PUBLISHED")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === st.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Scheduling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Selector List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3 border-r-0 lg:border-r border-slate-100 lg:pr-6">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              Select Content-Approved Activity ({filteredActivities.length})
            </span>

            {filteredActivities.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-slate-500 font-medium">No approved activities matching filter.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredActivities.map((act) => {
                  const idStr = act._id!.toString();
                  const isSelected = idStr === selectedActivityId;
                  const snap = act.approvedSnapshot || act.draftSnapshot;
                  const isWs = act.type === "WORKSHOP";
                  const trackDef = isWs ? getTrackById(act.trackId) : undefined;
                  const scopeDef = !isWs ? getPerformanceScopeById(act.performanceScopeId) : undefined;

                  const org = orgMap[act.organizationId.toString()];
                  const title = (isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "Untitled";

                  const hasDraft = Boolean(act.scheduleDraft);
                  const hasPublished = Boolean(act.publishedSchedule);

                  return (
                    <div
                      key={idStr}
                      onClick={() => handleSelectActivity(act)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {org?.name || "Organization"}
                        </span>

                        <div className="flex items-center gap-1">
                          {hasPublished ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Published
                            </span>
                          ) : hasDraft ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Draft Schedule
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Unscheduled
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-bold text-slate-800 line-clamp-1">{title}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>{trackDef ? `🎯 ${trackDef.name[locale]}` : scopeDef ? `🎭 ${scopeDef.name[locale]}` : `${snap.durationMinutes}m`}</span>
                        {selectionCounts && selectionCounts[idStr] !== undefined && (
                          <span className="text-blue-700 font-bold">
                            👥 {selectionCounts[idStr]} selections
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedule Form / Slot Assignment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!selectedActivity ? (
              <div className="p-12 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="font-bold text-slate-700 text-sm">Select an Approved Activity</p>
                <p className="text-slate-500 font-medium text-xs">
                  Choose an activity from the left list to assign a Workshop Slot / Stage Venue and manage operational scheduling.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveSchedule} className="space-y-5">
                {/* Active Selection Banner */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-blue-300">
                      {selectedActivity.type === "WORKSHOP" ? "Workshop Slot Scheduler" : "Stage Performance Scheduler"}
                    </span>
                    <span>{orgMap[selectedActivity.organizationId.toString()]?.name}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    {selectedActivity.approvedSnapshot?.title?.en || selectedActivity.draftSnapshot?.title?.en}
                  </h3>
                </div>

                {feedback && (
                  <div
                    className={`p-3.5 rounded-xl font-semibold text-xs ${
                      feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {feedback.msg}
                  </div>
                )}

                {/* WORKSHOP PREDEFINED 20 SLOTS SELECTOR */}
                {selectedActivity.type === "WORKSHOP" ? (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Predefined Workshop Slot (20 Total Slots) *
                    </label>

                    <select
                      value={workshopSlotId}
                      onChange={(e) => handleSlotChange(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-xs bg-white"
                    >
                      {WORKSHOP_SLOTS.map((slot) => {
                        const occupant = getSlotOccupant(slot.slotId);
                        const isOccupied = Boolean(occupant);

                        return (
                          <option
                            key={slot.slotId}
                            value={slot.slotId}
                            disabled={isOccupied}
                          >
                            {slot.slotId} — {slot.sessionGroup.en} ({slot.startTime}–{slot.endTime})
                            {occupant ? ` [RESERVED: ${occupant.title}]` : " [AVAILABLE]"}
                          </option>
                        );
                      })}
                    </select>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Date</span>
                        <strong className="text-slate-900 font-mono">{dateKey}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Start Time</span>
                        <strong className="text-slate-900 font-mono">{startTime}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">End Time</span>
                        <strong className="text-slate-900 font-mono">{endTime}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STAGE PERFORMANCE FLEXIBLE TIMING */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                      <select
                        value={dateKey}
                        onChange={(e) => setDateKey(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        {editionDays.map((d) => (
                          <option key={d} value={d}>
                            {formatDayKeyLabel(d, locale)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Time (HH:mm) *</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Time (HH:mm) *</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Venue / Room / Stage Input */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Venue / Room / Stage Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Gamma 101, Main Stage, Hall A"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Operational Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Internal Operational Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={operationalNotes}
                    onChange={(e) => setOperationalNotes(e.target.value)}
                    placeholder="Notes for staff, tech setup, or equipment coordination..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSaving || isPublishing}
                    className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition shadow-2xs disabled:opacity-50"
                  >
                    {isSaving ? "Saving Draft..." : "Save Schedule Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={isSaving || isPublishing || !selectedActivity.scheduleDraft}
                    onClick={handlePublishSchedule}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
                  >
                    {isPublishing ? "Publishing..." : "Publish Schedule →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
