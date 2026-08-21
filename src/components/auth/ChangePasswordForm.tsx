"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { changePasswordAction } from "@/app/actions/auth-actions";

interface ChangePasswordFormProps {
  locale: Locale;
  dict: Dictionary;
}

export function ChangePasswordForm({ locale, dict }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) {
      setLoading(false);
      setError(dict.changePassword.mismatchError);
      return;
    }

    try {
      const res = await changePasswordAction(formData);
      if (res.success) {
        setSuccess(true);
        // Force sign out after password change and redirect to login
        setTimeout(() => {
          signOut({ callbackUrl: `/${locale}/login` });
        }, 1500);
      } else {
        setLoading(false);
        setError(res.error || "Failed to update password.");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
        {dict.changePassword.successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.changePassword.currentPasswordLabel} *
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.changePassword.newPasswordLabel} *
        </label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={12}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.changePassword.confirmPasswordLabel} *
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
        {loading
          ? dict.changePassword.updating
          : dict.changePassword.submitBtn}
      </button>
    </form>
  );
}
