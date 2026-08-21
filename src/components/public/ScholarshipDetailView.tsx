"use client";

import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { formatDateAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import { SafeHtml } from "@/components/ui/SafeHtml";

export interface PublicScholarshipDetail {
  id: string;
  type: "SHORT_TERM" | "LONG_TERM";
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  officialUrl: string;
  applicationDeadline?: string | null;
  fundingSummary?: string | null;
  eligibility?: string | null;
  bannerUrl?: string | null;
  provider: {
    id: string;
    name: string;
    type: "UNIVERSITY" | "CONSULATE";
    country: string;
    logoUrl?: string | null;
  };
}

interface ScholarshipDetailViewProps {
  scholarship: PublicScholarshipDetail;
  locale: Locale;
}

function optimizeCloudinaryBannerUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1000,c_fill,g_auto/");
}

function optimizeCloudinaryLogoUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_140,c_limit/");
}

/**
 * Reusable presentation component for detailed scholarship view.
 * Designed for reuse in both accessible modals and future /[locale]/scholarships/[slug] routes.
 */
export function ScholarshipDetailView({ scholarship, locale }: ScholarshipDetailViewProps) {
  const isVi = locale === "vi";
  const deadlineStr = formatDateAsiaHoChiMinh(scholarship.applicationDeadline, locale);

  return (
    <div className="space-y-6 text-xs text-slate-800">
      {/* 16:9 Banner Header */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden shadow-md">
        {scholarship.bannerUrl ? (
          <Image
            src={optimizeCloudinaryBannerUrl(scholarship.bannerUrl)}
            alt={scholarship.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized={!scholarship.bannerUrl.includes("res.cloudinary.com")}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-center">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              FPT ICO SUMMIT 2026 OFFICIAL SCHOLARSHIP
            </span>
          </div>
        )}
      </div>

      {/* Provider Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          {scholarship.provider.logoUrl ? (
            <div className="w-12 h-12 relative rounded-xl border border-slate-200 bg-white p-1 shadow-2xs flex items-center justify-center shrink-0">
              <Image
                src={optimizeCloudinaryLogoUrl(scholarship.provider.logoUrl)}
                alt={`${scholarship.provider.name} logo`}
                fill
                sizes="48px"
                className="object-contain p-0.5"
                unoptimized={!scholarship.provider.logoUrl.includes("res.cloudinary.com")}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 border border-white shadow-2xs">
              {scholarship.provider.name.charAt(0)}
            </div>
          )}

          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-tight">
              {scholarship.provider.name}
            </h4>
            <span className="text-[11px] text-slate-500 font-semibold">
              {scholarship.provider.country} • {scholarship.provider.type === "UNIVERSITY" ? (isVi ? "Trường Đại học Partner" : "Partner University") : (isVi ? "Lãnh sự quán Partner" : "Partner Consulate")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {scholarship.type === "LONG_TERM" ? (isVi ? "DÀI HẠN" : "LONG-TERM") : (isVi ? "NGẮN HẠN" : "SHORT-TERM")}
          </span>
          {deadlineStr && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Deadline: {deadlineStr}
            </span>
          )}
        </div>
      </div>

      {/* Scholarship Title & Short Description */}
      <div className="space-y-3">
        <h2 id="scholarship-detail-title" className="text-xl font-bold text-[var(--color-navy)] leading-snug">
          {scholarship.title}
        </h2>

        {scholarship.shortDescription && (
          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            {scholarship.shortDescription}
          </p>
        )}
      </div>

      {/* About the Scholarship (fullDescription) */}
      {scholarship.fullDescription && scholarship.fullDescription.trim() && (
        <div className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
            {isVi ? "Giới thiệu Học bổng" : "About the Scholarship"}
          </h3>
          <SafeHtml content={scholarship.fullDescription} />
        </div>
      )}

      {/* Funding & Financial Support (fundingSummary) */}
      {scholarship.fundingSummary && scholarship.fundingSummary.trim() && (
        <div className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
            {isVi ? "Quyền lợi & Hỗ trợ Tài chính" : "Funding & Financial Support"}
          </h3>
          <SafeHtml content={scholarship.fundingSummary} />
        </div>
      )}

      {/* Eligibility Criteria (eligibility) */}
      {scholarship.eligibility && scholarship.eligibility.trim() && (
        <div className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-[var(--color-navy)] border-b pb-2">
            {isVi ? "Điều kiện Ứng tuyển" : "Eligibility Criteria"}
          </h3>
          <SafeHtml content={scholarship.eligibility} />
        </div>
      )}

      {/* Primary External Official Link CTA */}
      <div className="pt-4 border-t border-slate-200">
        <a
          href={scholarship.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-md group"
        >
          <span>{isVi ? "Xem Trang Học bổng Chính thức" : "Visit Official Scholarship Page"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
