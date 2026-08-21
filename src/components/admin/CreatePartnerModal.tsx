"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/types";
import { createPartnerAccountAction } from "@/app/actions/auth-actions";

interface CreatePartnerModalProps {
  dict: Dictionary;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePartnerModal({ dict, onClose, onSuccess }: CreatePartnerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
    organizationName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createPartnerAccountAction(formData);
      if (res.success && res.credentials) {
        setCredentials(res.credentials);
        // Do NOT call onSuccess() here; keep credentials displayed until Admin clicks Done.
      } else {
        setLoading(false);
        setError(res.error || "Failed to create partner account.");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  const handleCopy = () => {
    if (!credentials) return;
    const text = `Organization: ${credentials.organizationName}\nName: ${credentials.name}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-[var(--color-navy)]">
            {credentials ? dict.admin.modalTitle : dict.admin.createPartnerBtn}
          </h3>
          <button
            type="button"
            onClick={credentials ? handleFinish : onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold text-lg"
          >
            ✕
          </button>
        </div>

        {credentials ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg font-medium">
              {dict.admin.modalWarning}
            </div>

            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs">
              <div>
                <span className="text-slate-500 block">Organization:</span>
                <span className="font-bold text-slate-900">{credentials.organizationName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Representative:</span>
                <span className="font-bold text-slate-900">{credentials.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Work Email:</span>
                <span className="font-bold text-slate-900">{credentials.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Temporary Password:</span>
                <span className="font-bold text-emerald-700 select-all">{credentials.temporaryPassword}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2.5 px-4 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
              >
                {copied ? "Copied!" : dict.admin.copyBtn}
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
              >
                {dict.admin.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.orgTypeLabel} *
              </label>
              <select
                name="partnerType"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="UNIVERSITY">University</option>
                <option value="CONSULATE">Consulate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.orgNameLabel} *
              </label>
              <input
                type="text"
                name="organizationName"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.countryLabel} *
              </label>
              <input
                type="text"
                name="country"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.repNameLabel} *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.emailLabel} *
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.positionLabel}
              </label>
              <input
                type="text"
                name="position"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {dict.admin.phoneLabel}
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {loading ? "Creating..." : "Create Partner Account"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
