"use client";

import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberSafeActivityDTO, MemberSafeWorkshopSnapshot, MemberSafePerformanceSnapshot } from "@/lib/utils/member-dto";
import { formatDayKeyLabel } from "@/lib/utils/edition-utils";
import { SafeHtml } from "@/components/ui/SafeHtml";

interface MemberActivityDetailModalProps {
  activity: MemberSafeActivityDTO | null;
  orgName: string;
  orgCountry: string;
  isSelected: boolean;
  isRegistered: boolean;
  onClose: () => void;
  onSelect: (activityId: string) => void;
  onUnselect: (activityId: string) => void;
  isProcessing: boolean;
  locale: Locale;
  dict: Dictionary;
}

export function MemberActivityDetailModal({
  activity,
  orgName,
  orgCountry,
  isSelected,
  isRegistered,
  onClose,
  onSelect,
  onUnselect,
  isProcessing,
  locale,
  dict,
}: MemberActivityDetailModalProps) {
  if (!activity) return null;

  const isWorkshop = activity.type === "WORKSHOP";
  const ws = isWorkshop ? (activity.approvedSnapshot as MemberSafeWorkshopSnapshot) : null;
  const ps = !isWorkshop ? (activity.approvedSnapshot as MemberSafePerformanceSnapshot) : null;

  const title = (isWorkshop ? ws?.title : ps?.title)?.[locale] || (isWorkshop ? ws?.title?.en : ps?.title?.en) || "";
  const shortDesc = (isWorkshop ? ws?.shortDescription : ps?.shortDescription)?.[locale] || (isWorkshop ? ws?.shortDescription?.en : ps?.shortDescription?.en) || "";
  const fullHtml = isWorkshop
    ? ws?.fullDescription?.[locale] || ws?.fullDescription?.en
    : ps?.culturalMeaning?.[locale] || ps?.culturalMeaning?.en;

  const coverImage = isWorkshop ? ws?.coverImage : ps?.performanceCover;
  const sched = activity.publishedSchedule;

  const mDict = dict.memberActivities;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden my-8 border border-slate-200">
        {/* Cover Image Header */}
        <div className="relative w-full h-56 bg-slate-100">
          {coverImage?.secureUrl ? (
            <Image src={coverImage.secureUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
              {isWorkshop ? "🎤 Workshop" : "🎭 Stage Performance"}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>

          <div className="absolute bottom-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs ${
                isWorkshop ? "bg-orange-600" : "bg-purple-600"
              }`}
            >
              {isWorkshop ? "Workshop" : "Stage Performance"}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-slate-500 block">
              {orgName} {orgCountry ? `(${orgCountry})` : ""}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{title}</h2>
          </div>

          {/* Schedule Banner */}
          {sched ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl font-mono text-xs text-blue-900 flex flex-wrap items-center gap-4">
              <span>📅 <strong>Date:</strong> {formatDayKeyLabel(sched.dateKey, locale)} ({sched.dateKey})</span>
              <span>⏰ <strong>Time:</strong> {sched.startTime} – {sched.endTime}</span>
              <span>📍 <strong>Venue:</strong> {sched.venue}</span>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
              ⚠️ Schedule currently unavailable for this activity.
            </div>
          )}

          {/* Descriptions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              About this Activity
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {shortDesc}
            </p>

            {fullHtml ? (
              <div className="pt-2 border-t border-slate-100">
                <SafeHtml content={fullHtml} className="text-xs text-slate-700 leading-relaxed space-y-2" />
              </div>
            ) : null}
          </div>

          {/* Workshop Public Speaker Profiles */}
          {isWorkshop && ws?.speakers && ws.speakers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Speakers ({ws.speakers.length})
              </h3>

              <div className="space-y-4">
                {ws.speakers.map((sp) => (
                  <div key={sp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4 items-start">
                    {sp.photo?.secureUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-300">
                        <Image src={sp.photo.secureUrl} alt={sp.fullName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm shrink-0">
                        {sp.fullName.slice(0, 1)}
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{sp.fullName}</h4>
                      <p className="text-slate-600 text-[11px]">
                        {sp.positionTitle} • {sp.organizationName} ({sp.country})
                      </p>
                      {sp.shortBio?.[locale] || sp.shortBio?.en ? (
                        <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                          {sp.shortBio[locale] || sp.shortBio.en}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Culture Info */}
          {!isWorkshop && ps && (
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl text-xs space-y-1">
              <p className="text-slate-800">
                <strong>Performance Type:</strong> {ps.performanceType}
              </p>
              <p className="text-slate-800">
                <strong>Culture Represented:</strong> {ps.countryOrCultureRepresented}
              </p>
              <p className="text-slate-800">
                <strong>Performers:</strong> {ps.numberOfPerformers}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition"
          >
            Close
          </button>

          <div>
            {isSelected ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                  {mDict?.selectedLabel || "✓ Selected"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onUnselect(activity._id);
                    onClose();
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {mDict?.removeBtn || "Remove Selection"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSelect(activity._id);
                  onClose();
                }}
                disabled={isProcessing || !isRegistered || !activity.isSelectable}
                className="px-5 py-2.5 bg-[var(--color-navy)] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-50"
              >
                {!isRegistered ? "Register First" : !activity.isSelectable ? "Unavailable" : mDict?.joinBtn || "Join Activity"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
