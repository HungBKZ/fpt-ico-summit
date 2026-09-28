import type { Metadata } from "next";
import { isValidLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteConfig } from "@/data/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);
  const siteUrl = siteConfig.domain;
  const ogImageUrl = siteConfig.ogImage;

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    ...(siteUrl
      ? {
          alternates: {
            canonical: `${siteUrl}/${locale}`,
            languages: {
              en: `${siteUrl}/en`,
              vi: `${siteUrl}/vi`,
            },
          },
        }
      : {}),
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      ...(siteUrl ? { url: `${siteUrl}/${locale}` } : {}),
      siteName: siteConfig.name,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 675,
                alt: "FPT University Can Tho Campus - Mekong Edutourism Summit 2026 venue",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

export default async function LocalizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
