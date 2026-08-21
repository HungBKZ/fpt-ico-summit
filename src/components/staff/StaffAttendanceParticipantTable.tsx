"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { AttendanceParticipantRow } from "@/lib/db/repositories/summit-activity-attendances";

interface StaffAttendanceParticipantTableProps {
  rows: AttendanceParticipantRow[];
  onMarkPresent: (registrationId: string) => Promise<void>;
  onUndoAttendance: (registrationId: string) => Promise<void>;
  isProcessing: boolean;
  canMarkAttendance: boolean;
  locale: Locale;
  dict: Dictionary;
}

export function StaffAttendanceParticipantTable({
  rows,
  onMarkPresent,
  onUndoAttendance,
  isProcessing,
  canMarkAttendance,
  locale,
}: StaffAttendanceParticipantTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NOT_MARKED" | "PRESENT" | "WALK_IN">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FPT_STUDENT" | "EXTERNAL_PARTICIPANT">("ALL");
  const [undoConfirmTarget, setUndoConfirmTarget] = useState<AttendanceParticipantRow | null>(null);

  // Filter rows
  const filteredRows = rows.filter((row) => {
    // Search query match
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = row.fullName.toLowerCase().includes(q);
      const matchStudentId = row.studentId?.toLowerCase().includes(q);
      const matchPhone = row.phone.toLowerCase().includes(q);
      const matchEmail = row.email.toLowerCase().includes(q);
      if (!matchName && !matchStudentId && !matchPhone && !matchEmail) return false;
    }

    // Status filter
    if (statusFilter === "NOT_MARKED" && row.attendanceStatus !== "NOT_MARKED") return false;
    if (statusFilter === "PRESENT" && row.attendanceStatus !== "PRESENT") return false;
    if (statusFilter === "WALK_IN" && row.selectionStatus !== "WALK_IN") return false;

    // Type filter
    if (typeFilter !== "ALL" && row.participantType !== typeFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "vi"
                ? "Tìm tên, MSSV, SĐT, email..."
                : "Search participant name, MSSV, phone, or email..."
            }
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing {filteredRows.length} of {rows.length} participants
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold">
            {[
              { id: "ALL", label: "All Status" },
              { id: "NOT_MARKED", label: "Not Yet Marked" },
              { id: "PRESENT", label: "Present" },
              { id: "WALK_IN", label: "Walk-ins" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === tab.id
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold">
            {[
              { id: "ALL", label: "All Types" },
              { id: "FPT_STUDENT", label: "FPT Can Tho" },
              { id: "EXTERNAL_PARTICIPANT", label: "External" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id as typeof typeFilter)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  typeFilter === tab.id
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Participant Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Selection</th>
                <th className="py-3 px-4">Summit Check-in</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No participant records match the active filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isPresent = row.attendanceStatus === "PRESENT";

                  return (
                    <tr
                      key={row.registrationId}
                      className={`hover:bg-slate-50 transition ${
                        isPresent ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{row.fullName}</span>
                        {row.studentId && (
                          <span className="text-[11px] font-mono text-slate-500 block">
                            MSSV: {row.studentId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            row.participantType === "FPT_STUDENT"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {row.participantType === "FPT_STUDENT" ? "FPT Student" : "External"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 space-y-0.5">
                        <span className="block">{row.phone}</span>
                        <span className="block text-slate-500 text-[10px] truncate max-w-[150px]">
                          {row.email}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            row.selectionStatus === "SELECTED"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {row.selectionStatus === "SELECTED" ? "Selected" : "Walk-in"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {row.hasGeneralCheckIn ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                            ✓ Summit Checked In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-semibold text-[10px] rounded-full border border-amber-200">
                            ⚠ No Summit Check-in
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isPresent ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg inline-block">
                              ✓ PRESENT
                            </span>
                            {row.attendedAt && (
                              <span className="block text-[10px] text-slate-500 font-mono">
                                {new Date(row.attendedAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 font-medium text-[10px] rounded-lg">
                            Not Yet Marked
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isPresent ? (
                          <button
                            type="button"
                            onClick={() => setUndoConfirmTarget(row)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition disabled:opacity-50"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMarkPresent(row.registrationId)}
                            disabled={isProcessing || !canMarkAttendance}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-2xs disabled:opacity-40"
                          >
                            {isProcessing ? "..." : "Mark Present"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Undo Attendance */}
      {undoConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Undo Attendance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove attendance for{" "}
              <strong>{undoConfirmTarget.fullName}</strong>? This action will delete the
              attendance record and write an audit log entry.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUndoConfirmTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const rId = undoConfirmTarget.registrationId;
                  setUndoConfirmTarget(null);
                  await onUndoAttendance(rId);
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
