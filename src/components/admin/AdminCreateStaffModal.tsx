"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaffAccountAction } from "@/app/actions/auth-actions";

export function AdminCreateStaffModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    email: string;
    temporaryPassword: string;
    name: string;
    role: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createStaffAccountAction(formData);
    setSubmitting(false);

    if (res.success && res.credentials) {
      setCredentials(res.credentials);
      router.refresh();
    } else {
      setError(res.error || "Failed to create staff account.");
    }
  };

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(
      `Role: SUMMIT_STAFF\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
      >
        <span>+ Create Staff Account</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
            {!credentials ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Create Summit Staff Account
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Tran Van B"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. staff.member@fpt.edu.vn"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 0909876543"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      {submitting ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Credentials One-Time Display Modal */
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl space-y-1">
                  <strong className="block font-bold">⚠️ Copy Temporary Password Now</strong>
                  <p className="text-[11px] leading-relaxed">
                    This password is displayed ONCE ONLY. Staff user will be required to set a new password on first login.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Role</span>
                    <strong className="text-slate-900">{credentials.role}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Email</span>
                    <strong className="text-slate-900">{credentials.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Temporary Password</span>
                    <strong className="text-blue-700 text-sm font-bold tracking-wider">{credentials.temporaryPassword}</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    {copied ? "✓ Copied Credentials" : "Copy Credentials"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCredentials(null);
                      setIsOpen(false);
                    }}
                    className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
