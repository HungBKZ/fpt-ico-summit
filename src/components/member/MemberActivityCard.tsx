"use client";

import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberSafeActivityDTO, MemberSafeWorkshopSnapshot, MemberSafePerformanceSnapshot } from "@/lib/utils/member-dto";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";

interface MemberActivityCardProps {
  activity: MemberSafeActivityDTO;
  orgName: string;
  orgCountry: string;
  isSelected: boolean;
  isRegistered: boolean;
  hasScheduleConflict?: boolean;
  hasAttended?: boolean;
  onSelect: (activityId: string) => void;
  onUnselect: (activityId: string) => void;
  onViewDetails: (activity: MemberSafeActivityDTO) => void;
  isProcessing: boolean;
  locale: Locale;
  dict: Dictionary;
}

export function MemberActivityCard({
  activity,
  orgName,
  orgCountry,
  isSelected,
  isRegistered,
  hasScheduleConflict,
  hasAttended,
  onSelect,
  onUnselect,
  onViewDetails,
  isProcessing,
  locale,
  dict,
}: MemberActivityCardProps) {
  const mDict = dict.memberActivities;

  // Safe tombstone state if approvedSnapshot is missing (rule #2)
  if (!activity.approvedSnapshot) {
    const tombTitle = locale === "vi" ? "Hoạt động đã chọn trước đây" : "Previously selected activity";
    const tombDesc = locale === "vi" ? "Thông tin hoạt động hiện chưa khả dụng" : "Activity details are currently unavailable";

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
          <span className="text-[11px] font-semibold text-slate-400">ID: {activity._id.slice(-6)}</span>
          {isSelected && (
            <button
              type="button"
              onClick={() => onUnselect(activity._id)}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
              {isProcessing ? "..." : mDict?.removeBtn || "Remove"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const isWorkshop = activity.type === "WORKSHOP";
  const ws = isWorkshop ? (activity.approvedSnapshot as MemberSafeWorkshopSnapshot) : null;
  const ps = !isWorkshop ? (activity.approvedSnapshot as MemberSafePerformanceSnapshot) : null;

  const title = (isWorkshop ? ws?.title : ps?.title)?.[locale] || (isWorkshop ? ws?.title?.en : ps?.title?.en) || "";
  const shortDesc = (isWorkshop ? ws?.shortDescription : ps?.shortDescription)?.[locale] || (isWorkshop ? ws?.shortDescription?.en : ps?.shortDescription?.en) || "";

  const coverImage = isWorkshop ? ws?.coverImage : ps?.performanceCover;
  const sched = activity.publishedSchedule;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
      <div>
        {/* Cover Image Header */}
        <div className="relative w-full h-40 bg-slate-100 cursor-pointer" onClick={() => onViewDetails(activity)}>
          {coverImage?.secureUrl ? (
            <Image src={coverImage.secureUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-xs">
              {isWorkshop ? "🎤 Workshop" : "🎭 Stage Performance"}
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                isWorkshop
                  ? "bg-orange-600 text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              {orgName} {orgCountry ? `(${orgCountry})` : ""}
            </span>
            <h3
              onClick={() => onViewDetails(activity)}
              className="text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600 cursor-pointer leading-snug"
            >
              {title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {shortDesc}
          </p>

          {/* Metadata Badges */}
          <div className="text-xs text-slate-700 space-y-1.5 pt-2 border-t border-slate-100">
            {sched ? (
              <div className="flex items-center gap-2 font-mono font-semibold text-[11px] text-blue-700 bg-blue-50 p-2 rounded-xl">
                <span>📅 {formatDayKeyLabel(sched.dateKey, locale)}</span>
                <span>•</span>
                <span>{sched.startTime} – {sched.endTime}</span>
                <span>•</span>
                <span>📍 {sched.venue}</span>
              </div>
            ) : (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-800">
                ⚠️ {mDict?.scheduleUnavailable || "Schedule currently unavailable"}
              </div>
            )}

            {/* Additional info line */}
            {isWorkshop && ws?.speakers && ws.speakers.length > 0 && (
              <p className="text-[11px] text-slate-500 truncate">
                🗣️ <strong>Speakers:</strong> {ws.speakers.map((s) => s.fullName).join(", ")}
              </p>
            )}

            {!isWorkshop && ps?.countryOrCultureRepresented && (
              <p className="text-[11px] text-slate-500">
                🌏 <strong>Culture:</strong> {ps.countryOrCultureRepresented}
              </p>
            )}
          </div>

          {/* Schedule Conflict Warning Badge if Republished Schedule Overlaps */}
          {isSelected && hasScheduleConflict && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] font-semibold text-amber-900">
              ⚠️ {mDict?.republishedConflictWarning || "Schedule updated — this activity now overlaps with another activity you selected."}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onViewDetails(activity)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
        >
          View Details
        </button>

        <div>
          {isSelected ? (
            <div className="flex flex-wrap items-center gap-2">
              {hasAttended ? (
                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">
                  {locale === "vi" ? "✓ Đã tham gia" : "✓ Attended"}
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                  {mDict?.selectedLabel || "✓ Selected"}
                </span>
              )}
              <button
                type="button"
                onClick={() => onUnselect(activity._id)}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition disabled:opacity-50"
              >
                {isProcessing ? "..." : mDict?.removeBtn || "Remove"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(activity._id)}
              disabled={isProcessing || !isRegistered || !activity.isSelectable}
              className="px-4 py-2 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-40"
            >
              {isProcessing
                ? "Processing..."
                : !isRegistered
                ? "Register First"
                : !activity.isSelectable
                ? "Unavailable"
                : mDict?.joinBtn || "Join Activity"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
