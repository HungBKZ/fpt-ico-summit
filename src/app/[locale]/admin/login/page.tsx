import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  // If already authenticated as ADMIN, redirect to overview
  const session = await auth();
  if (session?.user && (session.user as { role?: string }).role === "ADMIN") {
    redirect(`/${locale}/admin`);
  }

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-slate-700">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[var(--color-orange)] text-white font-black text-xl rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            ICO
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            FPT ICO Summit Admin Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Restricted System Administration Console
          </p>
        </div>

        <AdminLoginForm locale={locale} dict={dict} />
      </div>
    </div>
  );
}
