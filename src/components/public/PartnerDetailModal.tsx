"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { OrganizationType } from "@/lib/db/models/organization";
import { CopyBoothLinkButton } from "@/components/public/CopyBoothLinkButton";

export interface PublicPartnerDetail {
  id: string;
  type: OrganizationType | "UNIVERSITY" | "CONSULATE" | string;
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
  hasVirtualBooth?: boolean;
  virtualBooth?: {
    enabled: boolean;
    shortIntroduction?: string | null;
    description?: string | null;
    programs?: Array<{
      title: string;
      shortDescription?: string;
      url?: string;
    }>;
    resources?: Array<{
      label: string;
      url: string;
    }>;
    primaryCta?: {
      label: string;
      url: string;
    } | null;
  } | null;
  scholarships?: Array<{
    id: string;
    type: string;
    title: string;
    shortDescription: string;
    fundingSummary?: string;
    eligibility?: string;
    officialUrl: string;
    deadline?: string;
    bannerUrl?: string | null;
  }>;
  activities?: Array<{
    id: string;
    activityType: string;
    title: string;
    shortDescription: string;
    durationMinutes?: number;
    format?: string;
    coverUrl?: string | null;
    schedule?: {
      dateKey: string;
      startTime: string;
      endTime: string;
      venue: string;
    } | null;
  }>;
}

interface PartnerDetailModalProps {
  partner: PublicPartnerDetail | null;
  typeLabel: string;
  locale: Locale;
  dict?: Dictionary;
  onClose: () => void;
}

function optimizeCloudinaryCoverUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1000,c_fill,g_auto/");
}

function optimizeCloudinaryLogoUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_160,c_limit/");
}

function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

/**
 * Accessible modal for public partner details and Virtual Booth experience.
 * Enforces focus placement, focus trap, focus restoration, Escape closing, and body scroll locking.
 */
