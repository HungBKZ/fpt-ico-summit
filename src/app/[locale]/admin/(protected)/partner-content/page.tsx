import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { listOrganizationsForAdmin } from "@/lib/db/repositories/organizations";
import { AdminPartnerReviewList } from "@/components/admin/AdminPartnerReviewList";

export const dynamic = "force-dynamic";

export default async function AdminPartnerContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  const organizations = await listOrganizationsForAdmin("ALL");
  const serializableOrgs = JSON.parse(JSON.stringify(organizations));

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          {dict.adminPartnerContent.title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {dict.adminPartnerContent.subtitle}
        </p>
      </div>

      <AdminPartnerReviewList
        initialOrganizations={serializableOrgs}
        dict={dict}
      />
    </div>
  );
}
