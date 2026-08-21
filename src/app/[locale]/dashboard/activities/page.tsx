import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requirePartner } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { listActivitiesForPartner } from "@/lib/db/repositories/summit-activities";
import { ActivityProposalList } from "@/components/partner/ActivityProposalList";
import type { SummitActivity } from "@/lib/db/models/summit-activity";

export default async function PartnerActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requirePartner();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { dbUser } = authCtx;
  if (!dbUser.organizationId) {
    redirect(`/${locale}/dashboard`);
  }

  const activeEdition = await getActiveSummitEdition();
  let activities: SummitActivity[] = [];
  const attendanceMetricsMap: Record<
    string,
    import("@/lib/db/repositories/summit-activity-attendances").ActivityAttendanceMetrics
  > = {};

  if (activeEdition && activeEdition._id) {
    activities = await listActivitiesForPartner(activeEdition._id, dbUser.organizationId);

    const { countAttendanceMetricsByActivity } = await import("@/lib/db/repositories/summit-activity-attendances");
    for (const act of activities) {
      if (act._id && act.publishedSchedule) {
        const metrics = await countAttendanceMetricsByActivity(act._id);
        attendanceMetricsMap[act._id.toString()] = metrics;
      }
    }
  }

  const serializedActivities = JSON.parse(JSON.stringify(activities));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-12">
        <div className="site-container max-w-5xl space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-1">
                {dict.partnerActivities.title}
              </h1>
              <p className="text-xs text-slate-500">
                {dict.partnerActivities.subtitle}
              </p>
            </div>

            <ActivityProposalList
              activities={serializedActivities}
              attendanceMetricsMap={attendanceMetricsMap}
              locale={locale}
              dict={dict}
            />
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