export function PartnerDetailModal({
  partner,
  typeLabel,
  locale,
  dict,
  onClose,
}: PartnerDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [enrichedPartner, setEnrichedPartner] = useState<PublicPartnerDetail | null>(null);

  // Fetch full details (scholarships, activities, booth) if real DB partner
  useEffect(() => {
    if (!partner || partner.id.startsWith("static-")) return;

    let isMounted = true;
    fetch(`/api/public/partners/${partner.id}?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.partner) {
          setEnrichedPartner(data.partner);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [partner, locale]);

  useEffect(() => {
    if (!partner) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [partner, onClose]);

  if (!partner) return null;

  const current = (enrichedPartner && enrichedPartner.id === partner.id) ? enrichedPartner : partner;
  const isVirtualBooth = Boolean(current.virtualBooth?.enabled || partner.hasVirtualBooth);
  const booth = current.virtualBooth;

  const tBooth = dict?.virtualBooth || {
    title: locale === "vi" ? "Gian hàng Trực tuyến" : "Virtual Booth",
    aboutTitle: locale === "vi" ? "Về Đơn vị" : "About This Organization",
    programsTitle: locale === "vi" ? "Chương trình & Cơ hội" : "Programs & Opportunities",
    resourcesTitle: locale === "vi" ? "Tài nguyên & Liên kết" : "Resources & Useful Links",
    scholarshipsTitle: locale === "vi" ? "Học bổng" : "Scholarships",
    activitiesTitle: locale === "vi" ? "Hoạt động & Hội thảo sắp tới" : "Upcoming Summit Activities",
    officialWebsite: locale === "vi" ? "Website chính thức" : "Official Website",
    learnMore: locale === "vi" ? "Tìm hiểu thêm" : "Learn More",
    contactOrg: locale === "vi" ? "Liên hệ Đơn vị" : "Contact Organization",
    noOpportunities: locale === "vi" ? "Chưa có cơ hội học bổng nào" : "No current opportunities",
    noUpcomingSessions: locale === "vi" ? "Chưa có phiên hoạt động nào" : "No upcoming sessions",
    closeBooth: locale === "vi" ? "Đóng Gian hàng" : "Close Virtual Booth",
    copyLink: locale === "vi" ? "Sao chép liên kết" : "Copy Booth Link",
    linkCopied: locale === "vi" ? "Đã sao chép!" : "Link Copied!",
    backToPartners: locale === "vi" ? "Quay lại danh sách" : "Back to Partners",
  };

  const closeLabel = isVirtualBooth
    ? tBooth.closeBooth
    : locale === "vi"
    ? "Đóng cửa sổ chi tiết đối tác"
    : "Close partner details";

  const coverUrl = current.coverImage?.secureUrl;
  const logoUrl = current.logoUrl;
  const descriptionText = current.description || current.shortDescription;

  const contactRows = [
    current.publicContact?.email
      ? { icon: "mail", label: current.publicContact.email, href: `mailto:${current.publicContact.email}` }
      : null,
    current.publicContact?.phone
      ? { icon: "phone", label: current.publicContact.phone, href: `tel:${current.publicContact.phone}` }
      : null,
    current.publicContact?.address
      ? { icon: "pin", label: current.publicContact.address, href: null }
      : null,
  ].filter(Boolean) as { icon: string; label: string; href: string | null }[];

  const programs = (booth?.programs || []).filter((p) => Boolean(p.title));
  const resources = (booth?.resources || []).filter((r) => Boolean(r.label && isSafeUrl(r.url)));
  const scholarships = (current.scholarships || []).filter((s) => Boolean(s.title));
  const activities = (current.activities || []).filter((a) => Boolean(a.title));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-detail-title"
      className="partner-modal-backdrop fixed inset-0 z-50 bg-[#0b1736]/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`partner-modal-panel bg-[#fbf9f5] w-full ${
          isVirtualBooth ? "max-w-2xl md:max-w-3xl" : "max-w-lg"
        } rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative my-auto max-h-[92vh] overflow-y-auto outline-none transition-all duration-300`}
      >
        {/* Modal Controls Toolbar */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          {isVirtualBooth && (
            <CopyBoothLinkButton
              label={tBooth.copyLink}
              copiedLabel={tBooth.linkCopied}
              url={typeof window !== "undefined" ? `${window.location.origin}/${locale}/partners/${current.id}` : undefined}
              className="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-white/95 text-[#12213b] hover:bg-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="w-8 h-8 rounded-full bg-white/95 text-[#12213b] hover:bg-white flex items-center justify-center font-bold text-sm shadow-md transition focus:ring-2 focus:ring-[#d9a24b] outline-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cover */}
        <div
          className={`relative w-full ${
            isVirtualBooth ? "h-48 md:h-64" : "h-44 md:h-52"
          } rounded-t-[20px] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900`}
        >
          {coverUrl ? (
            <Image
              src={optimizeCloudinaryCoverUrl(coverUrl)}
              alt={`${current.name} showcase`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              unoptimized={!coverUrl.includes("res.cloudinary.com")}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center">
              <span className="text-xs font-black tracking-widest text-[#d9a24b] uppercase">
                MEKONG EDUTOURISM SUMMIT 2026
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1736]/70 via-transparent to-transparent" />

          {/* Badges on Cover */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[rgba(11,23,54,0.85)] shadow-xs">
              {current.country}
            </span>
            {isVirtualBooth && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#d9a24b] bg-[rgba(11,23,54,0.92)] border border-[#d9a24b]/40 tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{tBooth.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Logo emblem overlapping cover/body boundary */}
        <div className="relative">
          <div className="absolute left-6 -top-10 w-[78px] h-[78px] rounded-full border-[3px] border-[#d9a24b] bg-[#fbf9f5] shadow-md overflow-hidden flex items-center justify-center z-10">
            {logoUrl ? (
              <Image
                src={optimizeCloudinaryLogoUrl(logoUrl)}
                alt={`${current.name} logo`}
                fill
                sizes="78px"
                className="object-contain p-1.5"
                unoptimized={!logoUrl.includes("res.cloudinary.com")}
              />
            ) : (
              <span className="text-xl font-black text-[#12213b]">{current.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Body Container */}
        <div className="pt-12 px-6 pb-7 flex flex-col gap-6">
          {/* Header Identity */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="space-y-1">
              <span className="uppercase text-[10px] tracking-[0.14em] font-bold text-[#a5711f]">
                {typeLabel}
              </span>
              <h2
                id="partner-detail-title"
                className="text-xl md:text-2xl font-bold text-[#12213b] leading-snug"
              >
                {current.name}
              </h2>
            </div>

            {current.websiteUrl && isSafeUrl(current.websiteUrl) && (
              <a
                href={current.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#12213b] hover:text-[#a5711f] bg-white border border-slate-300 py-2 px-3.5 rounded-xl shrink-0 transition shadow-2xs self-start"
              >
                <span>{tBooth.officialWebsite}</span>
                <span className="text-[11px]">↗</span>
              </a>
            )}
          </div>

          {/* Detailed Content Loading Indicator */}
          {isVirtualBooth && !enrichedPartner && !partner.id.startsWith("static-") && (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="w-3.5 h-3.5 border-2 border-[#d9a24b] border-t-transparent rounded-full animate-spin" />
              <span>{locale === "vi" ? "Đang tải chi tiết gian hàng..." : "Loading booth details..."}</span>
            </div>
          )}

          {/* Booth Introduction Highlight (if virtual booth) */}
          {isVirtualBooth && booth?.shortIntroduction && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-amber-50/50 border border-blue-100 rounded-xl text-xs md:text-[13px] text-[#12213b] font-medium leading-relaxed italic">
              &ldquo;{booth.shortIntroduction}&rdquo;
            </div>
          )}

          {/* About / Description Section */}
          {(booth?.description || descriptionText) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {tBooth.aboutTitle}
              </h3>
              <p className="text-sm text-[#5b6478] leading-relaxed whitespace-pre-wrap">
                {booth?.description || descriptionText}
              </p>
            </div>
          )}

          {/* Programs & Opportunities (Virtual Booth Only) */}
          {isVirtualBooth && programs.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[rgba(11,23,54,0.1)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {tBooth.programsTitle} ({programs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programs.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#12213b] leading-tight">
                        {p.title}
                      </h4>
                      {p.shortDescription && (
                        <p className="text-[11px] text-[#5b6478] mt-1 leading-relaxed">
                          {p.shortDescription}
                        </p>
                      )}
                    </div>
                    {p.url && isSafeUrl(p.url) && (
                      <div className="pt-2">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition"
                        >
                          <span>{tBooth.learnMore}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published Scholarships (Automatic Integration) */}
          {scholarships.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[rgba(11,23,54,0.1)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {tBooth.scholarshipsTitle} ({scholarships.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scholarships.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-white border border-amber-200/70 rounded-xl shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 uppercase">
                          {s.type === "SHORT_TERM"
                            ? locale === "vi" ? "Ngắn hạn" : "Short-term"
                            : locale === "vi" ? "Dài hạn" : "Long-term"}
                        </span>
                        {s.deadline && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(s.deadline).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#12213b] leading-tight">
                        {s.title}
                      </h4>
                      {s.fundingSummary && (
                        <p className="text-[11px] text-[#a5711f] font-semibold mt-1">
                          {s.fundingSummary}
                        </p>
                      )}
                      {s.shortDescription && (
                        <p className="text-[11px] text-[#5b6478] mt-1 line-clamp-2 leading-relaxed">
                          {s.shortDescription}
                        </p>
                      )}
                    </div>

                    {s.officialUrl && isSafeUrl(s.officialUrl) && (
                      <div className="pt-2 border-t border-slate-100">
                        <a
                          href={s.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition"
                        >
                          <span>{locale === "vi" ? "Xem chi tiết học bổng" : "View Scholarship Details"}</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Summit Activities (Automatic Integration) */}
          {activities.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[rgba(11,23,54,0.1)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {tBooth.activitiesTitle} ({activities.length})
              </h3>
              <div className="space-y-2">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 uppercase">
                          {a.activityType === "WORKSHOP"
                            ? "Workshop"
                            : locale === "vi" ? "Biểu diễn" : "Stage Performance"}
                        </span>
                        {a.durationMinutes && (
                          <span className="text-[10px] text-slate-400">
                            {a.durationMinutes} {locale === "vi" ? "phút" : "mins"}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#12213b] mt-1">{a.title}</h4>
                      {a.shortDescription && (
                        <p className="text-[11px] text-[#5b6478] mt-0.5 line-clamp-2">
                          {a.shortDescription}
                        </p>
                      )}
                    </div>

                    {a.schedule && (
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-bold text-[#12213b]">
                          {a.schedule.startTime} - {a.schedule.endTime}
                        </div>
                        <div className="text-[10px] text-[#a5711f] font-semibold">
                          {a.schedule.venue}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {a.schedule.dateKey}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources & Useful Links (Virtual Booth Only) */}
          {isVirtualBooth && resources.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[rgba(11,23,54,0.1)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {tBooth.resourcesTitle} ({resources.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {resources.map((r, idx) => (
                  <a
                    key={idx}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-xs font-medium text-[#12213b] rounded-lg hover:bg-slate-50 transition shadow-2xs"
                  >
                    <span>{r.label}</span>
                    <span className="text-[11px] text-[#a5711f]">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Public Contact Rows */}
          {contactRows.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-[rgba(11,23,54,0.1)]">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {tBooth.contactOrg}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contactRows.map((row, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#5b6478]">
                    <ContactIcon kind={row.icon} />
                    {row.href ? (
                      <a href={row.href} className="hover:text-[#12213b] transition break-all">
                        {row.label}
                      </a>
                    ) : (
                      <span className="break-words">{row.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Call to Action Button */}
          {booth?.primaryCta?.url && isSafeUrl(booth.primaryCta.url) ? (
            <div className="pt-4 border-t border-[rgba(11,23,54,0.1)]">
              <a
                href={booth.primaryCta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-[#1a2f52] transition shadow-md group"
              >
                <span>{booth.primaryCta.label || tBooth.learnMore}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          ) : current.websiteUrl && isSafeUrl(current.websiteUrl) ? (
            <div className="pt-4 border-t border-[rgba(11,23,54,0.1)]">
              <a
                href={current.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 px-5 bg-[#12213b] text-white text-xs font-bold rounded-xl hover:bg-[#1a2f52] transition shadow-md group"
              >
                <span>{tBooth.officialWebsite}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ContactIcon({ kind }: { kind: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "mt-0.5 shrink-0 text-[#a5711f]",
  };

  if (kind === "mail") {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    );
  }

  if (kind === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
