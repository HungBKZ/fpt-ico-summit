import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffDashboardPage({
  params,
}: {
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

  const staffDict = dict.staffDashboard;

  return (
    <StaffShell
      userName={dbUser.name}
      userEmail={dbUser.email}
      userRole={dbUser.role}
      locale={locale}
      dict={dict}
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{staffDict.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{staffDict.subtitle}</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full border border-purple-200">
              {dbUser.role}
            </span>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
            {staffDict.roleNotice}
          </p>
        </div>

        {/* Operational Modules Grid (Preview Foundation for Phase 5C) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {staffDict.modulesTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Check-in Module Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 opacity-90">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                📋
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{staffDict.checkInModule}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{staffDict.checkInDesc}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md">
                Phase 5C Operational Module
              </span>
            </div>

            {/* Booth Management Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 opacity-90">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base">
                ⛺
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{staffDict.boothModule}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{staffDict.boothDesc}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md">
                Phase 5C Operational Module
              </span>
            </div>

            {/* Activity Scheduling Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 opacity-90">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                📅
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{staffDict.schedulingModule}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{staffDict.schedulingDesc}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md">
                Phase 5C Operational Module
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Guard Notice */}
        <div className="p-4 bg-slate-200/60 rounded-xl border border-slate-300 text-[11px] text-slate-600 font-medium">
          🔒 <strong>Privacy Safeguard</strong>: Attendee personal records remain protected and will be accessible only when on-site check-in operations begin in Phase 5C.
        </div>
      </div>
    </StaffShell>
  );
}
