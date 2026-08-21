"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { searchWalkInCandidatesAction } from "@/app/actions/activity-attendance-actions";
import type { WalkInCandidateRow } from "@/lib/db/repositories/summit-activity-attendances";

interface StaffWalkInSearchModalProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
  onMarkWalkIn: (registrationId: string) => Promise<void>;
  isProcessing: boolean;
  locale: Locale;
  dict: Dictionary;
}

export function StaffWalkInSearchModal({
  activityId,
  activityTitle,
  onClose,
  onMarkWalkIn,
  isProcessing,
  locale,
}: StaffWalkInSearchModalProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(true);
  const [pendingRegId, setPendingRegId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<WalkInCandidateRow[]>([]);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load of suggestions
  useEffect(() => {
    let isMounted = true;
    searchWalkInCandidatesAction(activityId, "").then((res) => {
      if (isMounted) {
        setIsSearching(false);
        setIsInitialLoaded(true);
        if (res.success && res.candidates) {
          setCandidates(res.candidates);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activityId]);

  // Debounced search when user types >= 2 chars
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      if (isInitialLoaded) {
        searchWalkInCandidatesAction(activityId, "").then((res) => {
          if (res.success && res.candidates) setCandidates(res.candidates);
        });
      }
      return;
    }

    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      const res = await searchWalkInCandidatesAction(activityId, trimmed);
      setIsSearching(false);
      if (res.success && res.candidates) {
        setCandidates(res.candidates);
      } else {
        setError(res.error || "Failed to search candidates.");
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, activityId, isInitialLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0 || trimmed.length >= 2) {
      setIsSearching(true);
      setError(null);
      const res = await searchWalkInCandidatesAction(activityId, trimmed);
      setIsSearching(false);
      if (res.success && res.candidates) {
        setCandidates(res.candidates);
      } else {
        setError(res.error || "Failed to search candidates.");
      }
    }
  };

  const handleMarkAction = async (registrationId: string) => {
    setPendingRegId(registrationId);
    try {
      await onMarkWalkIn(registrationId);
    } finally {
      setPendingRegId(null);
    }
  };

  const isBusy = isProcessing || pendingRegId !== null;
  const activeCandidates = query.trim().length === 1 ? [] : candidates;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden my-8 border border-slate-200">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              + Walk-in Attendance
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">{activityTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locale === "vi"
                    ? "Tìm tên, MSSV, SĐT, hoặc email người tham gia Summit..."
                    : "Search registered participant name, MSSV, phone, or email..."
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5 text-slate-400 animate-spin text-xs">
                  ⏳
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || isBusy}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {query.trim().length === 1 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                Please type at least 2 characters to search...
              </p>
            ) : isSearching && activeCandidates.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                Searching eligible walk-in candidates...
              </p>
            ) : activeCandidates.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center font-medium">
                {query.trim().length > 0
                  ? `No un-selected registered participants matched "${query}".`
                  : "No un-selected registered participants found for walk-in."}
              </p>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  {query.trim().length === 0 ? "Suggested Candidates" : `Search Results (${activeCandidates.length})`}
                </span>
                <div className="space-y-2">
                  {activeCandidates.map((c) => {
                    const isRowPending = pendingRegId === c.registrationId;

                    return (
                      <div
                        key={c.registrationId}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{c.fullName}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                c.participantType === "FPT_STUDENT"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {c.participantType === "FPT_STUDENT" ? "FPT Student" : "External"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {c.studentId ? `MSSV: ${c.studentId} • ` : ""}
                            {c.phone} • {c.email}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMarkAction(c.registrationId)}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-2xs disabled:opacity-40 shrink-0"
                        >
                          {isRowPending ? "..." : "Mark Walk-in"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
