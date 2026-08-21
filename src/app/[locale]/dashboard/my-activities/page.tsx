import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requireUser } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { findRegistrationByEditionAndUser } from "@/lib/db/repositories/summit-registrations";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import {
  listEligibleActivitiesForMember,
  listSelectionsForRegistration,
} from "@/lib/db/repositories/summit-activity-selections";
import { toMemberSafeActivityDTO, MemberSafeActivityDTO } from "@/lib/utils/member-dto";
import { MemberActivityBrowser } from "@/components/member/MemberActivityBrowser";

export const dynamic = "force-dynamic";

export default async function MemberMyActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requireUser();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { dbUser } = authCtx;

  // Enforce password change if needed
  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  // Dedicated Member route: redirect non-Members to appropriate areas
  if (dbUser.role === "PARTNER") {
    redirect(`/${locale}/dashboard/activities`);
  }
  if (dbUser.role === "ADMIN") {
    redirect(`/${locale}/admin/users`);
  }
  if (dbUser.role === "SUMMIT_STAFF") {
    redirect(`/${locale}/staff`);
  }

  const activeEdition = await getActiveSummitEdition();
  let eligibleDTOs: MemberSafeActivityDTO[] = [];
  let userSelections: string[] = [];
  let selectableActivityIds: string[] = [];
  let attendedActivityIds: string[] = [];
  let isRegistered = false;
  const orgMap: Record<string, { name: string; country: string }> = {};

  if (activeEdition && activeEdition._id) {
    const { listActivitiesByIds } = await import("@/lib/db/repositories/summit-activity-selections");

    const rawEligible = await listEligibleActivitiesForMember(activeEdition._id);
    selectableActivityIds = rawEligible.map((a) => a._id!.toString());

    // Check Member registration & active selections
    const registration = await findRegistrationByEditionAndUser(activeEdition._id, dbUser._id!);
    let selectedActivities: import("@/lib/db/models/summit-activity").SummitActivity[] = [];

    if (registration && registration.status === "REGISTERED" && registration._id) {
      isRegistered = true;
      const selections = await listSelectionsForRegistration(registration._id);
      userSelections = selections.map((s) => s.activityId.toString());

      if (selections.length > 0) {
        const selectedObjIds = selections.map((s) => s.activityId);
        selectedActivities = await listActivitiesByIds(selectedObjIds);
      }

      const { getDb } = await import("@/lib/db/mongodb");
      const { COLLECTIONS } = await import("@/lib/db/collections");
      const db = await getDb();
      const attendances = await db
        .collection(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES)
        .find({ registrationId: registration._id })
        .toArray();

      attendedActivityIds = attendances.map((a) => a.activityId.toString());
    }

    // Merge eligible activities + selected activities (dedup by _id)
    const combinedMap = new Map<string, import("@/lib/db/models/summit-activity").SummitActivity>();
    for (const act of rawEligible) {
      if (act._id) combinedMap.set(act._id.toString(), act);
    }
    for (const act of selectedActivities) {
      if (act._id) combinedMap.set(act._id.toString(), act);
    }

    const combinedList = Array.from(combinedMap.values());
    eligibleDTOs = combinedList
      .map((act) => {
        const isSelectable = selectableActivityIds.includes(act._id!.toString());
        return toMemberSafeActivityDTO(act, isSelectable);
      })
      .filter((dto): dto is MemberSafeActivityDTO => dto !== null);

    // Build orgMap for all combined activities
    for (const act of combinedList) {
      const orgIdStr = act.organizationId.toString();
      if (!orgMap[orgIdStr]) {
        const org = await getOrganizationById(act.organizationId);
        orgMap[orgIdStr] = {
          name: org?.name || "Unknown Institution",
          country: org?.country || "",
        };
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)] text-slate-900">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-10">
        <div className="site-container max-w-5xl">
          <MemberActivityBrowser
            activities={eligibleDTOs}
            userSelections={userSelections}
            selectableActivityIds={selectableActivityIds}
            attendedActivityIds={attendedActivityIds}
            isRegistered={isRegistered}
            orgMap={orgMap}
            locale={locale}
            dict={dict}
          />
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
