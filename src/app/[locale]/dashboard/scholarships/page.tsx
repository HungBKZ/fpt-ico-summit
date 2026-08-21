import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requirePartner } from "@/lib/auth/authorization";
import { listScholarshipsByOrg } from "@/lib/db/repositories/scholarships";
import { PartnerScholarshipList } from "@/components/partner/PartnerScholarshipList";

export default async function PartnerScholarshipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requirePartner();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { dbUser } = authCtx;
  if (!dbUser.organizationId) {
    redirect(`/${locale}/dashboard`);
  }

  const scholarships = await listScholarshipsByOrg(dbUser.organizationId);
  const serializableScholarships = JSON.parse(JSON.stringify(scholarships));

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200">
      <PartnerScholarshipList
        initialScholarships={serializableScholarships}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
