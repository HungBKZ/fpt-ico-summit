/**
 * src/app/[locale]/partners/[id]/page.tsx
 *
 * Dedicated, stable public Virtual Booth & Partner Detail route.
 * Reuses the sanitized published snapshot data, site layout, and bilingual dictionaries.
 */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CopyBoothLinkButton } from "@/components/public/CopyBoothLinkButton";
import { getPublishedOrganizationById } from "@/lib/db/repositories/organizations";
import { listPublishedScholarshipsByOrg } from "@/lib/db/repositories/scholarships";
import { listPublishedActivitiesByOrg } from "@/lib/db/repositories/summit-activities";
import { isDeadlineExpiredAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import { siteConfig } from "@/data/site";
import { brandConfig } from "@/lib/config/brand";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

function optimizeCloudinaryCoverUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200,c_fill,g_auto/");
}

function optimizeCloudinaryLogoUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_180,c_limit/");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  if (!isValidLocale(rawLocale)) return {};

  const org = await getPublishedOrganizationById(id);
  if (!org || !org.isPublished || !org.publishedProfile) return {};

  const isVi = rawLocale === "vi";
  const pub = org.publishedProfile;
  const isVirtualBooth = Boolean(pub.virtualBooth?.enabled);

  const titlePrefix = isVirtualBooth
    ? isVi
      ? "Gian hàng Trực tuyến"
      : "Virtual Booth"
    : isVi
    ? "Đối tác Chính thức"
    : "Official Partner";

  const title = `${org.name} | ${titlePrefix} — ${brandConfig.eventNameWithYear}`;
  const description =
    (isVi ? pub.content?.vi?.shortDescription : pub.content?.en?.shortDescription) ||
    pub.content?.en?.shortDescription ||
    `${org.name} — ${brandConfig.eventNameWithYear}`;

  const canonicalUrl = `${siteConfig.domain}/${rawLocale}/partners/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: pub.coverImage?.secureUrl ? [{ url: pub.coverImage.secureUrl }] : [],
    },
  };
}

export default async function PartnerDetailPage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const isVi = locale === "vi";

  const org = await getPublishedOrganizationById(id);
  if (!org || !org.isPublished || !org.publishedProfile) {
    notFound();
  }

  const pub = org.publishedProfile;
  const isVirtualBooth = Boolean(pub.virtualBooth?.enabled);
  const booth = pub.virtualBooth;

  const shortDesc =
    (isVi ? pub.content?.vi?.shortDescription : pub.content?.en?.shortDescription) ||
    pub.content?.en?.shortDescription ||
    "";
  const fullDesc =
    (isVi ? pub.content?.vi?.description : pub.content?.en?.description) ||
    pub.content?.en?.description ||
    "";

  // Query linked published scholarships and activities in parallel
  const [rawScholarships, rawActivities] = await Promise.all([
    listPublishedScholarshipsByOrg(org._id!),
    listPublishedActivitiesByOrg(org._id!),
  ]);

  // Sanitize scholarships: only active published records
  const safeScholarships = rawScholarships
    .filter((s) => {
      const snap = s.publishedSnapshot;
      if (!snap) return false;
      return !isDeadlineExpiredAsiaHoChiMinh(snap.applicationDeadline);
    })
    .map((s) => {
      const snap = s.publishedSnapshot!;
      const title = (isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "";
      const sShortDesc =
        (isVi ? snap.shortDescription?.vi : snap.shortDescription?.en) ||
        snap.shortDescription?.en ||
        "";
      const fundingSummary =
        (isVi ? snap.fundingSummary?.vi : snap.fundingSummary?.en) ||
        snap.fundingSummary?.en ||
        undefined;

      return {
        id: String(s._id),
        type: snap.type,
        title,
        shortDescription: sShortDesc,
        fundingSummary,
        officialUrl: snap.officialUrl,
        deadline: snap.applicationDeadline ? snap.applicationDeadline.toISOString() : undefined,
      };
    });

  // Sanitize activities: strictly approved and scheduled
  const safeActivities = rawActivities
    .filter((a) => Boolean(a.isContentApproved && a.approvedSnapshot && a.publishedSchedule))
    .map((a) => {
      const snap = a.approvedSnapshot!;
      const title =
        (isVi ? snap.title?.vi : snap.title?.en) ||
        snap.title?.en ||
        "Summit Activity";
      const aShortDesc =
        (isVi ? snap.shortDescription?.vi : snap.shortDescription?.en) ||
        snap.shortDescription?.en ||
        "";

      const format =
        "format" in snap
          ? snap.format
          : "performanceType" in snap
          ? snap.performanceType
          : undefined;

      return {
        id: String(a._id),
        activityType: a.type,
        title,
        shortDescription: aShortDesc,
        durationMinutes: snap.durationMinutes,
        format,
        schedule: a.publishedSchedule
          ? {
              dateKey: a.publishedSchedule.dateKey,
              startTime: a.publishedSchedule.startTime,
              endTime: a.publishedSchedule.endTime,
              venue: a.publishedSchedule.venue,
            }
          : null,
      };
    });

  const tBooth = dict.virtualBooth;
  const coverUrl = pub.coverImage?.secureUrl;
  const logoUrl = pub.logoUrl || pub.logo?.secureUrl;
  const descriptionText = booth?.description || fullDesc || shortDesc;

  const programs = (booth?.programs || []).filter((p) => Boolean(p.title));
  const resources = (booth?.resources || []).filter((r) => Boolean(r.label && isSafeUrl(r.url)));

  const contactRows = [
    pub.publicContact?.email
      ? { icon: "mail", label: pub.publicContact.email, href: `mailto:${pub.publicContact.email}` }
      : null,
    pub.publicContact?.phone
      ? { icon: "phone", label: pub.publicContact.phone, href: `tel:${pub.publicContact.phone}` }
      : null,
    pub.publicContact?.address
      ? { icon: "pin", label: pub.publicContact.address, href: null }
      : null,
  ].filter(Boolean) as { icon: string; label: string; href: string | null }[];

  const typeLabel =
    org.type === "UNIVERSITY"
      ? dict.partners.tabs.universities
      : org.type === "CONSULATE"
      ? dict.partners.tabs.consulates
      : org.type.replace(/_/g, " ");

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="min-h-screen bg-[#0b1736] pt-24 pb-16">
        <div className="site-container max-w-4xl mx-auto px-4">
          {/* Top Navigation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href={`/${locale}#partners`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <span>←</span>
              <span>{tBooth.backToPartners}</span>
            </Link>

            <div className="flex items-center gap-2">
              <CopyBoothLinkButton
                label={tBooth.copyLink}
                copiedLabel={tBooth.linkCopied}
              />
              {pub.websiteUrl && isSafeUrl(pub.websiteUrl) && (
                <a
                  href={pub.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
                >
                  <span>{tBooth.officialWebsite}</span>
                  <span className="text-[11px] text-[#d9a24b]">↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Main Card Container */}
          <article className="bg-[#fbf9f5] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden border border-white/10">
            {/* Cover Banner */}
            <div className="relative w-full h-56 sm:h-72 md:h-80 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
              {coverUrl ? (
                <Image
                  src={optimizeCloudinaryCoverUrl(coverUrl)}
                  alt={`${org.name} cover`}
                  fill
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                  unoptimized={!coverUrl.includes("res.cloudinary.com")}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center">
                  <span className="text-sm font-black tracking-widest text-[#d9a24b] uppercase">
                    {brandConfig.eventNameWithYear}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1736]/75 via-transparent to-transparent" />

              {/* Status & Country Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[rgba(11,23,54,0.85)] shadow-xs">
                  {org.country}
                </span>
                {isVirtualBooth && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold text-[#d9a24b] bg-[rgba(11,23,54,0.92)] border border-[#d9a24b]/40 tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{tBooth.title}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overlapping Logo Emblem */}
            <div className="relative px-6 sm:px-8">
              <div className="absolute left-6 sm:left-8 -top-12 sm:-top-14 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#d9a24b] bg-[#fbf9f5] shadow-lg overflow-hidden flex items-center justify-center z-10">
                {logoUrl ? (
                  <Image
                    src={optimizeCloudinaryLogoUrl(logoUrl)}
                    alt={`${org.name} logo`}
                    fill
                    sizes="112px"
                    className="object-contain p-2"
                    unoptimized={!logoUrl.includes("res.cloudinary.com")}
                  />
                ) : (
                  <span className="text-3xl font-black text-[#12213b]">{org.name.charAt(0)}</span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="pt-16 sm:pt-18 px-6 sm:px-8 pb-10 flex flex-col gap-8">
              {/* Identity Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[rgba(11,23,54,0.1)] pb-6">
                <div>
                  <span className="uppercase text-xs tracking-wider font-bold text-[#a5711f]">
                    {typeLabel}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12213b] mt-1 tracking-tight leading-snug">
                    {org.name}
                  </h1>
                </div>

                {pub.websiteUrl && isSafeUrl(pub.websiteUrl) && (
                  <a
                    href={pub.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#12213b] hover:text-[#a5711f] bg-white border border-slate-300 py-2.5 px-4 rounded-xl shrink-0 transition shadow-2xs self-start"
                  >
                    <span>{tBooth.officialWebsite}</span>
                    <span className="text-sm">↗</span>
                  </a>
                )}
              </div>

              {/* Booth Introduction Highlight */}
              {isVirtualBooth && booth?.shortIntroduction && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 to-amber-50/60 border border-blue-100 rounded-2xl text-sm sm:text-base text-[#12213b] font-medium leading-relaxed italic">
                  &ldquo;{booth.shortIntroduction}&rdquo;
                </div>
              )}

              {/* About Section */}
              {descriptionText && (
                <section aria-labelledby="about-heading" className="space-y-2">
                  <h2 id="about-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.aboutTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-[#5b6478] leading-relaxed whitespace-pre-wrap">
                    {descriptionText}
                  </p>
                </section>
              )}

              {/* Programs & Opportunities */}
              {isVirtualBooth && programs.length > 0 && (
                <section aria-labelledby="programs-heading" className="space-y-4 pt-4 border-t border-[rgba(11,23,54,0.1)]">
                  <h2 id="programs-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.programsTitle} ({programs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-[#12213b] leading-snug">
                            {p.title}
                          </h3>
                          {p.shortDescription && (
                            <p className="text-xs text-[#5b6478] mt-1.5 leading-relaxed">
                              {p.shortDescription}
                            </p>
                          )}
                        </div>
                        {p.url && isSafeUrl(p.url) && (
                          <div className="pt-3 mt-3 border-t border-slate-100">
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition"
                            >
                              <span>{tBooth.learnMore}</span>
                              <span>↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Published Scholarships */}
              {safeScholarships.length > 0 && (
                <section aria-labelledby="scholarships-heading" className="space-y-4 pt-4 border-t border-[rgba(11,23,54,0.1)]">
                  <h2 id="scholarships-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.scholarshipsTitle} ({safeScholarships.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safeScholarships.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 bg-white border border-amber-200/70 rounded-2xl shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 uppercase">
                              {s.type === "SHORT_TERM"
                                ? isVi ? "Ngắn hạn" : "Short-term"
                                : isVi ? "Dài hạn" : "Long-term"}
                            </span>
                            {s.deadline && (
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(s.deadline).toLocaleDateString(isVi ? "vi-VN" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#12213b] leading-snug">
                            {s.title}
                          </h3>
                          {s.fundingSummary && (
                            <p className="text-xs text-[#a5711f] font-semibold mt-1">
                              {s.fundingSummary}
                            </p>
                          )}
                          {s.shortDescription && (
                            <p className="text-xs text-[#5b6478] mt-1 line-clamp-2 leading-relaxed">
                              {s.shortDescription}
                            </p>
                          )}
                        </div>

                        {s.officialUrl && isSafeUrl(s.officialUrl) && (
                          <div className="pt-3 mt-3 border-t border-slate-100">
                            <a
                              href={s.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition"
                            >
                              <span>{isVi ? "Xem chi tiết học bổng" : "View Scholarship Details"}</span>
                              <span>↗</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Scheduled Activities */}
              {safeActivities.length > 0 && (
                <section aria-labelledby="activities-heading" className="space-y-4 pt-4 border-t border-[rgba(11,23,54,0.1)]">
                  <h2 id="activities-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.activitiesTitle} ({safeActivities.length})
                  </h2>
                  <div className="space-y-3">
                    {safeActivities.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                              {a.activityType === "WORKSHOP"
                                ? "Workshop"
                                : isVi ? "Biểu diễn" : "Stage Performance"}
                            </span>
                            {a.durationMinutes && (
                              <span className="text-xs text-slate-400">
                                {a.durationMinutes} {isVi ? "phút" : "mins"}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#12213b] mt-1.5">{a.title}</h3>
                          {a.shortDescription && (
                            <p className="text-xs text-[#5b6478] mt-1 line-clamp-2">
                              {a.shortDescription}
                            </p>
                          )}
                        </div>

                        {a.schedule && (
                          <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                            <div className="text-xs font-bold text-[#12213b]">
                              {a.schedule.startTime} - {a.schedule.endTime}
                            </div>
                            <div className="text-[11px] text-[#a5711f] font-semibold mt-0.5">
                              {a.schedule.venue}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {a.schedule.dateKey}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resources & Useful Links */}
              {isVirtualBooth && resources.length > 0 && (
                <section aria-labelledby="resources-heading" className="space-y-3 pt-4 border-t border-[rgba(11,23,54,0.1)]">
                  <h2 id="resources-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.resourcesTitle} ({resources.length})
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {resources.map((r, idx) => (
                      <a
                        key={idx}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-xs font-medium text-[#12213b] rounded-xl hover:bg-slate-50 transition shadow-2xs"
                      >
                        <span>{r.label}</span>
                        <span className="text-xs text-[#a5711f]">↗</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Contact Rows */}
              {contactRows.length > 0 && (
                <section aria-labelledby="contact-heading" className="space-y-3 pt-4 border-t border-[rgba(11,23,54,0.1)]">
                  <h2 id="contact-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {tBooth.contactOrg}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactRows.map((row, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#5b6478]">
                        <span className="text-[#a5711f] font-bold">●</span>
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
                </section>
              )}

              {/* Primary Call to Action Button */}
              {booth?.primaryCta?.url && isSafeUrl(booth.primaryCta.url) ? (
                <div className="pt-6 border-t border-[rgba(11,23,54,0.1)]">
                  <a
                    href={booth.primaryCta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[var(--color-navy)] text-white text-sm font-bold rounded-xl hover:bg-[#1a2f52] transition shadow-md group"
                  >
                    <span>{booth.primaryCta.label || tBooth.learnMore}</span>
                    <span className="group-hover:translate-x-1 transition-transform">↗</span>
                  </a>
                </div>
              ) : pub.websiteUrl && isSafeUrl(pub.websiteUrl) ? (
                <div className="pt-6 border-t border-[rgba(11,23,54,0.1)]">
                  <a
                    href={pub.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#12213b] text-white text-sm font-bold rounded-xl hover:bg-[#1a2f52] transition shadow-md group"
                  >
                    <span>{tBooth.officialWebsite}</span>
                    <span className="group-hover:translate-x-1 transition-transform">↗</span>
                  </a>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}
