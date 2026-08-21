"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SummitRegistration } from "@/lib/db/models/summit-registration";

interface AdminRegistrationListProps {
  registrations: SummitRegistration[];
  total: number;
  page: number;
  totalPages: number;
  currentTab: string;
  searchQuery: string;
  counts: { total: number; fptStudents: number; externalParticipants: number };
  locale: Locale;
  dict: Dictionary;
}

export function AdminRegistrationList({
  registrations,
  page,
  totalPages,
  currentTab,
  searchQuery,
  counts,
  dict,
}: AdminRegistrationListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchQuery);
  const regDict = dict.adminRegistrations;

  const updateQueryParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === "All" || (key === "page" && val === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q, page: 1 });
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium text-[11px] block">{regDict.metricTotal}</span>
          <strong className="text-2xl font-bold text-slate-900">{counts.total}</strong>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium text-[11px] block">{regDict.metricFptStudents}</span>
          <strong className="text-2xl font-bold text-blue-700">{counts.fptStudents}</strong>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium text-[11px] block">{regDict.metricExternal}</span>
          <strong className="text-2xl font-bold text-emerald-700">{counts.externalParticipants}</strong>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateQueryParams({ type: "All", page: 1 })}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition ${
              currentTab === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {regDict.tabAll} ({counts.total})
          </button>

          <button
            onClick={() => updateQueryParams({ type: "FPT_STUDENT", page: 1 })}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition ${
              currentTab === "FPT_STUDENT"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {regDict.tabFpt} ({counts.fptStudents})
          </button>

          <button
            onClick={() => updateQueryParams({ type: "EXTERNAL_PARTICIPANT", page: 1 })}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition ${
              currentTab === "EXTERNAL_PARTICIPANT"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {regDict.tabExternal} ({counts.externalParticipants})
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, MSSV, phone, email..."
            className="p-2 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs w-64"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">{regDict.colName}</th>
                <th className="py-3 px-4">{regDict.colType}</th>
                <th className="py-3 px-4">{regDict.colStudentId}</th>
                <th className="py-3 px-4">{regDict.colPhone}</th>
                <th className="py-3 px-4">{regDict.colEmail}</th>
                <th className="py-3 px-4">{regDict.colRegisteredAt}</th>
                <th className="py-3 px-4">{regDict.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    {regDict.emptyList}
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id?.toString()} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {reg.attendeeSnapshot.fullName}
                    </td>
                    <td className="py-3 px-4">
                      {reg.participantType === "FPT_STUDENT" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          FPT STUDENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          EXTERNAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {reg.attendeeSnapshot.studentId || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {reg.attendeeSnapshot.phone}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {reg.attendeeSnapshot.email}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(reg.registeredAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">
              Page {page} of {totalPages} ({registrations.length} of {counts.total} items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateQueryParams({ page: page - 1 })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => updateQueryParams({ page: page + 1 })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold disabled:opacity-40"
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
