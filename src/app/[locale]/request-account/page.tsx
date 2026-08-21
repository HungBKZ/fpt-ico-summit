import { redirect } from "next/navigation";
import { isValidLocale, Locale } from "@/i18n/config";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "vi" }];
}

export default async function LegacyRequestAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  redirect(`/${locale}/register`);
}
