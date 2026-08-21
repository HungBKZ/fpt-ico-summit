import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
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
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-12">
        <div className="site-container max-w-5xl space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200">
            <PartnerScholarshipList
              initialScholarships={serializableScholarships}
              locale={locale}
              dict={dict}
            />
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} isDashboard={true} />
    </div>
  );
}
