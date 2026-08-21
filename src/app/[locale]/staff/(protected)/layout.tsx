import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffProtectedLayout({
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
    authCtx = await requireSummitOperationsAccess();
  } catch {
    redirect(`/${locale}/staff/login`);
  }

  const { dbUser } = authCtx;
  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  return (
    <StaffShell
      userName={dbUser.name}
      userEmail={dbUser.email}
      userRole={dbUser.role}
      locale={locale}
      dict={dict}
    >
      {children}
    </StaffShell>
  );
}
