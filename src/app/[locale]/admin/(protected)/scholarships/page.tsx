import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { listScholarshipsForAdmin } from "@/lib/db/repositories/scholarships";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import {
  AdminScholarshipReviewList,
  EnrichedScholarship,
} from "@/components/admin/AdminScholarshipReviewList";

export const dynamic = "force-dynamic";

export default async function AdminScholarshipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  const scholarships = await listScholarshipsForAdmin("ALL");

  const enrichedScholarships: EnrichedScholarship[] = await Promise.all(
    scholarships.map(async (s) => {
      let orgName = "Unknown Institution";
      let orgType = "UNIVERSITY";
      let orgCountry = "Vietnam";
      let orgLogoUrl;

      if (s.organizationId) {
        const org = await getOrganizationById(s.organizationId);
        if (org) {
          orgName = org.name;
          orgType = org.type;
          orgCountry = org.country;
          const pub = org.publishedProfile || org.draftProfile;
          orgLogoUrl = pub?.logoUrl || pub?.logo?.secureUrl;
        }
      }

      return {
        ...s,
        organizationName: orgName,
        organizationType: orgType,
        organizationCountry: orgCountry,
        organizationLogoUrl: orgLogoUrl,
      };
    })
  );

  const serializableScholarships = JSON.parse(JSON.stringify(enrichedScholarships));

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          {dict.adminScholarships.title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {dict.adminScholarships.subtitle}
        </p>
      </div>

      <AdminScholarshipReviewList
        initialScholarships={serializableScholarships}
        dict={dict}
      />
    </div>
  );
}
