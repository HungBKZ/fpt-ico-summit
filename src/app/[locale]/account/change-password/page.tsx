import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 flex items-center justify-center py-12">
        <div className="site-container max-w-md w-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
              {dict.changePassword.title}
            </h1>
            <p className="text-slate-600 text-sm mb-6">
              {dict.changePassword.subtitle}
            </p>

            <ChangePasswordForm locale={locale} dict={dict} />
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
