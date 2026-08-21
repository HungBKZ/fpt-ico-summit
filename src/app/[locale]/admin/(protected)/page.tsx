import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import {
  getAdminOverviewMetrics,
  listOrganizationsForAdmin,
} from "@/lib/db/repositories/organizations";
import {
  countPendingScholarships,
  listScholarshipsForAdmin,
} from "@/lib/db/repositories/scholarships";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { countRegistrationsByEdition } from "@/lib/db/repositories/summit-registrations";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);
  const t = dict.adminPortal;

  const activeEdition = await getActiveSummitEdition();
  const registrationCounts = activeEdition?._id
    ? await countRegistrationsByEdition(activeEdition._id)
    : { total: 0, fptStudents: 0, externalParticipants: 0 };

  // Query DB metrics & pending review queues concurrently
  const [metrics, pendingOrgs, pendingScholarshipCount, pendingScholarships] = await Promise.all([
    getAdminOverviewMetrics(),
    listOrganizationsForAdmin("IN_REVIEW"),
    countPendingScholarships(),
    listScholarshipsForAdmin("IN_REVIEW"),
  ]);

  const cards = [
    {
      title: "Summit Registrations",
      count: registrationCounts.total,
      href: `/${locale}/admin/registrations`,
      accentColor: "border-purple-500 text-purple-600 bg-purple-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: t.metricsPendingReviews,
      count: metrics.pendingReviews,
      href: `/${locale}/admin/partner-content?tab=IN_REVIEW`,
      accentColor: "border-amber-500 text-amber-600 bg-amber-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: "Pending Scholarships",
      count: pendingScholarshipCount,
      href: `/${locale}/admin/scholarships?tab=IN_REVIEW`,
      accentColor: "border-blue-500 text-blue-600 bg-blue-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      title: t.metricsChangesRequested,
      count: metrics.changesRequested,
      href: `/${locale}/admin/partner-content?tab=CHANGES_REQUESTED`,
      accentColor: "border-rose-500 text-rose-600 bg-rose-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      title: t.metricsPublishedPartners,
      count: metrics.publishedPartners,
      href: `/${locale}/admin/partner-content?tab=PUBLISHED`,
      accentColor: "border-emerald-500 text-emerald-600 bg-emerald-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      title: t.metricsActivePartners,
      count: metrics.activePartners,
      href: `/${locale}/admin/users?role=PARTNER`,
      accentColor: "border-indigo-500 text-indigo-600 bg-indigo-50/50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.portalTitle}</h2>
        <p className="text-xs text-slate-500 mt-1">{t.portalSubtitle}</p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                {c.title}
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {c.count}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${c.accentColor} group-hover:scale-110 transition-transform shrink-0 ml-2`}>
              {c.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Work Queue: Pending Scholarships Awaiting Review */}
      {pendingScholarships.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">Scholarships Awaiting Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pending scholarship submissions from partner institutions</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full border border-blue-200">
              {pendingScholarships.length} pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingScholarships.map((s) => {
              const snap = s.draftSnapshot || s.publishedSnapshot;
              const titleEn = snap?.title?.en || "Untitled";

              return (
                <div
                  key={s._id?.toString()}
                  className="py-3 flex flex-wrap items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50 p-2.5 rounded-xl transition text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{titleEn}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">Type: {snap?.type}</p>
                  </div>

                  <Link
                    href={`/${locale}/admin/scholarships?scholarship=${s._id?.toString()}`}
                    className="py-1.5 px-3 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
                  >
                    Review Scholarship →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work Queue: Partner Content Awaiting Review */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">{t.workQueueTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.workQueueSubtitle}</p>
          </div>
          {pendingOrgs.length > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
              {pendingOrgs.length} pending
            </span>
          )}
        </div>

        {pendingOrgs.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-slate-400 mb-2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-xs font-semibold text-slate-700">{t.workQueueEmpty}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingOrgs.map((org) => {
              const draft = org.draftProfile || org.publishedProfile;
              const logoUrl = draft?.logoUrl || draft?.logo?.secureUrl;
              const submittedDate = org.review?.submittedAt
                ? new Date(org.review.submittedAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : undefined;

              return (
                <div
                  key={org._id?.toString()}
                  className="py-4 flex flex-wrap items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 p-3 rounded-xl transition"
                >
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="w-12 h-12 relative rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 p-1">
                        <Image
                          src={logoUrl}
                          alt={org.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                        {org.name.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{org.name}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          {org.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {org.country} {submittedDate ? `• Submitted ${submittedDate}` : ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/admin/partner-content?organization=${org._id?.toString()}`}
                    className="py-2 px-4 bg-[var(--color-navy)] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition shadow-xs"
                  >
                    {t.reviewCta}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
