"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { MemberSafeActivityDTO } from "@/lib/utils/member-dto";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";

interface MemberActivitySelectionSummaryProps {
  selectedActivities: MemberSafeActivityDTO[];
  locale: Locale;
}

export function MemberActivitySelectionSummary({
  selectedActivities,
  locale,
}: MemberActivitySelectionSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {locale === "vi" ? "Hoạt động Summit Tự chọn của tôi" : "My Optional Summit Activities"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "vi"
              ? "Các chương trình Workshop & Biểu diễn bạn đã chọn tham gia."
              : "Workshops & Performances you have added to your itinerary."}
          </p>
        </div>

        <Link
          href={`/${locale}/dashboard/my-activities`}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
        >
          {locale === "vi" ? "Xem tất cả →" : "Browse All →"}
        </Link>
      </div>

      {selectedActivities.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 text-center font-medium">
          {locale === "vi"
            ? "Bạn chưa chọn hoạt động tự chọn nào. Khám phá các Workshop & Biểu diễn để thêm vào lịch trình!"
            : "No optional activities selected yet. Explore Workshops & Performances to add them to your itinerary!"}
        </div>
      ) : (
        <div className="space-y-2">
          {selectedActivities.map((act) => {
            const isWorkshop = act.type === "WORKSHOP";
            const title = act.approvedSnapshot
              ? act.approvedSnapshot.title?.[locale] || act.approvedSnapshot.title?.en || "Activity"
              : locale === "vi"
              ? "Hoạt động đã chọn trước đây"
              : "Previously selected activity";
            const sched = act.publishedSchedule;

            return (
              <div
                key={act._id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase ${
                        isWorkshop ? "bg-orange-600" : "bg-purple-600"
                      }`}
                    >
                      {isWorkshop ? "Workshop" : "Performance"}
                    </span>
                    <span className="font-bold text-slate-900">{title}</span>
                  </div>

                  {sched ? (
                    <span className="text-[11px] text-blue-700 font-semibold block font-mono">
                      📅 {formatDayKeyLabel(sched.dateKey, locale)} • {sched.startTime} – {sched.endTime} @ {sched.venue}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-semibold block">
                      ⚠️ Schedule currently unavailable
                    </span>
                  )}
                </div>

                <Link
                  href={`/${locale}/dashboard/my-activities`}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold shrink-0"
                >
                  Manage
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
