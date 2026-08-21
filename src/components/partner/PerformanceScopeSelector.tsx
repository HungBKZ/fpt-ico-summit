"use client";

import { useState } from "react";
import { PERFORMANCE_SCOPES, type PerformanceScopeId } from "@/lib/config/performance-scopes";
import type { Locale } from "@/i18n/config";
import { createActivityDraftAction } from "@/app/actions/activity-actions";

interface PerformanceScopeSelectorProps {
  locale: Locale;
  onCancel: () => void;
  onSuccess: (activityId: string) => void;
}

export function PerformanceScopeSelector({
  locale,
  onCancel,
  onSuccess,
}: PerformanceScopeSelectorProps) {
  const isVi = locale === "vi";
  const [selectedScopeId, setSelectedScopeId] = useState<PerformanceScopeId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmScope = async () => {
    setError("");
    if (!selectedScopeId) {
      setError(isVi ? "Vui lòng chọn 1 Phạm vi Biểu diễn." : "Please select a Performance Scope.");
      return;
    }

    setSubmitting(true);
    const res = await createActivityDraftAction("STAGE_PERFORMANCE", { performanceScopeId: selectedScopeId });
    setSubmitting(false);

    if (res.success && res.activityId) {
      onSuccess(res.activityId);
    } else {
      setError(res.error || "Failed to create Stage Performance proposal.");
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
            {isVi ? "Phạm vi Biểu diễn Sân khấu" : "Stage Performance Scope Selection"}
          </span>
          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-0.5">
            {isVi ? "Chọn Hạng mục & Phạm vi Biểu diễn" : "Select Performance Scope"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isVi
              ? "Chọn 1 trong 6 hạng mục nghệ thuật sân khấu phù hợp với đoàn hoặc tiết mục của đơn vị bạn."
              : "Choose 1 of the 6 artistic stage performance categories suitable for your delegation or act."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="py-1.5 px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
        >
          {isVi ? "Hủy bỏ" : "Cancel"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* 6 Scope Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERFORMANCE_SCOPES.map((scope) => {
          const isSelected = selectedScopeId === scope.id;

          return (
            <div
              key={scope.id}
              onClick={() => setSelectedScopeId(scope.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20 shadow-sm"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isVi ? scope.name.vi : scope.name.en}
                  </h3>
                  <span className={`text-xs font-bold ${isSelected ? "text-orange-700" : "text-slate-400"}`}>
                    {isSelected ? "✓ Selected" : "Select →"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isVi ? scope.description.vi : scope.description.en}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-medium">Suitable For:</span>
                  <span className="text-slate-700 font-medium">
                    {isVi ? scope.suitableFor.vi : scope.suitableFor.en}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Examples:</span>
                  <span className="text-slate-600 italic">
                    {isVi ? scope.examples.vi : scope.examples.en}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleConfirmScope}
          disabled={submitting || !selectedScopeId}
          className="py-2.5 px-6 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition disabled:opacity-50 shadow-sm"
        >
          {submitting
            ? isVi
              ? "Đang tạo..."
              : "Creating..."
            : isVi
            ? "Xác nhận & Nhập chi tiết Tiết mục →"
            : "Confirm & Enter Performance Details →"}
        </button>
      </div>
    </div>
  );
}
