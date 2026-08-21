import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { getSummitReportOverview } from "@/lib/db/repositories/summit-reports";
import { StaffReportsConsole } from "@/components/staff/StaffReportsConsole";

export const dynamic = "force-dynamic";

export default async function StaffReportsPage({
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
  if (!activeEdition || !activeEdition._id) {
    redirect(`/${locale}/staff`);
  }

  const overview = await getSummitReportOverview(activeEdition._id);

  const editionYear = activeEdition.year || 2026;
  const serializedOverview = JSON.parse(JSON.stringify(overview));

  return (
    <StaffReportsConsole
      editionYear={editionYear}
      overview={serializedOverview}
      dict={dict}
    />
  );
}
