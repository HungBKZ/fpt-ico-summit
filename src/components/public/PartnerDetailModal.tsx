"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";

export interface PublicPartnerDetail {
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

interface PartnerDetailModalProps {
  partner: PublicPartnerDetail | null;
  typeLabel: string;
  locale: Locale;
  onClose: () => void;
}

function optimizeCloudinaryCoverUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_900,c_fill,g_auto/");
}

function optimizeCloudinaryLogoUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_160,c_limit/");
}

/**
 * Accessible modal for public partner details.
 * Enforces focus placement, focus trap, focus restoration, Escape closing, and body scroll locking.
 */
export function PartnerDetailModal({
  partner,
  typeLabel,
  locale,
  onClose,
}: PartnerDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

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

  const closeLabel = locale === "vi" ? "Đóng cửa sổ chi tiết đối tác" : "Close partner details";
  const coverUrl = partner.coverImage?.secureUrl;
  const logoUrl = partner.logoUrl;
  const descriptionText = partner.description || partner.shortDescription;

  const contactRows = [
    partner.publicContact?.email
      ? { icon: "mail", label: partner.publicContact.email, href: `mailto:${partner.publicContact.email}` }
      : null,
    partner.publicContact?.phone
      ? { icon: "phone", label: partner.publicContact.phone, href: `tel:${partner.publicContact.phone}` }
      : null,
    partner.publicContact?.address
      ? { icon: "pin", label: partner.publicContact.address, href: null }
      : null,
  ].filter(Boolean) as { icon: string; label: string; href: string | null }[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-detail-title"
      className="partner-modal-backdrop fixed inset-0 z-50 bg-[#0b1736]/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="partner-modal-panel bg-[#fbf9f5] w-full max-w-lg rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative my-auto max-h-[92vh] overflow-y-auto outline-none"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 text-[#12213b] hover:bg-white flex items-center justify-center font-bold text-sm shadow-md transition focus:ring-2 focus:ring-[#d9a24b] outline-none"
        >
          ✕
        </button>

        {/* Cover */}
        <div className="relative w-full h-44 md:h-52 rounded-t-[18px] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          {coverUrl ? (
            <Image
              src={optimizeCloudinaryCoverUrl(coverUrl)}
              alt={`${partner.name} showcase`}
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-cover"
              unoptimized={!coverUrl.includes("res.cloudinary.com")}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center">
              <span className="text-xs font-black tracking-widest text-[#d9a24b] uppercase">
                FPT ICO SUMMIT 2026
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1736]/60 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[rgba(11,23,54,0.85)]">
            {partner.country}
          </span>
        </div>

        {/* Logo emblem overlapping cover/body boundary */}
        <div className="relative">
          <div className="absolute left-6 -top-9 w-[72px] h-[72px] rounded-full border-[3px] border-[#d9a24b] bg-[#fbf9f5] shadow-md overflow-hidden flex items-center justify-center z-10">
            {logoUrl ? (
              <Image
                src={optimizeCloudinaryLogoUrl(logoUrl)}
                alt={`${partner.name} logo`}
                fill
                sizes="72px"
                className="object-contain p-1.5"
                unoptimized={!logoUrl.includes("res.cloudinary.com")}
              />
            ) : (
              <span className="text-xl font-black text-[#12213b]">{partner.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="pt-11 px-6 pb-6 flex flex-col gap-4">
          <div className="space-y-1.5">
            <span className="uppercase text-[10px] tracking-[0.12em] font-bold text-[#a5711f]">
              {typeLabel}
            </span>
            <h2
              id="partner-detail-title"
              className="text-xl font-medium text-[#12213b] leading-snug"
            >
              {partner.name}
            </h2>
          </div>

          {descriptionText && (
            <p className="text-sm text-[#5b6478] leading-relaxed">{descriptionText}</p>
          )}

          {contactRows.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-[rgba(11,23,54,0.1)]">
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
          )}

          {partner.websiteUrl && (
            <div className="pt-4 border-t border-[rgba(11,23,54,0.1)]">
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[#12213b] text-white text-xs font-bold rounded-xl hover:bg-[#1a2f52] transition group"
              >
                <span>{locale === "vi" ? "Xem website" : "Visit website"}</span>
                <svg
                  width="13"
                  height="13"
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
          )}
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
