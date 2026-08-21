"use client";

import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { MemberSafeActivityDTO, MemberSafeWorkshopSnapshot, MemberSafePerformanceSnapshot } from "@/lib/utils/member-dto";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import { getTrackById } from "@/lib/config/workshop-tracks";
import { getPerformanceScopeById } from "@/lib/config/performance-scopes";

interface MemberActivityCardProps {
  activity: MemberSafeActivityDTO;
  organizationName?: string;
  organizationCountry?: string;
  isSelected: boolean;
  isRegistered: boolean;
  hasConflict?: boolean;
  isAttended?: boolean;
  onSelect: (activityId: string) => void;
  onUnselect: (activityId: string) => void;
  onViewDetails: (activity: MemberSafeActivityDTO) => void;
  isProcessing: boolean;
  locale: Locale;
}

export function MemberActivityCard({
  activity,
  organizationName = "Institution",
  organizationCountry = "Global",
  isSelected,
  isRegistered,
  hasConflict,
  isAttended,
  onSelect,
  onUnselect,
  onViewDetails,
  isProcessing,
  locale,
}: MemberActivityCardProps) {
  const isVi = locale === "vi";

  // Safe tombstone state if approvedSnapshot is missing
  if (!activity.approvedSnapshot) {
    const tombTitle = isVi ? "Hoạt động đã chọn trước đây" : "Previously selected activity";
    const tombDesc = isVi ? "Thông tin hoạt động hiện chưa khả dụng" : "Activity details are currently unavailable";

    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-300 shadow-2xs p-5 flex flex-col justify-between space-y-4 opacity-90">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase tracking-wider inline-block">
            {activity.type === "WORKSHOP" ? "Workshop" : "Stage Performance"}
          </span>

          <div>
            <h3 className="text-sm font-bold text-slate-800">{tombTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{tombDesc}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-700">⚠️ Content details unavailable</span>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onUnselect(activity._id)}
            className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  const isWorkshop = activity.type === "WORKSHOP";
  const ws = isWorkshop ? (activity.approvedSnapshot as MemberSafeWorkshopSnapshot) : null;
  const ps = !isWorkshop ? (activity.approvedSnapshot as MemberSafePerformanceSnapshot) : null;

  const title = (isVi ? activity.approvedSnapshot.title?.vi : activity.approvedSnapshot.title?.en) || activity.approvedSnapshot.title?.en || "Untitled";
  const shortDesc = (isVi ? activity.approvedSnapshot.shortDescription?.vi : activity.approvedSnapshot.shortDescription?.en) || activity.approvedSnapshot.shortDescription?.en || "";

  const cover = ws?.coverImage?.secureUrl || ps?.performanceCover?.secureUrl;
  const sched = activity.publishedSchedule;

  const trackDef = isWorkshop && activity.trackId ? getTrackById(activity.trackId) : undefined;
  const scopeDef = !isWorkshop && activity.performanceScopeId ? getPerformanceScopeById(activity.performanceScopeId) : undefined;

  return (
    <div
      className={`bg-white rounded-2xl border transition flex flex-col justify-between overflow-hidden shadow-2xs ${
        isSelected
          ? "border-blue-600 ring-2 ring-blue-500/20"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="space-y-4 p-5">
        {/* Cover image if available */}
        {cover && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 -mx-1 -mt-1">
            <Image src={cover} alt={title} fill className="object-cover" />
          </div>
        )}

        {/* Header tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isWorkshop ? "bg-blue-100 text-blue-900" : "bg-orange-100 text-orange-900"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>

            {trackDef && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                🎯 {trackDef.name[locale]}
              </span>
            )}

            {scopeDef && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                🎭 {scopeDef.name[locale]}
              </span>
            )}

            {isSelected && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                ✓ Added
              </span>
            )}

            {isAttended && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                ✅ Attended
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              {organizationName} ({organizationCountry})
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{title}</h3>
          </div>

          {shortDesc && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{shortDesc}</p>
          )}
        </div>

        {/* Schedule box if published */}
        {sched ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>📅 {formatDayKeyLabel(sched.dateKey, locale)}</span>
              <span className="font-mono text-blue-900">{sched.startTime} – {sched.endTime}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">📍 Venue: {sched.venue}</p>
          </div>
        ) : (
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-medium text-amber-900">
            ⏳ Schedule info being finalized by Summit Staff
          </div>
        )}

        {hasConflict && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold rounded-xl">
            ⚠️ Time slot conflict with another selected activity in your itinerary.
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(activity)}
          className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
        >
          Details →
        </button>

        {isRegistered && (
          <>
            {isSelected ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onUnselect(activity._id)}
                className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition disabled:opacity-50"
              >
                {isProcessing ? "Updating..." : "Remove"}
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onSelect(activity._id)}
                className="py-1.5 px-4 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-50"
              >
                {isProcessing ? "Adding..." : "+ Add to Itinerary"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
