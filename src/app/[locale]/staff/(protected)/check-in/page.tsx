import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { getEditionDayKeys, isValidDayKey } from "@/lib/utils/edition-utils";
import {
  listRegistrationsWithCheckInStatus,
  countCheckInStats,
} from "@/lib/db/repositories/summit-check-ins";
import { StaffCheckInConsole } from "@/components/staff/StaffCheckInConsole";
import type { ParticipantType } from "@/lib/db/models/summit-registration";

export const dynamic = "force-dynamic";

export default async function StaffCheckInPage({
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
        <h1 className="text-xl font-bold text-slate-900">Check-in Console</h1>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold">
          No ACTIVE Summit Edition found. Please activate an edition in Edition Management.
        </div>
      </div>
    );
  }

  const sParams = await searchParams;
  const editionDays = getEditionDayKeys(activeEdition);
  const selectedDay =
    sParams.day && isValidDayKey(sParams.day, activeEdition)
      ? sParams.day
      : editionDays[0] || "2026-11-20";

  const currentType = (sParams.type as ParticipantType | "All") || "All";
  const currentStatus = (sParams.status as "All" | "CHECKED_IN" | "NOT_CHECKED_IN") || "All";
  const searchQuery = sParams.q || "";
  const page = Math.max(1, parseInt(sParams.page || "1", 10) || 1);

  const [listResult, stats] = await Promise.all([
    listRegistrationsWithCheckInStatus({
      editionId: activeEdition._id,
      dayKey: selectedDay,
      participantType: currentType,
      checkInStatus: currentStatus,
      q: searchQuery,
      page,
      limit: 25,
    }),
    countCheckInStats(activeEdition._id, selectedDay),
  ]);

  return (
    <StaffCheckInConsole
      editionDays={editionDays}
      selectedDay={selectedDay}
      registrations={JSON.parse(JSON.stringify(listResult.registrations))}
      total={listResult.total}
      page={listResult.page}
      totalPages={listResult.totalPages}
      currentType={currentType}
      currentStatus={currentStatus}
      searchQuery={searchQuery}
      stats={stats}
      locale={locale}
      dict={dict}
    />
  );
}
