import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/authorization";
import { countPendingOrganizations } from "@/lib/db/repositories/organizations";
import { countPendingScholarships } from "@/lib/db/repositories/scholarships";
import { countPendingActivities } from "@/lib/db/repositories/summit-activities";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requireAdmin();
  } catch {
    redirect(`/${locale}/admin/login`);
  }

  const { dbUser } = authCtx;

  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  const [pendingOrgCount, pendingScholarshipCount, pendingActivityCount] = await Promise.all([
    countPendingOrganizations(),
    countPendingScholarships(),
    countPendingActivities(),
  ]);

  return (
    <AdminShell
      locale={locale}
      dict={dict}
      pendingCount={pendingOrgCount}
      pendingScholarshipCount={pendingScholarshipCount}
      pendingActivityCount={pendingActivityCount}
      userName={dbUser.name}
      userEmail={dbUser.email}
    >
      {children}
    </AdminShell>
  );
}
