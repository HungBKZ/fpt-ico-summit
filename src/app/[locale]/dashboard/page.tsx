import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requireUser } from "@/lib/auth/authorization";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { getMemberRegistrationStatusAction } from "@/app/actions/registration-actions";
import { MemberProfileCompletionForm } from "@/components/member/MemberProfileCompletionForm";
import { MemberActivitySelectionSummary } from "@/components/member/MemberActivitySelectionSummary";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requireUser();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { dbUser } = authCtx;

  // Enforce server-side mustChangePassword redirect
  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  // Redirect ADMIN to admin users control area
  if (dbUser.role === "ADMIN") {
    redirect(`/${locale}/admin/users`);
  }

  // Redirect SUMMIT_STAFF to staff operational hub
  if (dbUser.role === "SUMMIT_STAFF") {
    redirect(`/${locale}/staff`);
  }

  let organization = null;
  let publishedBooth = null;
  let publishedSchedules: import("@/lib/db/models/summit-activity").SummitActivity[] = [];
  let partnerScholarships: import("@/lib/db/models/scholarship").Scholarship[] = [];
  let partnerActivities: import("@/lib/db/models/summit-activity").SummitActivity[] = [];

  if (dbUser.organizationId) {
    organization = await getOrganizationById(dbUser.organizationId);
    const activeEdition = await import("@/lib/db/repositories/summit-editions").then((m) => m.getActiveSummitEdition());

    if (dbUser.role === "PARTNER") {
      const { listScholarshipsByOrg } = await import("@/lib/db/repositories/scholarships");
      partnerScholarships = await listScholarshipsByOrg(dbUser.organizationId);

      if (activeEdition && activeEdition._id) {
        const { listActivitiesForPartner, listPublishedSchedulesForPartner } = await import("@/lib/db/repositories/summit-activities");
        const { getPublishedBoothForPartner } = await import("@/lib/db/repositories/summit-booth-assignments");
        const [booth, schedules, acts] = await Promise.all([
          getPublishedBoothForPartner(activeEdition._id, dbUser.organizationId),
          listPublishedSchedulesForPartner(activeEdition._id, dbUser.organizationId),
          listActivitiesForPartner(activeEdition._id, dbUser.organizationId),
        ]);
        publishedBooth = booth;
        publishedSchedules = schedules;
        partnerActivities = acts;
      }
    }
  }

  let registration = null;
  let selectedActivityDTOs: import("@/lib/utils/member-dto").MemberSafeActivityDTO[] = [];

  if (dbUser.role === "MEMBER") {
    const regStatus = await getMemberRegistrationStatusAction();
    registration = regStatus.registration;

    if (registration && registration.status === "REGISTERED" && registration._id) {
      const activeEdition = await import("@/lib/db/repositories/summit-editions").then((m) => m.getActiveSummitEdition());
      if (activeEdition && activeEdition._id) {
        const { listSelectionsForRegistration, listActivitiesByIds } = await import("@/lib/db/repositories/summit-activity-selections");
        const { toMemberSafeActivityDTO } = await import("@/lib/utils/member-dto");

        const selections = await listSelectionsForRegistration(registration._id);
        if (selections.length > 0) {
          const selectedObjIds = selections.map((s) => s.activityId);
          const rawSelected = await listActivitiesByIds(selectedObjIds);
          selectedActivityDTOs = rawSelected
            .map((act) => toMemberSafeActivityDTO(act))
            .filter((dto): dto is import("@/lib/utils/member-dto").MemberSafeActivityDTO => dto !== null);
        }
      }
    }
  }

  const getStatusBadge = () => {
    if (!organization) return null;

    if (organization.draftStatus === "CHANGES_REQUESTED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          {dict.partnerCms.statusChangesRequested}
        </span>
      );
    }

    if (organization.draftStatus === "IN_REVIEW") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {dict.partnerCms.statusInReview}
        </span>
      );
    }

    if (organization.isPublished && organization.draftStatus === "NONE") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {dict.partnerCms.statusPublished}
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        {dict.partnerCms.statusDraft}
      </span>
    );
  };

  // Compute operational counts for Partner Cards
  const scPublished = partnerScholarships.filter((s) => s.isPublished).length;
  const scInReview = partnerScholarships.filter((s) => s.draftStatus === "IN_REVIEW").length;
  const scChangesRequested = partnerScholarships.filter((s) => s.draftStatus === "CHANGES_REQUESTED").length;
  const scDraft = partnerScholarships.filter((s) => s.draftStatus === "DRAFT").length;

  const actWorkshops = partnerActivities.filter((a) => a.type === "WORKSHOP").length;
  const actPerformances = partnerActivities.filter((a) => a.type === "STAGE_PERFORMANCE").length;
  const actApproved = partnerActivities.filter((a) => a.isContentApproved).length;
  const actInReview = partnerActivities.filter((a) => a.draftStatus === "IN_REVIEW").length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-8 md:py-12">
        <div className="site-container max-w-5xl space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200 space-y-6">
            {/* Header / Workspace Identity */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  {dbUser.role === "PARTNER" ? "Partner Portal Workspace" : "Member Portal"}
                </span>
                <h1 className="text-2xl font-bold text-[var(--color-navy)] mt-0.5">
                  {dict.dashboard.welcome}, {organization?.name || dbUser.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {dbUser.role === "PARTNER"
                    ? locale === "vi"
                      ? "Quản lý hồ sơ tổ chức, học bổng và các hoạt động Summit của đơn vị."
                      : "Manage your institution profile, scholarships, and Summit activities."
                    : dbUser.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {dbUser.role === "PARTNER" ? (
                  getStatusBadge()
                ) : (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full border border-blue-100">
                    {dict.dashboard.roleLabel}: {dbUser.role}
                  </span>
                )}
              </div>
            </div>

            {/* PARTNER Workspace Content */}
            {dbUser.role === "PARTNER" ? (
              <div className="space-y-6">
                {/* Admin Feedback Warning Banner */}
                {organization?.draftStatus === "CHANGES_REQUESTED" && organization.review?.feedback && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {dict.partnerCms.statusChangesRequested}
                    </p>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      {organization.review.feedback}
                    </p>
                  </div>
                )}

                {/* 3 Operational Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card A: ORGANIZATION PROFILE */}
                  <div className="p-5 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {dict.nav?.orgProfile || "Organization Profile"}
                        </span>
                        {getStatusBadge()}
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-snug">
                          {organization?.name || "My Organization"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {organization?.country || ""} • {organization?.type || ""}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/dashboard/organization`}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--color-navy)] text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition shadow-2xs w-full"
                    >
                      <span>{dict.dashboard.manageOrgBtn || "Manage Profile"}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>

                  {/* Card B: SCHOLARSHIP OPPORTUNITIES */}
                  <div className="p-5 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {dict.nav?.scholarshipOpportunities || "Scholarship Opportunities"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {partnerScholarships.length} {locale === "vi" ? "mục" : "total"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-medium text-slate-500 block">Published</span>
                          <span className="text-base font-bold text-emerald-700">{scPublished}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-medium text-slate-500 block">In Review</span>
                          <span className="text-base font-bold text-blue-700">{scInReview}</span>
                        </div>
                        {scChangesRequested > 0 && (
                          <div className="bg-white p-2.5 rounded-xl border border-rose-200 col-span-2">
                            <span className="text-[10px] font-medium text-rose-600 block">Changes Requested</span>
                            <span className="text-base font-bold text-rose-700">{scChangesRequested}</span>
                          </div>
                        )}
                        {scDraft > 0 && scChangesRequested === 0 && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 col-span-2">
                            <span className="text-[10px] font-medium text-slate-500 block">Drafts</span>
                            <span className="text-base font-bold text-slate-700">{scDraft}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/dashboard/scholarships`}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-50 transition shadow-2xs w-full"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      <span>{dict.partnerScholarships?.title || "Manage Scholarships"}</span>
                    </Link>
                  </div>

                  {/* Card C: SUMMIT ACTIVITIES */}
                  <div className="p-5 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          {dict.nav?.summitActivities || "Summit Activities"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {partnerActivities.length} {locale === "vi" ? "mục" : "total"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-medium text-slate-500 block">Workshops</span>
                          <span className="text-base font-bold text-slate-900">{actWorkshops}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-medium text-slate-500 block">Stage</span>
                          <span className="text-base font-bold text-slate-900">{actPerformances}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200 col-span-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-emerald-800">Approved Content</span>
                          <span className="text-xs font-bold text-emerald-700">{actApproved}</span>
                        </div>
                        {actInReview > 0 && (
                          <div className="bg-white p-2.5 rounded-xl border border-blue-200 col-span-2 flex items-center justify-between">
                            <span className="text-[10px] font-medium text-blue-800">Under Admin Review</span>
                            <span className="text-xs font-bold text-blue-700">{actInReview}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/dashboard/activities`}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-50 transition shadow-2xs w-full"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <span>{dict.partnerActivities?.title || "Manage Activities"}</span>
                    </Link>
                  </div>
                </div>

                {/* Partner Operational Read-Only Info (Phase 5C) */}
                {(publishedBooth || publishedSchedules.length > 0) && (
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Published Booth Read-Only */}
                    {publishedBooth && (
                      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            ⛺ My Summit Booth
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Published
                          </span>
                        </div>

                        {publishedBooth.boothLabel && (
                          <p className="text-slate-800">
                            <strong>Booth:</strong> {publishedBooth.boothLabel}
                          </p>
                        )}

                        {publishedBooth.locationText && (
                          <p className="text-slate-800">
                            <strong>Location:</strong> {publishedBooth.locationText}
                          </p>
                        )}

                        {publishedBooth.note && (
                          <p className="text-slate-600 bg-white p-2 rounded-lg border border-amber-100">
                            {publishedBooth.note}
                          </p>
                        )}

                        {publishedBooth.boothPhoto?.secureUrl && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-amber-200 mt-2">
                            <Image
                              src={publishedBooth.boothPhoto.secureUrl}
                              alt="Booth photo"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Published Schedules Read-Only */}
                    {publishedSchedules.length > 0 && (
                      <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          📅 My Activity Schedules
                        </span>

                        <div className="space-y-2">
                          {publishedSchedules.map((act) => {
                            const sched = act.publishedSchedule!;
                            const title = act.approvedSnapshot?.title?.en || "Activity";

                            return (
                              <div
                                key={act._id!.toString()}
                                className="p-2.5 bg-white rounded-lg border border-purple-100 space-y-0.5"
                              >
                                <span className="font-bold text-slate-900 block">{title}</span>
                                <span className="text-[11px] text-purple-700 font-semibold block font-mono">
                                  📅 {sched.dateKey} • {sched.startTime} – {sched.endTime}
                                </span>
                                <span className="text-[11px] text-slate-600 block">
                                  <strong>Venue:</strong> {sched.venue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* MEMBER Dashboard Content */
              (() => {
                const regDict = dict.memberRegistration;

                if (!dbUser.profile?.memberType && !registration) {
                  return (
                    <MemberProfileCompletionForm
                      userEmail={dbUser.email}
                      userName={dbUser.name}
                      defaultPhone={dbUser.profile?.phone || ""}
                      defaultStudentId={dbUser.profile?.studentId || ""}
                      defaultInstitution={dbUser.profile?.institution || dbUser.profile?.schoolOrUniversity || ""}
                      locale={locale}
                    />
                  );
                }

                return (
                  <div className="space-y-6">
                    {registration ? (
                      /* Confirmed Registration Status Card */
                      <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                              ✓
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-emerald-950">{regDict.confirmedTitle}</h2>
                              <p className="text-emerald-800 font-medium">{regDict.confirmedMessage}</p>
                            </div>
                          </div>

                          <Link
                            href={`/${locale}/dashboard/registration`}
                            className="py-2 px-4 bg-white text-slate-800 border border-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-50 transition shadow-2xs"
                          >
                            {regDict.viewRegistrationBtn}
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-emerald-100 font-medium">
                          <div>
                            <span className="text-[11px] text-slate-500 block">{regDict.participantTypeLabel}</span>
                            <strong className="text-slate-900">
                              {registration.participantType === "FPT_STUDENT"
                                ? regDict.fptStudentOption
                                : regDict.externalOption}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">{regDict.fullNameLabel}</span>
                            <strong className="text-slate-900">{registration.attendeeSnapshot.fullName}</strong>
                          </div>
                          {registration.attendeeSnapshot.studentId && (
                            <div>
                              <span className="text-[11px] text-slate-500 block">{regDict.studentIdLabel}</span>
                              <strong className="text-slate-900 font-mono">{registration.attendeeSnapshot.studentId}</strong>
                            </div>
                          )}
                          <div>
                            <span className="text-[11px] text-slate-500 block">{regDict.phoneLabel}</span>
                            <strong className="text-slate-900 font-mono">{registration.attendeeSnapshot.phone}</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-emerald-900 bg-emerald-100/60 p-3 rounded-xl leading-relaxed border border-emerald-200 font-medium">
                          {regDict.disclaimer}
                        </p>

                        {/* Member Activity Selection Summary (Phase 5D) */}
                        <MemberActivitySelectionSummary
                          selectedActivities={selectedActivityDTOs}
                          locale={locale}
                        />
                      </div>
                    ) : (
                      /* Unregistered Call to Action */
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                              FPT ICO SUMMIT 2026
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-2">
                              {locale === "vi" ? "Đăng ký tham dự Summit đã sẵn sàng" : "Registration is now available"}
                            </h2>
                            <p className="text-xs text-slate-600 mt-0.5 font-medium">
                              {locale === "vi"
                                ? "Đăng ký ngay để giữ chỗ tham dự các chương trình và cơ hội học bổng quốc tế."
                                : "Register now to secure your spot for international education sessions and scholarship opportunities."}
                            </p>
                          </div>

                          <Link
                            href={`/${locale}/dashboard/registration`}
                            className="py-3 px-6 bg-[var(--color-navy)] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-md whitespace-nowrap"
                          >
                            {regDict.registerNowBtn} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} isDashboard={true} />
    </div>
  );
}
