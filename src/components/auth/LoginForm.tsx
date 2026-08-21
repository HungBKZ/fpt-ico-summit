"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface LoginFormProps {
  locale: Locale;
  dict: Dictionary;
  redirectTo?: string;
}

export function LoginForm({ locale, dict, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError(dict.auth.invalidCredentials);
      } else {
        router.push(redirectTo || `/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError(dict.auth.invalidCredentials);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {dict.auth.emailLabel} *
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
          {dict.auth.passwordLabel} *
        </label>
        <input
          type="password"
          name="password"
          required
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
        {loading ? dict.auth.signingIn : dict.auth.signInBtn}
      </button>
    </form>
  );
}
