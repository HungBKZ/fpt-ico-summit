"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { PublicShowcaseEntryDto } from "@/lib/db/models/partner-showcase";

interface PartnerShowcaseMarqueeProps {
  locale: Locale;
  dict: Dictionary;
}

export function PartnerShowcaseMarquee({
  locale,
  dict,
}: PartnerShowcaseMarqueeProps) {
  const [entries, setEntries] = useState<PublicShowcaseEntryDto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/public/showcase", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.entries)) {
          setEntries(data.entries);
        }
      })
      .catch(() => {
        // gracefully ignore fetch error
      })
      .finally(() => {
        if (isMounted) setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // If loading or no showcase entries are published/visible, gracefully render nothing
  if (!loaded || !entries || entries.length === 0) {
    return null;
  }

  const t = dict.partnerShowcase || {
    title: locale === "vi" ? "Mạng lưới Đối tác Quốc tế" : "Our Global Network",
    subtitle:
      locale === "vi"
        ? "Các trường, tổ chức và đơn vị quốc tế được mời hoặc xác nhận tham gia FPT ICO Summit 2026."
        : "Invited and participating institutions connected with FPT ICO Summit 2026.",
  };

  // Threshold: 1 visible logo is static centered; 2 or more logos animate as smooth infinite marquee
  const isMarqueeMode = entries.length >= 2;

  // Build repeated sequence so track width exceeds viewport for seamless looping without jumps
  const repeatCount = isMarqueeMode ? Math.max(1, Math.ceil(8 / entries.length)) : 1;
  const trackItems = Array.from({ length: repeatCount }, () => entries).flat();

  // Consistent linear velocity (~4.5s per item, min 36s) for calm, non-hurried scrolling
  const marqueeDuration = Math.max(36, trackItems.length * 4.5);

  const renderLogoItem = (
    item: PublicShowcaseEntryDto,
    keyPrefix: string,
    isDuplicate = false
  ) => {
    const content = (
      <div className="relative flex items-center justify-center h-12 md:h-14 px-3 opacity-85 hover:opacity-100 transition-opacity duration-200 shrink-0">
        <Image
          src={item.logo.secureUrl}
          alt={`${item.displayName} logo`}
          width={item.logo.width || 140}
          height={item.logo.height || 56}
          className="max-h-11 md:max-h-13 w-auto object-contain select-none pointer-events-none"
          unoptimized
        />
      </div>
    );

    if (item.websiteUrl) {
      return (
        <a
          key={`${keyPrefix}-${item.id}`}
          href={item.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isDuplicate ? -1 : 0}
          aria-hidden={isDuplicate ? true : undefined}
          className="inline-flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[var(--color-orange)] rounded-lg transition-transform hover:scale-105"
          title={item.displayName}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        key={`${keyPrefix}-${item.id}`}
        tabIndex={isDuplicate ? -1 : undefined}
        aria-hidden={isDuplicate ? true : undefined}
        className="inline-flex items-center justify-center"
        title={item.displayName}
      >
        {content}
      </div>
    );
  };

  return (
    <section
      aria-label={t.title}
      className="relative bg-white border-y border-slate-200/80 py-8 md:py-10 overflow-hidden"
    >
      <div className="site-container mb-6 text-center">
        <span className="eyebrow text-xs font-bold uppercase tracking-widest text-[var(--color-blue)]">
          {locale === "vi" ? "Kết nối Toàn cầu" : "Global Network"}
        </span>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-[var(--color-navy)] mt-1.5 font-display">
          {t.title}
        </h2>
        <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto mt-1 leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {isMarqueeMode ? (
        /* Marquee Container with Left and Right Fade Gradients */
        <div className="relative w-full overflow-hidden">
          {/* Gradient edge masks for seamless transition */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"
            aria-hidden="true"
          />

          {/* Continuous scrolling container */}
          <div className="marquee-track-wrapper flex w-max group hover:[&_.animate-marquee-track]:[animation-play-state:paused]">
            {/* Primary Track — Fully accessible */}
            <div
              className="animate-marquee-track flex items-center gap-12 md:gap-16 pr-12 md:pr-16 shrink-0"
              style={{ animationDuration: `${marqueeDuration}s` }}
            >
              {trackItems.map((item, idx) => renderLogoItem(item, `prim-${idx}`, false))}
            </div>

            {/* Duplicated Track — Hidden from assistive technology & keyboard navigation */}
            <div
              className="animate-marquee-track flex items-center gap-12 md:gap-16 pr-12 md:pr-16 shrink-0 motion-reduce:hidden"
              style={{ animationDuration: `${marqueeDuration}s` }}
              aria-hidden="true"
            >
              {trackItems.map((item, idx) => renderLogoItem(item, `dup-${idx}`, true))}
            </div>
          </div>
        </div>
      ) : (
        /* 1 Logo: Clean Centered Static Presentation */
        <div className="site-container flex flex-wrap items-center justify-center gap-8 md:gap-14 py-2">
          {entries.map((item, idx) => renderLogoItem(item, `single-${idx}`, false))}
        </div>
      )}
    </section>
  );
}
