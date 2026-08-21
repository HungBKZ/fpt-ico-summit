"use client";

import { useState } from "react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { AccountRequestType } from "@/lib/db/models/account-request";
import type { PartnerType } from "@/lib/db/models/user";
import { submitAccountRequestAction } from "@/app/actions/auth-actions";

interface RequestAccountFormProps {
  locale: Locale;
  dict: Dictionary;
}

export function RequestAccountForm({ dict }: RequestAccountFormProps) {
  const [requestType, setRequestType] = useState<AccountRequestType>("PARTNER");
  const [partnerType, setPartnerType] = useState<PartnerType>("UNIVERSITY");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    formData.set("requestType", requestType);
    if (requestType === "PARTNER") {
      formData.set("partnerType", partnerType);
    }

    try {
      const res = await submitAccountRequestAction(formData);
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Failed to submit request.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
        <h3 className="font-semibold text-lg mb-1">{dict.requestAccount.successMessage}</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setRequestType("PARTNER")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition ${
            requestType === "PARTNER"
              ? "bg-white text-[var(--color-navy)] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {dict.requestAccount.partnerTab}
        </button>
        <button
          type="button"
          onClick={() => setRequestType("MEMBER")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition ${
            requestType === "MEMBER"
              ? "bg-white text-[var(--color-navy)] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {dict.requestAccount.memberTab}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {requestType === "PARTNER" ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.orgTypeLabel}
              </label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as PartnerType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="UNIVERSITY">University</option>
                <option value="CONSULATE">Consulate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.orgNameLabel} *
              </label>
              <input
                type="text"
                name="organizationName"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.countryLabel} *
              </label>
              <input
                type="text"
                name="country"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.contactNameLabel} *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.positionLabel}
              </label>
              <input
                type="text"
                name="position"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.contactNameLabel} *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.schoolLabel}
              </label>
              <input
                type="text"
                name="schoolOrUniversity"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.requestAccount.studentIdLabel}
              </label>
              <input
                type="text"
                name="studentId"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {dict.requestAccount.emailLabel} *
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {dict.requestAccount.phoneLabel}
          </label>
          <input
            type="tel"
            name="phone"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {dict.requestAccount.noteLabel}
          </label>
          <textarea
            name="note"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        {status === "error" && (
          <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
        >
          {status === "loading"
            ? dict.requestAccount.submitting
            : dict.requestAccount.submitBtn}
        </button>
      </form>
    </div>
  );
}
