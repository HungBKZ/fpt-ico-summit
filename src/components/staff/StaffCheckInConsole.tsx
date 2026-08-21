"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import { checkInParticipantAction } from "@/app/actions/staff-actions";
import type { RegistrationWithCheckIn } from "@/lib/db/repositories/summit-check-ins";

interface StaffCheckInConsoleProps {
  editionDays: string[];
  selectedDay: string;
  registrations: RegistrationWithCheckIn[];
  total: number;
  page: number;
  totalPages: number;
  currentType: string;
  currentStatus: string;
  searchQuery: string;
  stats: {
    totalRegistered: number;
    checkedIn: number;
    remaining: number;
  };
  locale: Locale;
  dict: Dictionary;
}

export function StaffCheckInConsole({
  editionDays,
  selectedDay,
  registrations: initialRegistrations,
  total,
  page,
  totalPages,
  currentType,
  currentStatus,
  searchQuery: initialSearch,
  stats: initialStats,
  locale,
}: StaffCheckInConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [localRegs, setLocalRegs] = useState<RegistrationWithCheckIn[]>(initialRegistrations);
  const [localStats, setLocalStats] = useState(initialStats);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if props change
  if (initialRegistrations !== localRegs && !processingId) {
    setLocalRegs(initialRegistrations);
    setLocalStats(initialStats);
  }

  const navigateWithParams = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams();
    urlParams.set("day", params.day ?? selectedDay);
    urlParams.set("type", params.type ?? currentType);
    urlParams.set("status", params.status ?? currentStatus);
    if (params.q !== undefined ? params.q : search) {
      urlParams.set("q", params.q !== undefined ? params.q : search);
    }
    urlParams.set("page", params.page ?? "1");

    startTransition(() => {
      router.push(`/${locale}/staff/check-in?${urlParams.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithParams({ q: search, page: "1" });
  };

  const handleCheckIn = async (regId: string) => {
    setErrorMsg(null);
    setProcessingId(regId);

    const res = await checkInParticipantAction(regId, selectedDay);
    setProcessingId(null);

    if (res.success && res.checkedInAt) {
      // Optimistically update local state
      setLocalRegs((prev) =>
        prev.map((r) =>
          r._id.toString() === regId
            ? {
                ...r,
                checkIn: {
                  checkedInAt: res.checkedInAt!,
                  checkedInBy: "" as unknown as import("mongodb").ObjectId,
                  method: "MANUAL",
                },
              }
            : r
        )
      );
      setLocalStats((prev) => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
        remaining: Math.max(0, prev.remaining - 1),
      }));
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">
          FPT ICO Summit 2026 — Check-in Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          On-site participant check-in per Summit day.
        </p>

        {/* Day Selector */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-700 mr-2">Summit Day:</span>
          {editionDays.map((dayKey) => {
            const isSelected = dayKey === selectedDay;
            return (
              <button
                key={dayKey}
                onClick={() => navigateWithParams({ day: dayKey, page: "1" })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? "bg-[var(--color-navy)] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                📅 {formatDayKeyLabel(dayKey, locale)} ({dayKey})
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Registered
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {localStats.totalRegistered}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Checked In ({formatDayKeyLabel(selectedDay, locale)})
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {localStats.checkedIn}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Remaining
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {localStats.remaining}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Participant Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: "All", label: "All" },
              { id: "FPT_STUDENT", label: "FPT Can Tho Students" },
              { id: "EXTERNAL_PARTICIPANT", label: "External Participants" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateWithParams({ type: tab.id, page: "1" })}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentType === tab.id
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: "All", label: "All Status" },
              { id: "NOT_CHECKED_IN", label: "Not Checked In" },
              { id: "CHECKED_IN", label: "Checked In" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateWithParams({ status: tab.id, page: "1" })}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentStatus === tab.id
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Full Name, MSSV / Student ID, Phone, or Email..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-[var(--color-navy)] text-white font-bold text-xs rounded-xl hover:opacity-90 transition"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Registration Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Participant</th>
                <th className="p-4">Type</th>
                <th className="p-4">MSSV / Student ID</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Check-in Time</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localRegs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No registered participants match the current filters.
                  </td>
                </tr>
              ) : (
                localRegs.map((reg) => {
                  const regIdStr = reg._id.toString();
                  const isCheckedIn = Boolean(reg.checkIn);
                  const isProcessing = processingId === regIdStr;

                  return (
                    <tr key={regIdStr} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">
                        {reg.attendeeSnapshot.fullName}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          {reg.attendeeSnapshot.email}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            reg.participantType === "FPT_STUDENT"
                              ? "bg-orange-100 text-orange-800 border border-orange-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {reg.participantType === "FPT_STUDENT"
                            ? "FPT Student"
                            : "External"}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-700">
                        {reg.attendeeSnapshot.studentId || "—"}
                      </td>
                      <td className="p-4 text-slate-600 font-mono">
                        {reg.attendeeSnapshot.phone}
                      </td>
                      <td className="p-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            Not Checked In
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {isCheckedIn && reg.checkIn?.checkedInAt
                          ? new Date(reg.checkIn.checkedInAt).toLocaleTimeString(
                              locale === "vi" ? "vi-VN" : "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        {isCheckedIn ? (
                          <span className="text-emerald-600 font-bold text-xs">
                            ✓ Complete
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(regIdStr)}
                            disabled={isProcessing || isPending}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition disabled:opacity-50"
                          >
                            {isProcessing ? "Checking in..." : "Check In"}
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing page {page} of {totalPages} ({total} total registrations)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigateWithParams({ page: String(page - 1) })}
                disabled={page <= 1 || isPending}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => navigateWithParams({ page: String(page + 1) })}
                disabled={page >= totalPages || isPending}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
