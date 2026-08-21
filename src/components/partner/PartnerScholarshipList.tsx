"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Scholarship } from "@/lib/db/models/scholarship";
import { formatDateAsiaHoChiMinh, isDeadlineExpiredAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import { createScholarshipAction } from "@/app/actions/scholarship-actions";

interface PartnerScholarshipListProps {
  initialScholarships: Scholarship[];
  locale: Locale;
  dict: Dictionary;
}

export function PartnerScholarshipList({
  initialScholarships,
  locale,
  dict,
}: PartnerScholarshipListProps) {
  const router = useRouter();
  const t = dict.partnerScholarships;
  const cms = dict.partnerCms;

  const [scholarships] = useState<Scholarship[]>(initialScholarships);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setCreating(true);
    setError("");

    const res = await createScholarshipAction();
    if (res.success && res.scholarshipId) {
      router.push(`/${locale}/dashboard/scholarships/${res.scholarshipId}`);
    } else {
      setCreating(false);
      setError(res.error || "Failed to create scholarship.");
    }
  };

  const filteredScholarships = scholarships.filter((s) => {
    if (activeTab === "PUBLISHED") return s.isPublished;
    if (activeTab === "ALL") return true;
    return s.draftStatus === activeTab;
  });

  const renderStatusPill = (s: Scholarship) => {
    const isExpired = isDeadlineExpiredAsiaHoChiMinh(
      s.draftSnapshot?.applicationDeadline || s.publishedSnapshot?.applicationDeadline
    );

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {s.draftStatus === "CHANGES_REQUESTED" && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {cms.statusChangesRequested}
          </span>
        )}
        {s.draftStatus === "IN_REVIEW" && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {cms.statusInReview}
          </span>
        )}
        {s.isPublished && s.draftStatus === "NONE" && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {cms.statusPublished}
          </span>
        )}
        {s.draftStatus === "DRAFT" && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {cms.statusDraft}
          </span>
        )}
        {isExpired && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Expired
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          {/* Breadcrumbs & Back link */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href={`/${locale}/dashboard`} className="hover:text-blue-600 transition">
              {locale === "vi" ? "Tổng quan" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              {locale === "vi" ? "Học bổng" : "Scholarships"}
            </span>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            ← {locale === "vi" ? "Quay lại Tổng quan" : "Back to Dashboard"}
          </Link>
          <h1 className="text-xl font-bold text-[var(--color-navy)] pt-1">{t.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="py-2.5 px-4 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{creating ? "Creating Draft..." : t.addBtn}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { key: "ALL", label: "All Records" },
          { key: "IN_REVIEW", label: cms.statusInReview },
          { key: "CHANGES_REQUESTED", label: cms.statusChangesRequested },
          { key: "PUBLISHED", label: cms.statusPublished },
          { key: "DRAFT", label: cms.statusDraft },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[var(--color-navy)] text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scholarship Items List */}
      {filteredScholarships.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-400 mb-2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <p className="text-xs font-semibold text-slate-600">{t.emptyList}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScholarships.map((s) => {
            const snap = s.draftSnapshot || s.publishedSnapshot;
            const titleStr =
              (locale === "vi" ? snap?.title?.vi : snap?.title?.en) ||
              snap?.title?.en ||
              "Untitled Scholarship";
            const bannerUrl = snap?.banner?.secureUrl;
            const deadlineStr = formatDateAsiaHoChiMinh(snap?.applicationDeadline, locale);

            return (
              <div
                key={s._id?.toString()}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition group"
              >
                {/* 16:9 Banner Header */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  {bannerUrl ? (
                    <Image
                      src={bannerUrl}
                      alt={titleStr}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-blue-950 flex items-center justify-center p-4">
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        NO BANNER UPLOADED
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-10">{renderStatusPill(s)}</div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {snap?.type === "LONG_TERM" ? t.longTerm : t.shortTerm}
                      </span>
                      {deadlineStr && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Deadline: {deadlineStr}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {titleStr}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Updated {new Date(s.updatedAt).toLocaleDateString(locale)}
                    </span>

                    <Link
                      href={`/${locale}/dashboard/scholarships/${s._id?.toString()}`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
                    >
                      {t.editBtn} →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
