"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/types";
import type { SummitReportOverview, SummitReportType } from "@/lib/db/repositories/summit-reports";

interface StaffReportsConsoleProps {
  editionYear: number;
  overview: SummitReportOverview;
  dict: Dictionary;
}

export function StaffReportsConsole({
  editionYear,
  overview,
  dict,
}: StaffReportsConsoleProps) {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rDict = dict.staffReports;

  const handleDownload = async (type: SummitReportType, format: "xlsx" | "csv") => {
    setErrorMsg(null);
    const key = `${type}_${format}`;
    setDownloadingKey(key);

    try {
      const res = await fetch(`/api/staff/reports/${type.toLowerCase()}?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download report.");
      }

      // Get filename from Content-Disposition header or build fallback
      const disposition = res.headers.get("Content-Disposition");
      let filename = `fpt-ico-summit-${editionYear}-${type.toLowerCase()}.${format}`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      setErrorMsg(msg);
    } finally {
      setDownloadingKey(null);
    }
  };

  const exportsList = [
    {
      category: rDict?.sectionParticipant || "Participant Reports",
      items: [
        {
          type: "REGISTRATIONS" as SummitReportType,
          title: "Summit Registrations",
          desc: "Complete list of registered participants (FPT students & External), contact info, and status.",
          badge: "Registrations",
        },
        {
          type: "CHECK_INS" as SummitReportType,
          title: "Daily Summit Check-ins",
          desc: "Detailed record of every physical Summit check-in per event day with timestamp and staff actor.",
          badge: "Check-ins",
        },
      ],
    },
    {
      category: rDict?.sectionActivity || "Activity Reports",
      items: [
        {
          type: "ACTIVITY_SCHEDULE" as SummitReportType,
          title: "Activity Schedule",
          desc: "Master published timetable for all approved Workshops and Stage Performances.",
          badge: "Schedule",
        },
        {
          type: "ACTIVITY_SELECTIONS" as SummitReportType,
          title: "Activity Selections",
          desc: "Participant optional activity intent selections (Workshops & Stage Performances).",
          badge: "Selections",
        },
        {
          type: "ACTIVITY_ATTENDANCE" as SummitReportType,
          title: "Activity Attendance",
          desc: "Staff-verified physical attendance records for scheduled activities with historical day keys.",
          badge: "Attendance",
        },
      ],
    },
    {
      category: rDict?.sectionPartner || "Partner Operations",
      items: [
        {
          type: "BOOTH_ASSIGNMENTS" as SummitReportType,
          title: "Booth Assignments",
          desc: "Published booth assignments, location text, and partner notes for confirmed institutions.",
          badge: "Booths",
        },
        {
          type: "PARTNER_SUMMARY" as SummitReportType,
          title: "Partner Operations Summary",
          desc: "Aggregated post-event metrics per institution (Booths, Scholarships, Workshops, Performances).",
          badge: "ICO Summary",
        },
      ],
    },
    {
      category: rDict?.sectionScholarship || "Scholarship Hub",
      items: [
        {
          type: "SCHOLARSHIPS" as SummitReportType,
          title: "Published Scholarships",
          desc: "Catalog of all published global scholarships from confirmed partner institutions.",
          badge: "Scholarships",
        },
      ],
    },
    {
      category: rDict?.sectionIcs || "External SRO Reference",
      isIcs: true,
      items: [
        {
          type: "ICS_REFERENCE" as SummitReportType,
          title: "Reference ICS Export (FPT Students Only)",
          desc: "Reference participation evidence (+10 per attended session) for FPT Can Tho students. Excludes external participants.",
          badge: "Reference ICS",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
          FPT ICO Summit {editionYear}
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
          {rDict?.title || "Reports & Exports Center"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {rDict?.subtitle ||
            "Operational metrics summary and exports for FPT ICO Summit."}
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Operational Overview Metrics */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Operational Summary Metrics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Registered
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {overview.totalRegistered}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
              FPT: {overview.fptStudentsRegistered} • External: {overview.externalRegistered}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Unique Attendees
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {overview.uniqueParticipantsCheckedIn}
            </span>
            <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
              Check-in Records: {overview.totalCheckInRecords}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Activity Selections
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {overview.totalSelections}
            </span>
            <span className="text-[11px] text-blue-700 block mt-0.5 font-medium">
              Workshops: {overview.publishedWorkshops} • Stage: {overview.publishedPerformances}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
              Activity Attendance
            </span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              {overview.totalAttendanceRecords}
            </span>
            <span className="text-[11px] text-purple-700 block mt-0.5 font-medium">
              Selected: {overview.selectedPresent} • Walk-ins: {overview.recordedWalkIns}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Confirmed Partners
            </span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">
              {overview.confirmedPartners}
            </span>
            <span className="text-[11px] text-indigo-700 block mt-0.5 font-medium">
              Booths: {overview.boothsPublished} • Scholarships: {overview.scholarshipsPublished}
            </span>
          </div>
        </div>
      </div>

      {/* Export Cards by Category */}
      <div className="space-y-6">
        {exportsList.map((cat) => (
          <div key={cat.category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {cat.category}
              </h2>
              {cat.isIcs && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200">
                  External SRO Handoff
                </span>
              )}
            </div>

            {cat.isIcs && (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-semibold">
                ℹ️ {rDict?.icsReferenceNotice || "Reference only — official ICS scoring is confirmed in the SRO system."}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item) => {
                const isDownloadingXlsx = downloadingKey === `${item.type}_xlsx`;
                const isDownloadingCsv = downloadingKey === `${item.type}_csv`;
                const isAnyDownloading = downloadingKey !== null;

                return (
                  <div
                    key={item.type}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-md border border-slate-200">
                          {item.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          .XLSX / .CSV
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {/* Dual Download Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {/* Primary Excel Download */}
                      <button
                        type="button"
                        onClick={() => handleDownload(item.type, "xlsx")}
                        disabled={isAnyDownloading}
                        className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        {isDownloadingXlsx ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span>
                            <span className="truncate">{rDict?.btnDownloading || "..."}</span>
                          </>
                        ) : (
                          <>
                            <span>📊</span>
                            <span className="truncate">{rDict?.btnDownloadXlsx || "Excel (.xlsx)"}</span>
                          </>
                        )}
                      </button>

                      {/* Secondary CSV Download */}
                      <button
                        type="button"
                        onClick={() => handleDownload(item.type, "csv")}
                        disabled={isAnyDownloading}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        {isDownloadingCsv ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span>
                            <span className="truncate">{rDict?.btnDownloading || "..."}</span>
                          </>
                        ) : (
                          <>
                            <span>📄</span>
                            <span className="truncate">{rDict?.btnDownloadCsv || "CSV (.csv)"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
