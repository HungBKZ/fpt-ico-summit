import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/authorization";
import { findActivityById } from "@/lib/db/repositories/summit-activities";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { AdminActivityReviewDetail } from "@/components/admin/AdminActivityReviewDetail";

export const dynamic = "force-dynamic";

export default async function AdminActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireAdmin();
  } catch {
    redirect(`/${locale}/admin/login`);
  }

  const activity = await findActivityById(id);
  if (!activity || !activity._id) {
    notFound();
  }

  const org = await getOrganizationById(activity.organizationId);

  const serializedActivity = {
    ...JSON.parse(JSON.stringify(activity)),
    orgName: org?.name || "Unknown Organization",
    orgCountry: org?.country || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/${locale}/admin/activities`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 mb-2"
        >
          ← {dict.adminActivities.title}
        </Link>
      </div>

      <AdminActivityReviewDetail
        activity={serializedActivity}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
