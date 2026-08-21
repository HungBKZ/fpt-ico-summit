import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import {
  listRegistrationsForAdmin,
  countRegistrationsByEdition,
} from "@/lib/db/repositories/summit-registrations";
import { AdminRegistrationList } from "@/components/admin/AdminRegistrationList";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireAdmin();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { q = "", type = "All", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const activeEdition = await getActiveSummitEdition();
  if (!activeEdition || !activeEdition._id) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">{dict.adminRegistrations.title}</h1>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-semibold">
          No ACTIVE Summit Edition found. Please activate an edition in Edition Management.
        </div>
      </div>
    );
  }

  const [listResult, counts] = await Promise.all([
    listRegistrationsForAdmin({
      editionId: activeEdition._id,
      q,
      participantType: type as import("@/lib/db/models/summit-registration").ParticipantType | "All",
      page,
      limit: 25,
    }),
    countRegistrationsByEdition(activeEdition._id),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-navy)]">{dict.adminRegistrations.title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{dict.adminRegistrations.subtitle}</p>
      </div>

      <AdminRegistrationList
        registrations={JSON.parse(JSON.stringify(listResult.registrations))}
        total={listResult.total}
        page={listResult.page}
        totalPages={listResult.totalPages}
        currentTab={type}
        searchQuery={q}
        counts={counts}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
