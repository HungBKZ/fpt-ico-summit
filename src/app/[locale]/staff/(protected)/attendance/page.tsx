import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { listApprovedActivitiesForScheduling } from "@/lib/db/repositories/summit-activities";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { countAttendanceMetricsByActivity } from "@/lib/db/repositories/summit-activity-attendances";
import {
  StaffActivityAttendanceConsole,
  type ActivityConsoleItem,
} from "@/components/staff/StaffActivityAttendanceConsole";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
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
  const consoleItems: ActivityConsoleItem[] = [];

  if (activeEdition && activeEdition._id) {
    // List content-approved activities that have a publishedSchedule
    const activities = await listApprovedActivitiesForScheduling(activeEdition._id, "All", "PUBLISHED");

    for (const act of activities) {
      if (!act._id) continue;

      const org = await getOrganizationById(act.organizationId);
      const metrics = await countAttendanceMetricsByActivity(act._id);

      consoleItems.push({
        activity: act,
        orgName: org?.name || "Institution",
        orgCountry: org?.country || "",
        metrics,
      });
    }
  }

  const serializedItems: ActivityConsoleItem[] = JSON.parse(JSON.stringify(consoleItems));

  return (
    <StaffActivityAttendanceConsole
      items={serializedItems}
      locale={locale}
      dict={dict}
    />
  );
}
