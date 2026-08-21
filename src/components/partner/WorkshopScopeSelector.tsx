"use client";

import { useState } from "react";
import { WORKSHOP_TRACKS, type WorkshopTrackId } from "@/lib/config/workshop-tracks";
import type { OrganizationType } from "@/lib/db/models/organization";
import type { Locale } from "@/i18n/config";
import { createActivityDraftAction, submitTopicProposalAction } from "@/app/actions/activity-actions";

interface WorkshopScopeSelectorProps {
  partnerOrgType?: OrganizationType;
  locale: Locale;
  onCancel: () => void;
  onSuccess: (activityId: string) => void;
}

export function WorkshopScopeSelector({
  partnerOrgType = "UNIVERSITY",
  locale,
  onCancel,
  onSuccess,
}: WorkshopScopeSelectorProps) {
  const isVi = locale === "vi";
  const [selectedTrackId, setSelectedTrackId] = useState<WorkshopTrackId | null>(null);
  const [topicType, setTopicType] = useState<"SUGGESTED" | "CUSTOM">("SUGGESTED");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [customTopicTitle, setCustomTopicTitle] = useState("");
  const [customTopicFitReason, setCustomTopicFitReason] = useState("");

  const [tentativeTitleEn, setTentativeTitleEn] = useState("");
  const [tentativeTitleVi, setTentativeTitleVi] = useState("");
  const [conceptSummaryEn, setConceptSummaryEn] = useState("");
  const [conceptSummaryVi, setConceptSummaryVi] = useState("");
  const [presentationLanguage, setPresentationLanguage] = useState<"ENGLISH" | "VIETNAMESE" | "BILINGUAL" | "OTHER">("ENGLISH");
  const [otherLanguage, setOtherLanguage] = useState("");

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Track & Topic selection, Step 2: Tentative Topic Proposal details
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTrack = WORKSHOP_TRACKS.find((t) => t.id === selectedTrackId);

  const handleNextStep = () => {
    setError("");
    if (!selectedTrackId) {
      setError(isVi ? "Vui lòng chọn 1 Nhóm chủ đề (Track)." : "Please select a Workshop Track.");
      return;
    }
    if (topicType === "SUGGESTED" && !selectedTopicId) {
      setError(isVi ? "Vui lòng chọn 1 chủ đề gợi ý hoặc chọn đề xuất chủ đề khác." : "Please select a suggested topic or propose a custom topic.");
      return;
    }
    if (topicType === "CUSTOM") {
      if (!customTopicTitle.trim()) {
        setError(isVi ? "Vui lòng nhập tên chủ đề đề xuất." : "Please enter custom topic title.");
        return;
      }
      if (!customTopicFitReason.trim()) {
        setError(isVi ? "Vui lòng giải thích lý do chủ đề này phù hợp với Track đã chọn." : "Please explain why this topic fits the selected Track.");
        return;
      }
    }
    setStep(2);
  };

  const handleSubmitTopicProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tentativeTitleEn.trim()) {
      setError(isVi ? "Vui lòng nhập Tên Workshop dự kiến (tiếng Anh)." : "Tentative Workshop Title (EN) is required.");
      return;
    }
    if (!conceptSummaryEn.trim()) {
      setError(isVi ? "Vui lòng nhập Tóm tắt ý tưởng (tiếng Anh)." : "Short Concept / Rationale (EN) is required.");
      return;
    }

    setSubmitting(true);

    // Step 1: Create DRAFT activity record with trackId
    const createRes = await createActivityDraftAction("WORKSHOP", { trackId: selectedTrackId! });
    if (!createRes.success || !createRes.activityId) {
      setSubmitting(false);
      setError(createRes.error || "Failed to initialize Workshop proposal.");
      return;
    }

    const activityId = createRes.activityId;

    // Step 2: Submit Stage A Topic Proposal
    const formData = new FormData();
    formData.set("trackId", selectedTrackId!);
    formData.set("topicSelectionType", topicType);
    if (topicType === "SUGGESTED") {
      formData.set("topicId", selectedTopicId);
    } else {
      formData.set("customTopicTitle", customTopicTitle);
      formData.set("customTopicFitReason", customTopicFitReason);
    }
    formData.set("tentativeTitleEn", tentativeTitleEn);
    formData.set("tentativeTitleVi", tentativeTitleVi);
    formData.set("conceptSummaryEn", conceptSummaryEn);
    formData.set("conceptSummaryVi", conceptSummaryVi);
    formData.set("presentationLanguage", presentationLanguage);
    if (presentationLanguage === "OTHER") {
      formData.set("otherLanguage", otherLanguage);
    }

    const submitRes = await submitTopicProposalAction(activityId, formData);
    setSubmitting(false);

    if (submitRes.success) {
      onSuccess(activityId);
    } else {
      setError(submitRes.error || "Failed to submit Topic Proposal.");
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            {isVi ? "Bước 1 / 2: Phạm vi & Đề xuất Chủ đề Workshop" : "Step 1 of 2: Workshop Scope & Topic Proposal"}
          </span>
          <h2 className="text-xl font-bold text-[var(--color-navy)] mt-0.5">
            {isVi ? "Chọn Nhóm Chủ đề (Workshop Track)" : "Select Workshop Track & Scope"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isVi
              ? "Chọn 1 trong 6 Nhóm chủ đề chuẩn hóa. Đề xuất chủ đề để Admin xem xét trước khi hoàn thiện nội dung diễn giả."
              : "Choose from 6 standardized Workshop Tracks. Submit a Topic Proposal for Admin review prior to full content completion."}
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

      {step === 1 ? (
        /* STEP 1: Track & Topic Selection */
        <div className="space-y-6">
          {/* 6 Track Cards Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. {isVi ? "Chọn Nhóm Chủ đề (Workshop Track)" : "Select Primary Workshop Track"}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORKSHOP_TRACKS.map((t) => {
                const isSelected = selectedTrackId === t.id;
                const isRecommended = t.recommendedOrganizationTypes.includes(partnerOrgType);

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTrackId(t.id);
                      setSelectedTopicId("");
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--color-navy)]">
                          {isVi ? t.name.vi : t.name.en}
                        </span>
                        {isRecommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            ★ {isVi ? "Khuyên dùng cho đơn vị bạn" : "Recommended for your type"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isVi ? t.description.vi : t.description.en}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {t.suggestedTopics.length} {isVi ? "chủ đề gợi ý" : "suggested topics"}
                      </span>
                      <span className={`font-bold ${isSelected ? "text-blue-700" : "text-slate-400"}`}>
                        {isSelected ? "✓ Selected" : "Select →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Topics List for Selected Track */}
          {selectedTrack && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. {isVi ? `Chủ đề thuộc Track: ${selectedTrack.name.vi}` : `Topics under Track: ${selectedTrack.name.en}`}
              </label>

              <div className="space-y-2">
                {selectedTrack.suggestedTopics.map((top) => {
                  const isChecked = topicType === "SUGGESTED" && selectedTopicId === top.id;
                  return (
                    <label
                      key={top.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isChecked ? "bg-white border-blue-500 shadow-2xs" : "bg-white/60 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="topicSelection"
                        checked={isChecked}
                        onChange={() => {
                          setTopicType("SUGGESTED");
                          setSelectedTopicId(top.id);
                        }}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        {isVi ? top.title.vi : top.title.en}
                      </span>
                    </label>
                  );
                })}

                {/* Custom Topic Choice */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    topicType === "CUSTOM" ? "bg-white border-blue-500 shadow-2xs" : "bg-white/60 border-slate-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="topicSelection"
                    checked={topicType === "CUSTOM"}
                    onChange={() => {
                      setTopicType("CUSTOM");
                      setSelectedTopicId("");
                    }}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-bold text-blue-700 block">
                      💡 {isVi ? "Đề xuất chủ đề khác trong Track này" : "Propose another topic within this Track"}
                    </span>
                  </div>
                </label>

                {topicType === "CUSTOM" && (
                  <div className="p-4 bg-white rounded-xl border border-blue-200 space-y-3 mt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isVi ? "Tên chủ đề đề xuất *" : "Proposed Topic Title *"}
                      </label>
                      <input
                        type="text"
                        value={customTopicTitle}
                        onChange={(e) => setCustomTopicTitle(e.target.value)}
                        placeholder={isVi ? "Ví dụ: AI trong giảng dạy Y khoa..." : "e.g., AI in Medical Education..."}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isVi ? "Lý do chủ đề này phù hợp với Track này *" : "Why this topic fits the selected Track *"}
                      </label>
                      <textarea
                        rows={2}
                        value={customTopicFitReason}
                        onChange={(e) => setCustomTopicFitReason(e.target.value)}
                        placeholder={isVi ? "Giải thích ngắn gọn lý do chọn..." : "Briefly explain the rationale..."}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleNextStep}
              className="py-2.5 px-6 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              {isVi ? "Tiếp tục: Nhập thông tin Đề xuất →" : "Next: Topic Proposal Details →"}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: Tentative Proposal Details */
        <form onSubmit={handleSubmitTopicProposal} className="space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-blue-900 block">
              Track: {isVi ? selectedTrack?.name.vi : selectedTrack?.name.en}
            </span>
            <span className="text-blue-800 block">
              Topic:{" "}
              {topicType === "CUSTOM"
                ? customTopicTitle
                : selectedTrack?.suggestedTopics.find((tp) => tp.id === selectedTopicId)?.title[locale] || selectedTopicId}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isVi ? "Tên Workshop dự kiến (Tiếng Anh) *" : "Tentative Workshop Title (English) *"}
              </label>
              <input
                type="text"
                required
                value={tentativeTitleEn}
                onChange={(e) => setTentativeTitleEn(e.target.value)}
                placeholder="e.g. AI-Powered Personal Study Workflows"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isVi ? "Tiêu đề Workshop dự kiến (Tiếng Việt — Không bắt buộc)" : "Tentative Workshop Title (Vietnamese — Optional)"}
              </label>
              <input
                type="text"
                value={tentativeTitleVi}
                onChange={(e) => setTentativeTitleVi(e.target.value)}
                placeholder="Ví dụ: Ứng dụng AI trong quy trình học tập cá nhân"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isVi ? "Tóm tắt Ý tưởng & Mục tiêu (Tiếng Anh) *" : "Short Concept / Rationale (English) *"}
              </label>
              <textarea
                rows={3}
                required
                value={conceptSummaryEn}
                onChange={(e) => setConceptSummaryEn(e.target.value)}
                placeholder="Explain the main focus, learning goals, and key value for students..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isVi ? "Mô tả / Lý do đề xuất ngắn (Tiếng Việt — Không bắt buộc)" : "Short Concept / Rationale (Vietnamese — Optional)"}
              </label>
              <textarea
                rows={3}
                value={conceptSummaryVi}
                onChange={(e) => setConceptSummaryVi(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung trọng tâm và giá trị mang lại..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isVi ? "Ngôn ngữ trình bày *" : "Presentation Language *"}
                </label>
                <select
                  value={presentationLanguage}
                  onChange={(e) => setPresentationLanguage(e.target.value as "ENGLISH" | "VIETNAMESE" | "BILINGUAL" | "OTHER")}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ENGLISH">English</option>
                  <option value="VIETNAMESE">Vietnamese</option>
                  <option value="BILINGUAL">Bilingual (EN + VI)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {presentationLanguage === "OTHER" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isVi ? "Tên ngôn ngữ khác *" : "Specify Language *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={otherLanguage}
                    onChange={(e) => setOtherLanguage(e.target.value)}
                    placeholder="Japanese, French, etc."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Read-Only Standard Session Format Badge */}
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                ⏱️ {isVi ? "Thời lượng chuẩn:" : "Standard Session Format:"}
              </span>
              <span className="font-semibold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                30 mins (20m presentation · 7m Q&A · 3m transition)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              ← {isVi ? "Quay lại chọn Track" : "Back to Track selection"}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
            >
              {submitting
                ? isVi
                  ? "Đang gửi..."
                  : "Submitting..."
                : isVi
                ? "Gửi Đề xuất Chủ đề (Stage A) →"
                : "Submit Topic Proposal (Stage A) →"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
