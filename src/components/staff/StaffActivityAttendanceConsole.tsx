"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { SummitActivity } from "@/lib/db/models/summit-activity";
import type { ActivityAttendanceMetrics } from "@/lib/db/repositories/summit-activity-attendances";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";

export interface ActivityConsoleItem {
  activity: SummitActivity;
  orgName: string;
  orgCountry: string;
  metrics: ActivityAttendanceMetrics;
}

interface StaffActivityAttendanceConsoleProps {
  items: ActivityConsoleItem[];
  locale: Locale;
  dict: Dictionary;
}

export function StaffActivityAttendanceConsole({
  items,
  locale,
  dict,
}: StaffActivityAttendanceConsoleProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "WORKSHOP" | "STAGE_PERFORMANCE">("ALL");

  const saDict = dict.staffAttendance;

  const filteredItems = items.filter((item) => {
    if (activeTab === "WORKSHOP") return item.activity.type === "WORKSHOP";
    if (activeTab === "STAGE_PERFORMANCE") return item.activity.type === "STAGE_PERFORMANCE";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900">
          {saDict?.title || "Activity Attendance Console"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {saDict?.subtitle ||
            "Manage physical attendance for scheduled Workshops and Stage Performances."}
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "ALL", label: saDict?.tabAll || "All Activities" },
            { id: "WORKSHOP", label: saDict?.tabWorkshops || "Workshops" },
            { id: "STAGE_PERFORMANCE", label: saDict?.tabPerformances || "Stage Performances" },
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

        <span className="text-xs text-slate-500 font-medium px-3">
          Showing {filteredItems.length} scheduled activities
        </span>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium text-xs">
            No scheduled activities found matching current filter.
          </div>
        ) : (
          filteredItems.map(({ activity, orgName, orgCountry, metrics }) => {
            const actIdStr = activity._id!.toString();
            const isWorkshop = activity.type === "WORKSHOP";
            const approved = activity.approvedSnapshot;
            const title =
              approved?.title?.[locale] ||
              approved?.title?.en ||
              (locale === "vi" ? "Hoạt động Summit" : "Summit Activity");
            const sched = activity.publishedSchedule;

            return (
              <div
                key={actIdStr}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                        isWorkshop ? "bg-orange-600" : "bg-purple-600"
                      }`}
                    >
                      {isWorkshop ? "Workshop" : "Stage Performance"}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[150px]">
                      {orgName} {orgCountry ? `(${orgCountry})` : ""}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
                    {sched ? (
                      <p className="text-xs font-mono text-blue-700 font-semibold mt-1">
                        📅 {formatDayKeyLabel(sched.dateKey, locale)} • {sched.startTime}–{sched.endTime} @ {sched.venue}
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-1 inline-block">
                        ⚠️ Schedule currently unavailable
                      </p>
                    )}
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-500 block uppercase">Selected</span>
                      <span className="text-sm font-black text-slate-900 block">{metrics.selected}</span>
                    </div>

                    <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[9px] font-bold text-emerald-800 block uppercase">Present</span>
                      <span className="text-sm font-black text-emerald-700 block">{metrics.totalPresent}</span>
                    </div>

                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[9px] font-bold text-indigo-800 block uppercase">Rate</span>
                      <span className="text-sm font-black text-indigo-700 block">{metrics.attendanceRatePercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/${locale}/staff/attendance/${actIdStr}`}
                    className="w-full py-2 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-2xs block text-center"
                  >
                    {saDict?.manageBtn || "Manage Attendance"} →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
