"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getConfirmedConsulates } from "@/data/consulates";
import {
  getConfirmedUniversities,
  universityCountryKeys,
  getCountryLabel,
  CountryKey,
} from "@/data/universities";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface PublicPartner {
  id: string;
  type: "UNIVERSITY" | "CONSULATE";
  name: string;
  country: string;
  logoUrl?: string | null;
  coverImage?: {
    secureUrl: string;
    width?: number;
    height?: number;
  } | null;
  websiteUrl?: string | null;
  publicContact?: { email?: string; phone?: string; address?: string } | null;
  shortDescription: string;
  description?: string | null;
}

interface PartnersSectionProps {
  locale: Locale;
  dict: Dictionary;
}

type PartnerTab = "All" | "Consulates" | "Universities";

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

export function PartnersSection({ locale, dict }: PartnersSectionProps) {
  const [activeTab, setActiveTab] = useState<PartnerTab>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [dbPartners, setDbPartners] = useState<PublicPartner[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section
      id="partners"
      aria-labelledby="partners-heading"
      className="section--navy section--partners"
    >
      <div className="site-container section-padding">
        <div style={{ marginBottom: "2rem" }}>
          <SectionHeading
            id="partners-heading"
            className="section-heading--invert"
            eyebrow={dict.partners.eyebrow}
            heading={dict.partners.title}
            body={dict.partners.subtitle}
            level="h2"
            align="center"
            accent={true}
          />
        </div>

        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Partner categories"
          className="flex justify-center flex-wrap gap-2 mb-6"
        >
          {[
            { key: "All", label: dict.partners.tabs.all },
            { key: "Consulates", label: dict.partners.tabs.consulates },
            { key: "Universities", label: dict.partners.tabs.universities },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key as PartnerTab);
                setSelectedCountry("All");
              }}
              className={`py-2 px-5 rounded-full text-xs font-bold transition shadow-xs ${
                activeTab === t.key
                  ? "bg-white text-[var(--color-navy)] shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Country Filters (when Universities or All tab active) */}
        {activeTab !== "Consulates" && (
          <div className="flex justify-center flex-wrap gap-1.5 mb-10">
            <button
              type="button"
              onClick={() => setSelectedCountry("All")}
              className={`py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                selectedCountry === "All"
                  ? "bg-[var(--color-orange)] text-white shadow-xs"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              All Countries
            </button>
            {universityCountryKeys.map((ck) => (
              <button
                key={ck}
                type="button"
                onClick={() => setSelectedCountry(ck)}
                className={`py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                  selectedCountry === ck
                    ? "bg-[var(--color-orange)] text-white shadow-xs"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
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
                className="h-80 bg-white/5 rounded-2xl border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-4 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
            <p className="text-sm font-semibold text-white mb-1">
              {dict.partners.emptyState}
            </p>
          </div>
        ) : (
          /* Premium Partner Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((p) => {
              const coverUrl = p.coverImage?.secureUrl;
              const logoUrl = p.logoUrl;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top 16:9 Showcase Cover Header */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
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
                      /* Designed Summit Fallback Artwork */
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
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
                          <span className="text-[10px] font-black tracking-widest text-orange-400/80 uppercase block">
                            FPT ICO SUMMIT 2026
                          </span>
                          <span className="text-xs font-bold text-white/70 block mt-0.5">
                            International Showcase Partner
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Badge Overlay & Badges */}
                  <div className="-mt-8 px-5 flex items-end justify-between gap-3 relative z-10">
                    {logoUrl ? (
                      <div className="w-14 h-14 relative rounded-xl border border-slate-200 bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                        <Image
                          src={optimizeCloudinaryLogoUrl(logoUrl)}
                          alt={`${p.name} logo`}
                          fill
                          sizes="56px"
                          className="object-contain p-0.5"
                          unoptimized={!logoUrl.includes("res.cloudinary.com")}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0 border border-white shadow-md">
                        {p.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {p.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {p.country}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 pt-3 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                        {p.name}
                      </h3>
                      {p.shortDescription ? (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {p.shortDescription}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Official partner institution participating in FPT ICO Summit 2026.
                        </p>
                      )}
                    </div>

                    {p.websiteUrl && (
                      <div className="pt-3 border-t border-slate-100">
                        <a
                          href={p.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          <span>Visit Website</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
