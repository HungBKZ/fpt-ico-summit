import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { getEditionDayKeys } from "@/lib/utils/edition-utils";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import {
  listApprovedActivitiesForScheduling,
  countSchedulingStats,
} from "@/lib/db/repositories/summit-activities";
import { StaffSchedulingConsole } from "@/components/staff/StaffSchedulingConsole";
import type { ActivityType } from "@/lib/db/models/summit-activity";

export const dynamic = "force-dynamic";

export default async function StaffSchedulingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireSummitOperationsAccess();
  } catch {
    redirect(`/${locale}/staff/login`);
  }

  const activeEdition = await getActiveSummitEdition();
  if (!activeEdition || !activeEdition._id) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Activity Scheduling</h1>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold">
          No ACTIVE Summit Edition found. Please activate an edition in Edition Management.
        </div>
      </div>
    );
  }

  const sParams = await searchParams;
  const currentType = (sParams.type as ActivityType | "All") || "All";
  const currentStatus = (sParams.status as "All" | "UNSCHEDULED" | "DRAFT_ONLY" | "PUBLISHED") || "All";
  const searchQuery = sParams.q || "";

  const editionDays = getEditionDayKeys(activeEdition);

  const { countSelectionsForEditionGrouped } = await import("@/lib/db/repositories/summit-activity-selections");

  const [activities, stats, selectionCounts] = await Promise.all([
    listApprovedActivitiesForScheduling(
      activeEdition._id,
      currentType,
      currentStatus,
      searchQuery
    ),
    countSchedulingStats(activeEdition._id),
    countSelectionsForEditionGrouped(activeEdition._id),
  ]);

  // Build organization map for display
  const orgMap: Record<string, { name: string; country: string }> = {};
  for (const act of activities) {
    const orgIdStr = act.organizationId.toString();
    if (!orgMap[orgIdStr]) {
      const org = await getOrganizationById(act.organizationId);
      orgMap[orgIdStr] = {
        name: org?.name || "Unknown Organization",
        country: org?.country || "",
      };
    }
  }

  return (
    <StaffSchedulingConsole
      editionDays={editionDays}
      activities={JSON.parse(JSON.stringify(activities))}
      stats={stats}
      orgMap={orgMap}
      selectionCounts={selectionCounts}
      locale={locale}
      dict={dict}
    />
  );
}
