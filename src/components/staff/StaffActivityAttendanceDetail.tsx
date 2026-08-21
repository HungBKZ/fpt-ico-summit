"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SummitActivity } from "@/lib/db/models/summit-activity";
import type {
  AttendanceParticipantRow,
  ActivityAttendanceMetrics,
} from "@/lib/db/repositories/summit-activity-attendances";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import {
  markActivityAttendanceAction,
  undoActivityAttendanceAction,
} from "@/app/actions/activity-attendance-actions";
import { StaffAttendanceParticipantTable } from "./StaffAttendanceParticipantTable";
import { StaffWalkInSearchModal } from "./StaffWalkInSearchModal";

interface StaffActivityAttendanceDetailProps {
  activity: SummitActivity;
  orgName: string;
  initialRows: AttendanceParticipantRow[];
  initialMetrics: ActivityAttendanceMetrics;
  locale: Locale;
  dict: Dictionary;
}

export function StaffActivityAttendanceDetail({
  activity,
  orgName,
  initialRows,
  initialMetrics,
  locale,
  dict,
}: StaffActivityAttendanceDetailProps) {
  const router = useRouter();
  const [rows, setRows] = useState<AttendanceParticipantRow[]>(initialRows);
  const [metrics, setMetrics] = useState<ActivityAttendanceMetrics>(initialMetrics);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  const isWorkshop = activity.type === "WORKSHOP";
  const approved = activity.approvedSnapshot;

  // Safe tombstone fallback if approvedSnapshot is missing
  const title = approved?.title?.[locale] || approved?.title?.en || (locale === "vi" ? "Hoạt động Summit" : "Summit Activity");
  const sched = activity.publishedSchedule;
  const canMark = Boolean(activity.isContentApproved && approved && sched);

  const handleMarkPresent = async (registrationId: string) => {
    setFeedback(null);
    setProcessingId(registrationId);

    const res = await markActivityAttendanceAction(activity._id!.toString(), registrationId);
    setProcessingId(null);

    if (res.success) {
      setFeedback({ type: "success", msg: "Attendance marked successfully." });
      setRows((prev) =>
        prev.map((r) =>
          r.registrationId === registrationId
            ? { ...r, attendanceStatus: "PRESENT", attendedAt: res.attendedAt || new Date() }
            : r
        )
      );
      // Re-calculate metrics
      setMetrics((prev) => {
        const targetRow = rows.find((r) => r.registrationId === registrationId);
        const isWalkIn = targetRow?.selectionStatus === "WALK_IN";
        const newSelectedPresent = isWalkIn ? prev.selectedPresent : prev.selectedPresent + 1;
        const newWalkIns = isWalkIn ? prev.walkIns + 1 : prev.walkIns;
        const newTotalPresent = newSelectedPresent + newWalkIns;
        const newNotMarked = Math.max(0, prev.selected - newSelectedPresent);
        const newRate = prev.selected > 0 ? Math.round((newSelectedPresent / prev.selected) * 1000) / 10 : 0;
        return {
          ...prev,
          selectedPresent: newSelectedPresent,
          walkIns: newWalkIns,
          totalPresent: newTotalPresent,
          selectedNotMarked: newNotMarked,
          attendanceRatePercent: newRate,
        };
      });
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to mark attendance." });
    }
  };

  const handleUndoAttendance = async (registrationId: string) => {
    setFeedback(null);
    setProcessingId(registrationId);

    const res = await undoActivityAttendanceAction(activity._id!.toString(), registrationId);
    setProcessingId(null);

    if (res.success) {
      setFeedback({ type: "success", msg: "Attendance undone successfully." });
      setRows((prev) =>
        prev.map((r) =>
          r.registrationId === registrationId
            ? { ...r, attendanceStatus: "NOT_MARKED", attendedAt: undefined }
            : r
        )
      );
      // Re-calculate metrics
      setMetrics((prev) => {
        const targetRow = rows.find((r) => r.registrationId === registrationId);
        const isWalkIn = targetRow?.selectionStatus === "WALK_IN";
        const newSelectedPresent = isWalkIn ? prev.selectedPresent : Math.max(0, prev.selectedPresent - 1);
        const newWalkIns = isWalkIn ? Math.max(0, prev.walkIns - 1) : prev.walkIns;
        const newTotalPresent = newSelectedPresent + newWalkIns;
        const newNotMarked = Math.max(0, prev.selected - newSelectedPresent);
        const newRate = prev.selected > 0 ? Math.round((newSelectedPresent / prev.selected) * 1000) / 10 : 0;
        return {
          ...prev,
          selectedPresent: newSelectedPresent,
          walkIns: newWalkIns,
          totalPresent: newTotalPresent,
          selectedNotMarked: newNotMarked,
          attendanceRatePercent: newRate,
        };
      });
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.error || "Failed to undo attendance." });
    }
  };

  const handleMarkWalkIn = async (registrationId: string) => {
    await handleMarkPresent(registrationId);
    setShowWalkInModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/staff/attendance`}
            className="text-xs font-bold text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Attendance Console
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                isWorkshop ? "bg-orange-600" : "bg-purple-600"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>
            <span className="text-xs font-semibold text-slate-500">{orgName}</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-1">{title}</h1>

          {sched ? (
            <p className="text-xs font-mono text-blue-700 font-semibold mt-1">
              📅 {formatDayKeyLabel(sched.dateKey, locale)} ({sched.dateKey}) • {sched.startTime} – {sched.endTime} @ {sched.venue}
            </p>
          ) : (
            <p className="text-xs font-semibold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 inline-block">
              ⚠️ Published schedule currently unavailable.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowWalkInModal(true)}
          disabled={!canMark}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-40 whitespace-nowrap self-start md:self-auto"
        >
          + Add Walk-in
        </button>
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

      {/* Strict Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Current Selected
          </span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">
            {metrics.selected}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Selected Present
          </span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">
            {metrics.selectedPresent}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Not Yet Marked
          </span>
          <span className="text-xl font-black text-amber-700 mt-0.5 block">
            {metrics.selectedNotMarked}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Recorded as Walk-in
          </span>
          <span className="text-xl font-black text-purple-700 mt-0.5 block">
            {metrics.walkIns}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Total Present
          </span>
          <span className="text-xl font-black text-blue-700 mt-0.5 block">
            {metrics.totalPresent}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
            Selection Rate
          </span>
          <span className="text-xl font-black text-indigo-700 mt-0.5 block">
            {metrics.attendanceRatePercent}%
          </span>
        </div>
      </div>

      {/* Participant Attendance Table */}
      <StaffAttendanceParticipantTable
        rows={rows}
        onMarkPresent={handleMarkPresent}
        onUndoAttendance={handleUndoAttendance}
        isProcessing={Boolean(processingId)}
        canMarkAttendance={canMark}
        locale={locale}
        dict={dict}
      />

      {/* Walk-in Search Modal */}
      {showWalkInModal && (
        <StaffWalkInSearchModal
          activityId={activity._id!.toString()}
          activityTitle={title}
          onClose={() => setShowWalkInModal(false)}
          onMarkWalkIn={handleMarkWalkIn}
          isProcessing={Boolean(processingId)}
          locale={locale}
          dict={dict}
        />
      )}
    </div>
  );
}
