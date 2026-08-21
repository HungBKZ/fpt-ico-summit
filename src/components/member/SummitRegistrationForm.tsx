"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberType } from "@/lib/db/models/user";
import { registerForSummitAction } from "@/app/actions/registration-actions";

interface SummitRegistrationFormProps {
  userEmail: string;
  defaultName?: string;
  defaultPhone?: string;
  studentId?: string;
  institution?: string;
  memberType: MemberType;
  locale: Locale;
  dict: Dictionary;
}

export function SummitRegistrationForm({
  userEmail,
  defaultName = "",
  defaultPhone = "",
  studentId = "",
  institution = "",
  memberType,
  locale,
  dict,
}: SummitRegistrationFormProps) {
  const router = useRouter();
  const reg = dict.memberRegistration;
  const isVi = locale === "vi";
  const isFptStudent = memberType === "FPT_CANTHO_STUDENT";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await registerForSummitAction(formData);
    setSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* Read-Only Account Identity Summary Card */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-blue-100 pb-2">
          <span className="text-[11px] text-blue-800 font-bold uppercase tracking-wider">
            {reg.participantTypeLabel}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
            {isFptStudent
              ? isVi
                ? "Sinh viên FPT University Cần Thơ"
                : "FPT University Can Tho Student"
              : isVi
              ? "Người tham dự ngoài FPT"
              : "External Participant"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {isFptStudent ? (
            <>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Trường / Đơn vị</span>
                <strong className="text-slate-900 font-semibold">FPT University Can Tho Campus</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">{reg.studentIdLabel}</span>
                <strong className="text-slate-900 font-mono font-bold uppercase">{studentId}</strong>
              </div>
            </>
          ) : (
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                {isVi ? "Trường / Đơn vị công tác" : "School / Institution"}
              </span>
              <strong className="text-slate-900 font-semibold">
                {institution || (isVi ? "Tự do" : "Independent / General")}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Account Email Read-Only Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-600 font-medium">{reg.emailNotice}</span>
        <strong className="text-xs text-slate-900 font-bold font-mono">{userEmail}</strong>
      </div>

      {/* Inputs */}
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {reg.fullNameLabel} *
          </label>
          <input
            type="text"
            name="fullName"
            required
            defaultValue={defaultName}
            placeholder="e.g. Nguyen Van A"
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {reg.phoneLabel} *
          </label>
          <input
            type="tel"
            name="phone"
            required
            defaultValue={defaultPhone}
            placeholder="e.g. 0901234567"
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-mono"
          />
        </div>
      </div>

      {/* Submission Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-md disabled:opacity-50"
        >
          {submitting ? reg.submitting : reg.submitBtn}
        </button>
      </div>
    </form>
  );
}
