import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { listUsers } from "@/lib/db/repositories/users";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { AdminUsersList } from "@/components/admin/AdminUsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  const users = await listUsers();

  const enrichedUsers = await Promise.all(
    users.map(async (u) => {
      let organizationName;
      if (u.organizationId) {
        const org = await getOrganizationById(u.organizationId);
        if (org) organizationName = org.name;
      }
      return {
        ...u,
        organizationName,
      };
    })
  );

  const serializableUsers = JSON.parse(JSON.stringify(enrichedUsers));

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xs border border-slate-200">
      <AdminUsersList
        initialUsers={serializableUsers}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
