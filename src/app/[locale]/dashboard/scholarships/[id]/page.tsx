import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requirePartner } from "@/lib/auth/authorization";
import { getScholarshipById } from "@/lib/db/repositories/scholarships";
import { ScholarshipEditorForm } from "@/components/partner/ScholarshipEditorForm";

export default async function PartnerScholarshipDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id: scholarshipIdStr } = await params;
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

  if (!ObjectId.isValid(scholarshipIdStr)) {
    redirect(`/${locale}/dashboard/scholarships`);
  }

  const scholarship = await getScholarshipById(new ObjectId(scholarshipIdStr));

  // Enforce ownership: Partner can ONLY manage scholarships belonging to their own organizationId
  if (!scholarship || !scholarship.organizationId.equals(dbUser.organizationId)) {
    redirect(`/${locale}/dashboard/scholarships`);
  }

  const serializableScholarship = JSON.parse(JSON.stringify(scholarship));

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200">
      <ScholarshipEditorForm
        scholarship={serializableScholarship}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
