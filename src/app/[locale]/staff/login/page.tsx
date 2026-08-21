import { auth } from "@/auth";
import { findUserById } from "@/lib/db/repositories/users";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LoginForm } from "@/components/auth/LoginForm";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  // If already authenticated as SUMMIT_STAFF or ADMIN, redirect to /[locale]/staff
  const session = await auth();
  if (session?.user?.id) {
    const dbUser = await findUserById(session.user.id);
    if (
      dbUser &&
      dbUser.status === "ACTIVE" &&
      (dbUser.role === "SUMMIT_STAFF" || dbUser.role === "ADMIN")
    ) {
      redirect(`/${locale}/staff`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-orange)] text-white font-bold flex items-center justify-center text-sm mb-3">
                ICO
              </div>
              <h1 className="text-xl font-bold text-white">
                FPT ICO Summit Staff Operations
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Sign in with your operational Summit Staff account.
              </p>
            </div>

            <LoginForm locale={locale} dict={dict} redirectTo={`/${locale}/staff`} />
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
