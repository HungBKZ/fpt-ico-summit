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

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL(siteConfig.domain),
    alternates: {
      canonical: `${siteConfig.domain}/${locale}`,
      languages: {
        en: `${siteConfig.domain}/en`,
        vi: `${siteConfig.domain}/vi`,
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${siteConfig.domain}/${locale}`,
      siteName: siteConfig.name,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
      images: [
        {
          url: "https://res.cloudinary.com/dvucotc8z/image/upload/v1786512975/A14-ICO-Summit_ldtgju.png",
          width: 1200,
          height: 630,
          alt: "FPT ICO Summit 2026 social preview image",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        "https://res.cloudinary.com/dvucotc8z/image/upload/v1786512975/A14-ICO-Summit_ldtgju.png",
      ],
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
