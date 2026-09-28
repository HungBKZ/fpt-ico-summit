import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { siteConfig } from "@/data/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = siteConfig.domain;
const ogImageUrl = siteConfig.ogImage;

export const metadata: Metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    ...(siteUrl ? { url: siteUrl } : {}),
    siteName: siteConfig.name,
    locale: "en_US",
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
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh flex flex-col">
        {/* Skip link — visible on keyboard focus, assists screen-reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
