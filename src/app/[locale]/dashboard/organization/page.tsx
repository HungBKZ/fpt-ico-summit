import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requirePartner } from "@/lib/auth/authorization";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { OrganizationEditorForm } from "@/components/partner/OrganizationEditorForm";

export default async function PartnerOrganizationPage({
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

  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  if (!dbUser.organizationId) {
    redirect(`/${locale}/dashboard`);
  }

  const organization = await getOrganizationById(dbUser.organizationId);
  if (!organization) {
    redirect(`/${locale}/dashboard`);
  }

  const serializableOrg = JSON.parse(JSON.stringify(organization));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-10">
        <div className="site-container max-w-4xl">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <OrganizationEditorForm
              organization={serializableOrg}
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
