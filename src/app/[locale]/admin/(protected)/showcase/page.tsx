import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  listShowcaseEntriesForAdmin,
  getShowcaseMetrics,
} from "@/lib/db/repositories/partner-showcase";
import { listOrganizationsForAdmin } from "@/lib/db/repositories/organizations";
import { ShowcaseManagementClient } from "@/components/admin/ShowcaseManagementClient";

export default async function AdminShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  try {
    await requireAdmin();
  } catch {
    redirect(`/${locale}/admin/login`);
  }

  const [entries, metrics, rawOrganizations] = await Promise.all([
    listShowcaseEntriesForAdmin(),
    getShowcaseMetrics(),
    listOrganizationsForAdmin("ALL"),
  ]);

  // Serialize MongoDB ObjectIds and Dates for Client Component
  const serializedEntries = entries.map((entry) => ({
    id: entry._id?.toString() || "",
    displayName: entry.displayName,
    country: entry.country || "",
    websiteUrl: entry.websiteUrl || "",
    logo: entry.logo
      ? {
          publicId: entry.logo.publicId,
          secureUrl: entry.logo.secureUrl,
          width: entry.logo.width,
          height: entry.logo.height,
        }
      : null,
    relationshipStatus: entry.relationshipStatus,
    isVisible: entry.isVisible,
    displayOrder: entry.displayOrder,
    organizationId: entry.organizationId?.toString() || null,
    displayConsentConfirmed: entry.displayConsentConfirmed,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));

  const organizationOptions = rawOrganizations.map((org) => ({
    id: org._id?.toString() || "",
    name: org.name,
    country: org.country,
    type: org.type,
  }));

  return (
    <ShowcaseManagementClient
      locale={locale}
      dict={dict}
      initialEntries={serializedEntries}
      metrics={metrics}
      organizationOptions={organizationOptions}
    />
  );
}
