import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import {
  getEditionDayKeys,
  getCurrentDayKeyIfInRange,
  formatDayKeyLabel,
} from "@/lib/utils/edition-utils";
import { countCheckInStats } from "@/lib/db/repositories/summit-check-ins";
import { countBoothStats } from "@/lib/db/repositories/summit-booth-assignments";
import { countSchedulingStats } from "@/lib/db/repositories/summit-activities";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  const { dbUser } = await requireSummitOperationsAccess();
  const staffDict = dict.staffDashboard;

  const activeEdition = await getActiveSummitEdition();
  const editionDays = activeEdition ? getEditionDayKeys(activeEdition) : [];
  const currentDayKey = activeEdition ? getCurrentDayKeyIfInRange(activeEdition) : null;

  // Check-in stats for current day or default to day 1 for preview
  const activeCheckInDay = currentDayKey || (editionDays.length > 0 ? editionDays[0] : "2026-11-20");

  let checkInStats = { totalRegistered: 0, checkedIn: 0, remaining: 0 };
  let boothStats = { totalAssigned: 0, published: 0, draftOnly: 0 };
  let schedulingStats = { unscheduled: 0, scheduled: 0, published: 0 };

  if (activeEdition && activeEdition._id) {
    const [cStats, bStats, sStats] = await Promise.all([
      countCheckInStats(activeEdition._id, activeCheckInDay),
      countBoothStats(activeEdition._id),
      countSchedulingStats(activeEdition._id),
    ]);
    checkInStats = cStats;
    boothStats = bStats;
    schedulingStats = sStats;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{staffDict.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{staffDict.subtitle}</p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full border border-purple-200">
            {dbUser.role}
          </span>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
          {staffDict.roleNotice}
        </p>
      </div>

      {/* Live Operational Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {staffDict.modulesTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check-in Module Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                  📋
                </div>
                {currentDayKey ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Event Day: {formatDayKeyLabel(currentDayKey, locale)}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Event Day Preview ({formatDayKeyLabel(activeCheckInDay, locale)})
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{staffDict.checkInModule}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{staffDict.checkInDesc}</p>
              </div>

              {/* Metrics */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Checked In</span>
                  <span className="text-lg font-black text-emerald-600">{checkInStats.checkedIn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Remaining</span>
                  <span className="text-lg font-black text-amber-600">{checkInStats.remaining}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/staff/check-in`}
              className="w-full py-2.5 bg-[var(--color-navy)] hover:opacity-90 text-white font-bold text-xs rounded-xl text-center transition block"
            >
              Open Check-in Console →
            </Link>
          </div>

          {/* Booth Management Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base">
                  ⛺
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {boothStats.published} Published
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{staffDict.boothModule}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{staffDict.boothDesc}</p>
              </div>

              {/* Metrics */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned</span>
                  <span className="text-lg font-black text-slate-900">{boothStats.totalAssigned}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Draft Only</span>
                  <span className="text-lg font-black text-amber-600">{boothStats.draftOnly}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/staff/booths`}
              className="w-full py-2.5 bg-[var(--color-navy)] hover:opacity-90 text-white font-bold text-xs rounded-xl text-center transition block"
            >
              Manage Booths →
            </Link>
          </div>

          {/* Activity Scheduling Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                  📅
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {schedulingStats.published} Published
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{staffDict.schedulingModule}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{staffDict.schedulingDesc}</p>
              </div>

              {/* Metrics */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Unscheduled</span>
                  <span className="text-lg font-black text-amber-600">{schedulingStats.unscheduled}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Scheduled</span>
                  <span className="text-lg font-black text-blue-600">{schedulingStats.scheduled}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/staff/scheduling`}
              className="w-full py-2.5 bg-[var(--color-navy)] hover:opacity-90 text-white font-bold text-xs rounded-xl text-center transition block"
            >
              Open Timetable Console →
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Guard Notice */}
      <div className="p-4 bg-slate-200/60 rounded-xl border border-slate-300 text-[11px] text-slate-600 font-medium">
        🔒 <strong>Privacy Safeguard</strong>: Attendee personal records remain protected and accessible exclusively to authorized SUMMIT_STAFF and ADMIN personnel for operational check-in.
      </div>
    </div>
  );
}
