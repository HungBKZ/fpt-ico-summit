import { redirect, notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { findActivityById } from "@/lib/db/repositories/summit-activities";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { listActivityAttendanceDetails } from "@/lib/db/repositories/summit-activity-attendances";
import { StaffActivityAttendanceDetail } from "@/components/staff/StaffActivityAttendanceDetail";

export const dynamic = "force-dynamic";

export default async function StaffAttendanceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id: rawId } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireSummitOperationsAccess();
  } catch {
    redirect(`/${locale}/staff/login`);
  }

  const activeEdition = await getActiveSummitEdition();
  if (!activeEdition || !activeEdition._id) {
    redirect(`/${locale}/staff`);
  }

  let actObjId: ObjectId;
  try {
    actObjId = new ObjectId(rawId);
  } catch {
    notFound();
  }

  const activity = await findActivityById(actObjId);
  if (!activity || !activity._id || !activity.editionId.equals(activeEdition._id)) {
    notFound();
  }

  const org = await getOrganizationById(activity.organizationId);
  const orgName = org?.name || "Institution";

  const { rows, metrics } = await listActivityAttendanceDetails(
    activity._id,
    activeEdition._id,
    activity.publishedSchedule?.dateKey
  );

  const serializedActivity = JSON.parse(JSON.stringify(activity));
  const serializedRows = JSON.parse(JSON.stringify(rows));
  const serializedMetrics = JSON.parse(JSON.stringify(metrics));

  return (
    <StaffActivityAttendanceDetail
      activity={serializedActivity}
      orgName={orgName}
      initialRows={serializedRows}
      initialMetrics={serializedMetrics}
      locale={locale}
      dict={dict}
    />
  );
}
