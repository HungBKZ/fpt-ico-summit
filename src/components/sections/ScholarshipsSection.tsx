"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatDateAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import { ScholarshipDetailModal } from "@/components/public/ScholarshipDetailModal";
import type { PublicScholarshipDetail } from "@/components/public/ScholarshipDetailView";

type PublicScholarship = PublicScholarshipDetail;

interface ScholarshipsSectionProps {
  locale: Locale;
  dict: Dictionary;
}

type OpportunityTypeFilter = "All" | "SHORT_TERM" | "LONG_TERM";
type ProviderTypeFilter = "All" | "UNIVERSITY" | "CONSULATE";

function optimizeCloudinaryBannerUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_600,c_fill,g_auto/");
}

function optimizeCloudinaryLogoUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_120,c_limit/");
}

export function ScholarshipsSection({ locale, dict }: ScholarshipsSectionProps) {
  const [dbScholarships, setDbScholarships] = useState<PublicScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDetailScholarship, setActiveDetailScholarship] = useState<PublicScholarshipDetail | null>(null);

  const [activeType, setActiveType] = useState<OpportunityTypeFilter>("All");
  const [activeProvider, setActiveProvider] = useState<ProviderTypeFilter>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/public/scholarships?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.scholarships)) {
          setDbScholarships(data.scholarships);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  // Dynamically derive unique list of participating countries from published scholarships
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    dbScholarships.forEach((s) => {
      if (s.provider?.country) set.add(s.provider.country);
    });
    return Array.from(set).sort();
  }, [dbScholarships]);

  const filteredScholarships = useMemo(() => {
    return dbScholarships.filter((s) => {
      if (activeType !== "All" && s.type !== activeType) return false;
      if (activeProvider !== "All" && s.provider.type !== activeProvider) return false;
      if (
        selectedCountry !== "All" &&
        s.provider.country.toLowerCase() !== selectedCountry.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [dbScholarships, activeType, activeProvider, selectedCountry]);

  return (
    <section
      id="scholarships"
      aria-labelledby="scholarships-heading"
      className="section--tinted section--scholarships"
    >
      <div className="site-container section-padding">
        <div style={{ marginBottom: "2rem" }}>
          <SectionHeading
            id="scholarships-heading"
            className="section-heading--tinted"
            eyebrow={dict.scholarships.eyebrow}
            heading={dict.scholarships.title}
            body={dict.scholarships.subtitle}
            level="h2"
            align="center"
            accent={true}
          />
        </div>

        {/* Primary Filter Tabs: Opportunity Type */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {[
            { key: "All", label: "All Opportunities" },
            { key: "SHORT_TERM", label: "Short-term Opportunities" },
            { key: "LONG_TERM", label: "Long-term Scholarships" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveType(t.key as OpportunityTypeFilter)}
              className={`py-2 px-5 rounded-full text-xs font-bold transition shadow-xs ${
                activeType === t.key
                  ? "bg-[var(--color-navy)] text-white shadow-md"
                  : "bg-white/80 text-slate-700 hover:bg-white border border-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Provider Type & Dynamic Country */}
        <div className="flex justify-center flex-wrap items-center gap-3 mb-8 text-xs">
          {/* Provider Filter */}
          <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-slate-200">
            {[
              { key: "All", label: "All Providers" },
              { key: "UNIVERSITY", label: "Universities" },
              { key: "CONSULATE", label: "Consulates" },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActiveProvider(p.key as ProviderTypeFilter)}
                className={`py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                  activeProvider === p.key
                    ? "bg-[var(--color-blue)] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dynamic Country Selector */}
          {availableCountries.length > 0 && (
            <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCountry("All")}
                className={`py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                  selectedCountry === "All"
                    ? "bg-[var(--color-orange)] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Countries
              </button>
              {availableCountries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                    selectedCountry === c
                      ? "bg-[var(--color-orange)] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-white/60 rounded-2xl border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredScholarships.length === 0 ? (
          /* Polished Empty State */
          <div className="text-center py-12 px-6 bg-white/80 rounded-2xl border border-slate-200/80 max-w-lg mx-auto shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              {locale === "vi"
                ? "Các cơ hội học bổng đã được xác nhận sẽ được cập nhật tại đây."
                : "Confirmed scholarship opportunities will be published here as they become available."}
            </p>
          </div>
        ) : (
          /* Premium Scholarship Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((s) => {
              const deadlineStr = formatDateAsiaHoChiMinh(s.applicationDeadline, locale);

              return (
                <article
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top 16:9 Scholarship Banner Header */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
                    {s.bannerUrl ? (
                      <Image
                        src={optimizeCloudinaryBannerUrl(s.bannerUrl)}
                        alt={s.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={!s.bannerUrl.includes("res.cloudinary.com")}
                      />
                    ) : (
                      /* Designed Summit Fallback Banner Artwork */
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
                        <svg
                          className="absolute inset-0 w-full h-full opacity-20 text-white/40 pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="0 0 L100 100 M0 50 L100 150 M-50 0 L50 100"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            fill="none"
                          />
                        </svg>
                        <div className="text-center z-10">
                          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
                            FPT ICO SUMMIT 2026
                          </span>
                          <span className="text-xs font-bold text-white/80 block mt-0.5">
                            Official Scholarship Opportunity
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Provider Logo Badge Overlay & Badges */}
                  <div className="-mt-8 px-5 flex items-end justify-between gap-3 relative z-10">
                    {s.provider.logoUrl ? (
                      <div className="w-14 h-14 relative rounded-xl border border-slate-200 bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                        <Image
                          src={optimizeCloudinaryLogoUrl(s.provider.logoUrl)}
                          alt={`${s.provider.name} logo`}
                          fill
                          sizes="56px"
                          className="object-contain p-0.5"
                          unoptimized={!s.provider.logoUrl.includes("res.cloudinary.com")}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0 border border-white shadow-md">
                        {s.provider.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {s.type === "LONG_TERM" ? "LONG-TERM" : "SHORT-TERM"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {s.provider.country}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-5 pt-3 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 truncate max-w-[60%]">{s.provider.name}</span>
                        {deadlineStr && (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                            Deadline: {deadlineStr}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {s.title}
                      </h3>

                      {s.shortDescription && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {s.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-auto">
                      <button
                        type="button"
                        onClick={() => setActiveDetailScholarship(s)}
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-2xs group"
                      >
                        <span>{locale === "vi" ? "Xem chi tiết" : "View Details"}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="group-hover:translate-x-1 transition-transform"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Public Scholarship Detail Modal */}
      <ScholarshipDetailModal
        scholarship={activeDetailScholarship}
        locale={locale}
        onClose={() => setActiveDetailScholarship(null)}
      />
    </section>
  );
}
