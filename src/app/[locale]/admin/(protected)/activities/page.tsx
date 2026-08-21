import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { listActivitiesForAdmin } from "@/lib/db/repositories/summit-activities";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { AdminActivityList } from "@/components/admin/AdminActivityList";
import type { ActivityType, ActivityDraftStatus } from "@/lib/db/models/summit-activity";

export const dynamic = "force-dynamic";

export default async function AdminActivitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale: rawLocale } = await params;
  const sParams = await searchParams;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireAdmin();
  } catch {
    redirect(`/${locale}/admin/login`);
  }

  const activeEdition = await getActiveSummitEdition();
  if (!activeEdition || !activeEdition._id) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold">No active Summit edition found.</p>
      </div>
    );
  }

  const statusParam = sParams.status || "IN_REVIEW";
  const typeParam = (sParams.type || "All") as ActivityType | "All";
  const queryParam = sParams.q || "";
  const page = Math.max(1, Number(sParams.page) || 1);

  const isApprovedOnly = statusParam === "APPROVED" ? true : undefined;
  const draftStatusParam =
    statusParam !== "APPROVED" && statusParam !== "All"
      ? (statusParam as ActivityDraftStatus)
      : undefined;

  const result = await listActivitiesForAdmin({
    editionId: activeEdition._id,
    type: typeParam,
    draftStatus: draftStatusParam,
    isApprovedOnly,
    q: queryParam,
    page,
    limit: 25,
  });

  // Attach organization name and country for Admin display
  const serializedActivities = await Promise.all(
    result.activities.map(async (act) => {
      const org = await getOrganizationById(act.organizationId);
      return {
        ...JSON.parse(JSON.stringify(act)),
        orgName: org?.name || "Unknown Organization",
        orgCountry: org?.country || "",
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-navy)] mb-1">
          {dict.adminActivities.title}
        </h1>
        <p className="text-xs text-slate-500">
          {dict.adminActivities.subtitle}
        </p>
      </div>

      <AdminActivityList
        activities={serializedActivities}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        activeType={typeParam}
        activeStatus={statusParam}
        queryParam={queryParam}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
