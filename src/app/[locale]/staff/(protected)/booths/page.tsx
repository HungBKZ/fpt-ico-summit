import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { getConfirmedParticipationsForEdition } from "@/lib/db/repositories/organization-participations";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import {
  listBoothAssignmentsForStaff,
  countBoothStats,
} from "@/lib/db/repositories/summit-booth-assignments";
import { StaffBoothManager } from "@/components/staff/StaffBoothManager";

export const dynamic = "force-dynamic";

export default async function StaffBoothsPage({
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
        <h1 className="text-xl font-bold text-slate-900">Booth Management</h1>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold">
          No ACTIVE Summit Edition found. Please activate an edition in Edition Management.
        </div>
      </div>
    );
  }

  const sParams = await searchParams;
  const currentStatus = (sParams.status as "All" | "DRAFT_ONLY" | "PUBLISHED") || "All";
  const searchQuery = sParams.q || "";
  const page = Math.max(1, parseInt(sParams.page || "1", 10) || 1);

  // Fetch confirmed participations for active edition
  const confirmedParticipations = await getConfirmedParticipationsForEdition(activeEdition._id);

  // Enrich with Organization names
  const confirmedOrgs = await Promise.all(
    confirmedParticipations.map(async (part) => {
      const org = await getOrganizationById(part.organizationId);
      return {
        _id: part.organizationId.toString(),
        name: org?.name || "Unknown Organization",
        country: org?.country || "",
        type: org?.type || "UNIVERSITY",
      };
    })
  );

  const [listResult, stats] = await Promise.all([
    listBoothAssignmentsForStaff({
      editionId: activeEdition._id,
      statusFilter: currentStatus,
      q: searchQuery,
      page,
      limit: 25,
    }),
    countBoothStats(activeEdition._id),
  ]);

  return (
    <StaffBoothManager
      booths={JSON.parse(JSON.stringify(listResult.booths))}
      total={listResult.total}
      page={listResult.page}
      totalPages={listResult.totalPages}
      currentStatus={currentStatus}
      searchQuery={searchQuery}
      stats={stats}
      confirmedOrgs={confirmedOrgs}
      locale={locale}
      dict={dict}
    />
  );
}
