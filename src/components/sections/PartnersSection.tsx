"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getConfirmedConsulates,
} from "@/data/consulates";
import {
  getConfirmedUniversities,
  universityCountryKeys,
  getCountryLabel,
  CountryKey,
} from "@/data/universities";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { PartnerDetailModal, type PublicPartnerDetail } from "@/components/public/PartnerDetailModal";

type PublicPartner = PublicPartnerDetail;

interface PartnersSectionProps {
  locale: Locale;
  dict: Dictionary;
}

type PartnerTab = "All" | "Consulates" | "Universities";

const COVER_HEIGHT = 124; // px — compact showcase cover, not half the card
const LOGO_OVERLAP = 22; // px — logo emblem half above / half below the cover boundary

function optimizeCloudinaryCoverUrl(url?: string | null): string {
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

const INITIAL_VISIBLE_COUNT = 3;

export function PartnersSection({ locale, dict }: PartnersSectionProps) {
  const [activeTab, setActiveTab] = useState<PartnerTab>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [dbPartners, setDbPartners] = useState<PublicPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [activePartner, setActivePartner] = useState<PublicPartner | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/public/partners?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.partners)) {
          setDbPartners(data.partners);
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

  // Combine static fallback data with published DB partners
  const staticConsulates: PublicPartner[] = getConfirmedConsulates().map((c) => ({
    id: `static-c-${c.name}`,
    type: "CONSULATE" as const,
    name: c.name,
    country: "Vietnam",
    logoUrl: null,
    coverImage: null,
    websiteUrl: c.website,
    publicContact: null,
    shortDescription: "",
    description: null,
  }));

  const staticUniversities: PublicPartner[] = getConfirmedUniversities().map((u) => ({
    id: `static-u-${u.name}`,
    type: "UNIVERSITY" as const,
    name: u.name,
    country: u.country,
    logoUrl: null,
    coverImage: null,
    websiteUrl: u.website,
    publicContact: null,
    shortDescription: "",
    description: null,
  }));

  const allPartners: PublicPartner[] = [
    ...dbPartners,
    ...staticConsulates.filter((sc) => !dbPartners.some((p) => p.name === sc.name)),
    ...staticUniversities.filter((su) => !dbPartners.some((p) => p.name === su.name)),
  ];

  const filteredPartners = allPartners.filter((p) => {
    if (activeTab === "Consulates" && p.type !== "CONSULATE") return false;
    if (activeTab === "Universities" && p.type !== "UNIVERSITY") return false;
    if (
      selectedCountry !== "All" &&
      p.country.toLowerCase() !== selectedCountry.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  const visiblePartners = showAll
    ? filteredPartners
    : filteredPartners.slice(0, INITIAL_VISIBLE_COUNT);

  const typeLabel = (type: PublicPartner["type"]) =>
    type === "UNIVERSITY" ? dict.partners.tabs.universities : dict.partners.tabs.consulates;

  const allCountriesLabel = locale === "vi" ? "Tất cả quốc gia" : "All Countries";
  const visitWebsiteLabel = locale === "vi" ? "Xem website" : "Visit website";

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="section--navy section--partners"
    >
      <div className="site-container section-padding">
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9a24b]">
            <span className="h-px w-8 bg-[#d9a24b]/60" aria-hidden="true" />
            {dict.partners.eyebrow}
            <span className="h-px w-8 bg-[#d9a24b]/60" aria-hidden="true" />
          </span>

          <h2
            id="partners-heading"
            className="text-[28px] md:text-[30px] font-medium text-white leading-snug max-w-2xl"
          >
            {dict.partners.title}
          </h2>

          <p className="max-w-xl text-sm text-[#9aa7bd]">{dict.partners.subtitle}</p>
        </div>

        {/* Partner Type Segmented Control */}
        <div className="flex justify-center mb-4">
          <div
            role="tablist"
            aria-label="Partner categories"
            className="inline-flex items-center gap-1 bg-white/5 rounded-full p-1"
          >
            {[
              { key: "All", label: dict.partners.tabs.all },
              { key: "Consulates", label: dict.partners.tabs.consulates },
              { key: "Universities", label: dict.partners.tabs.universities },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={activeTab === t.key}
                onClick={() => {
                  setActiveTab(t.key as PartnerTab);
                  setSelectedCountry("All");
                  setShowAll(false);
                }}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-colors duration-200 ${
                  activeTab === t.key
                    ? "bg-[#d9a24b] text-[#12213b]"
                    : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Country Filters (when Universities or All tab active) */}
        {activeTab !== "Consulates" && (
          <div className="flex justify-center flex-wrap gap-1.5 mb-10">
            <button
              type="button"
              onClick={() => {
                setSelectedCountry("All");
                setShowAll(false);
              }}
              className={`py-1 px-3 rounded-full text-[11px] font-semibold transition ${
                selectedCountry === "All"
                  ? "bg-[#fbf9f5] text-[#12213b]"
                  : "border-[0.5px] border-white/12 text-slate-400 hover:text-white"
              }`}
            >
              {allCountriesLabel}
            </button>
            {universityCountryKeys.map((ck) => (
              <button
                key={ck}
                type="button"
                onClick={() => {
                  setSelectedCountry(ck);
                  setShowAll(false);
                }}
                className={`py-1 px-3 rounded-full text-[11px] font-semibold transition ${
                  selectedCountry === ck
                    ? "bg-[#fbf9f5] text-[#12213b]"
                    : "border-[0.5px] border-white/12 text-slate-400 hover:text-white"
                }`}
              >
                {getCountryLabel(ck as CountryKey, locale)}
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-white/5 rounded-[14px] border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-4 bg-white/5 rounded-[14px] border border-white/10 max-w-md mx-auto">
            <p className="text-sm font-semibold text-white mb-1">
              {dict.partners.emptyState}
            </p>
          </div>
        ) : (
          <>
            {/* Premium Partner Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePartners.map((p, index) => {
                const coverUrl = p.coverImage?.secureUrl;
                const logoUrl = p.logoUrl;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePartner(p)}
                    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                    className="partner-card-animated relative text-left bg-[#fbf9f5] rounded-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.32)] transition-all duration-300 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a24b]"
                  >
                    {/* Compact Showcase Cover */}
                    <div
                      className="relative w-full rounded-t-[14px] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"
                      style={{ height: COVER_HEIGHT }}
                    >
                      {coverUrl ? (
                        <Image
                          src={optimizeCloudinaryCoverUrl(coverUrl)}
                          alt={`${p.name} showcase`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={!coverUrl.includes("res.cloudinary.com")}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center">
                          <span className="text-[9px] font-black tracking-widest text-[#d9a24b] uppercase">
                            FPT ICO SUMMIT 2026
                          </span>
                        </div>
                      )}

                      {/* Country badge — top-right, navy overlay */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[rgba(11,23,54,0.85)]">
                        {p.country}
                      </span>
                    </div>

                    {/* Logo emblem — overlaps cover/body boundary */}
                    <div
                      className="absolute left-5 w-11 h-11 rounded-full border-2 border-[#d9a24b] bg-[#fbf9f5] shadow-md overflow-hidden flex items-center justify-center z-10"
                      style={{ top: COVER_HEIGHT - LOGO_OVERLAP }}
                    >
                      {logoUrl ? (
                        <Image
                          src={optimizeCloudinaryLogoUrl(logoUrl)}
                          alt={`${p.name} logo`}
                          fill
                          sizes="44px"
                          className="object-contain p-1 rounded-full"
                          unoptimized={!logoUrl.includes("res.cloudinary.com")}
                        />
                      ) : (
                        <span className="text-sm font-black text-[#12213b]">
                          {p.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div
                      className="px-5 pb-5 flex flex-col gap-2"
                      style={{ paddingTop: LOGO_OVERLAP + 12 }}
                    >
                      <span className="uppercase text-[10px] tracking-[0.12em] font-bold text-[#a5711f]">
                        {typeLabel(p.type)}
                      </span>

                      <h3 className="font-medium text-[#12213b] text-[15px] leading-[1.4]">
                        {p.name}
                      </h3>

                      {p.shortDescription ? (
                        <p className="text-[12.5px] text-[#5b6478] line-clamp-2 leading-relaxed">
                          {p.shortDescription}
                        </p>
                      ) : (
                        <p className="text-[12.5px] text-[#5b6478]/70 italic line-clamp-2 leading-relaxed">
                          {locale === "vi"
                            ? "Đối tác chính thức đồng hành cùng FPT ICO Summit 2026."
                            : "Official partner institution participating in FPT ICO Summit 2026."}
                        </p>
                      )}

                      {p.websiteUrl && (
                        <div className="pt-3 mt-1 border-t border-[rgba(11,23,54,0.1)]">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#12213b] group-hover:text-[#a5711f] transition">
                            <span>{visitWebsiteLabel}</span>
                            <svg
                              width="12"
                              height="12"
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
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* View all / Show less toggle */}
            {filteredPartners.length > INITIAL_VISIBLE_COUNT && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full text-xs font-bold border-[0.5px] border-white/15 text-white bg-white/5 hover:bg-white/10 transition"
                >
                  <span>{showAll ? dict.partners.showLessLabel : dict.partners.viewAllLabel}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Public Partner Detail Modal */}
      <PartnerDetailModal
        partner={activePartner}
        typeLabel={activePartner ? typeLabel(activePartner.type) : ""}
        locale={locale}
        onClose={() => setActivePartner(null)}
      />
    </section>
  );
}
