"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { MemberType } from "@/lib/db/models/user";
import { updateMemberProfileAction } from "@/app/actions/auth-actions";

interface MemberProfileCompletionFormProps {
  userEmail: string;
  userName: string;
  defaultPhone?: string;
  defaultStudentId?: string;
  defaultInstitution?: string;
  locale: Locale;
}

export function MemberProfileCompletionForm({
  userEmail,
  userName,
  defaultPhone = "",
  defaultStudentId = "",
  defaultInstitution = "",
  locale,
}: MemberProfileCompletionFormProps) {
  const router = useRouter();
  const isVi = locale === "vi";

  const [memberType, setMemberType] = useState<MemberType>("FPT_CANTHO_STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("memberType", memberType);

    const res = await updateMemberProfileAction(formData);
    setSubmitting(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || "Failed to update profile.");
    }
  };

  return (
    <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4 text-xs">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-amber-950">
          {isVi ? "Cập nhật Phân loại Tài khoản" : "Complete Member Classification"}
        </h3>
        <p className="text-amber-800 leading-relaxed font-medium">
          {isVi
            ? "Để tiếp tục đăng ký tham dự Summit và tích lũy điểm/xác nhận tham dự, vui lòng hoàn tất thông tin phân loại tài khoản."
            : "Please complete your account classification to register for the Summit and enable event attendance verification."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-amber-200">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Account Name</span>
            <strong className="text-slate-900 text-xs">{userName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Account Email</span>
            <strong className="text-slate-900 font-mono text-xs">{userEmail}</strong>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isVi ? "Số điện thoại *" : "Phone Number *"}
          </label>
          <input
            type="tel"
            name="phone"
            required
            defaultValue={defaultPhone}
            placeholder="e.g. 0901234567"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
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
              defaultValue={defaultStudentId}
              placeholder="e.g. CE180000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
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
              defaultValue={defaultInstitution}
              placeholder={isVi ? "Ví dụ: Đại học Cần Thơ" : "e.g. Can Tho University"}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
        >
          {submitting ? "Updating..." : isVi ? "Cập nhật Thông tin Phân loại" : "Save Classification"}
        </button>
      </form>
    </div>
  );
}
