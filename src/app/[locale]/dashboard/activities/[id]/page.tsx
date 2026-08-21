import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requirePartner } from "@/lib/auth/authorization";
import { findActivityById } from "@/lib/db/repositories/summit-activities";
import { WorkshopEditorForm } from "@/components/partner/WorkshopEditorForm";
import { PerformanceEditorForm } from "@/components/partner/PerformanceEditorForm";

export default async function PartnerActivityEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
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

  const activity = await findActivityById(id);
  if (!activity || !activity._id) {
    notFound();
  }

  if (!activity.organizationId.equals(dbUser.organizationId)) {
    redirect(`/${locale}/dashboard/activities`);
  }

  const serializedActivity = JSON.parse(JSON.stringify(activity));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-12">
        <div className="site-container max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/dashboard/activities`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              ← {dict.partnerActivities.title}
            </Link>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activity.type === "WORKSHOP"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              {activity.type === "WORKSHOP"
                ? dict.partnerActivities.typeWorkshop
                : dict.partnerActivities.typePerformance}
            </span>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-navy)] mb-1">
                {activity.draftSnapshot?.title?.en || "Activity Proposal Editor"}
              </h1>
              <p className="text-xs text-slate-500">
                {activity.type === "WORKSHOP"
                  ? "Configure workshop content, speaker profiles, equipment requirements & materials."
                  : "Configure performance details, internal contact, stage requirements & audio links."}
              </p>
            </div>

            {activity.type === "WORKSHOP" ? (
              <WorkshopEditorForm
                activity={serializedActivity}
                locale={locale}
                dict={dict}
              />
            ) : (
              <PerformanceEditorForm
                activity={serializedActivity}
                locale={locale}
                dict={dict}
              />
            )}
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
