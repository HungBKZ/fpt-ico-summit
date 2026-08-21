"use client";

import { useState } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { MemberType } from "@/lib/db/models/user";
import { registerMemberAction } from "@/app/actions/auth-actions";

interface RegisterFormProps {
  locale: Locale;
  dict: Dictionary;
}

export function RegisterForm({ locale, dict }: RegisterFormProps) {
  const [memberType, setMemberType] = useState<MemberType>("FPT_CANTHO_STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("memberType", memberType);

    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setLoading(false);
      setError(dict.register.passwordMismatchError);
      return;
    }

    try {
      const res = await registerMemberAction(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setLoading(false);
        setError(res.error || "Registration failed.");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-3">
        <h3 className="font-semibold text-lg">{dict.register.successMessage}</h3>
        <Link
          href={`/${locale}/login`}
          className="inline-block py-2 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
        >
          {dict.nav.signIn}
        </Link>
      </div>
    );
  }

  const isVi = locale === "vi";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Member Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">
          {isVi ? "Bạn thuộc nhóm nào? *" : "Participant Type *"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setMemberType("FPT_CANTHO_STUDENT")}
            className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
              memberType === "FPT_CANTHO_STUDENT"
                ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 font-bold"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            }`}
          >
            <span className="text-xs">
              {isVi ? "Sinh viên FPT University Cần Thơ" : "FPT University Can Tho Student"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMemberType("EXTERNAL_PARTICIPANT")}
            className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
              memberType === "EXTERNAL_PARTICIPANT"
                ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 font-bold"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            }`}
          >
            <span className="text-xs">
              {isVi ? "Người tham dự khác" : "Other Participant"}
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.register.nameLabel} *
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Nguyen Van A"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.register.emailLabel} *
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="e.g. name@domain.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.register.phoneLabel} *
        </label>
        <input
          type="tel"
          name="phone"
          required
          placeholder="e.g. 0901234567"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
        />
      </div>

      {memberType === "FPT_CANTHO_STUDENT" ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isVi ? "Mã số sinh viên (MSSV) *" : "Student ID (MSSV) *"}
          </label>
          <input
            type="text"
            name="studentId"
            required
            placeholder="e.g. CE180000"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">
            {isVi
              ? "Trường / Đơn vị: FPT University Can Tho Campus"
              : "Institution: FPT University Can Tho Campus"}
          </span>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isVi ? "Trường / Đơn vị công tác (Không bắt buộc)" : "School / Institution (Optional)"}
          </label>
          <input
            type="text"
            name="institution"
            placeholder={isVi ? "Ví dụ: Đại học Cần Thơ" : "e.g. Can Tho University"}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.register.passwordLabel} *
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={12}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.register.confirmPasswordLabel} *
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={12}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
      >
        {loading ? dict.register.submitting : dict.register.submitBtn}
      </button>

      <div className="text-center pt-2">
        <Link
          href={`/${locale}/login`}
          className="text-xs text-slate-600 hover:text-[var(--color-navy)] underline font-medium"
        >
          {dict.nav.signIn}
        </Link>
      </div>
    </form>
  );
}
