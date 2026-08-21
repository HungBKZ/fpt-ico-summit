"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession, signOut } from "next-auth/react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface AdminLoginFormProps {
  locale: Locale;
  dict: Dictionary;
}

export function AdminLoginForm({ locale, dict }: AdminLoginFormProps) {
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
        return;
      }

      // Re-verify role after authentication
      const session = await getSession();
      const userRole = (session?.user as { role?: string })?.role;

      if (userRole !== "ADMIN") {
        await signOut({ redirect: false });
        setLoading(false);
        setError("Administrator access required.");
        return;
      }

      router.push(`/${locale}/admin`);
      router.refresh();
    } catch {
      setLoading(false);
      setError(dict.auth.invalidCredentials);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">
          Admin Email Address *
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@fpticosummit.com"
          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">
          Password *
        </label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••••••"
          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[var(--color-navy)] text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-md"
      >
        {loading ? "Authenticating..." : "Sign In to Admin Portal"}
      </button>
    </form>
  );
}
