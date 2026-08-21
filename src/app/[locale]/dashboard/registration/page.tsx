import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { requireMember } from "@/lib/auth/authorization";
import { getMemberRegistrationStatusAction } from "@/app/actions/registration-actions";
import { SummitRegistrationForm } from "@/components/member/SummitRegistrationForm";
import { MemberProfileCompletionForm } from "@/components/member/MemberProfileCompletionForm";

export default async function MemberRegistrationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : "en";
  const dict = getDictionary(locale);

  let authCtx;
  try {
    authCtx = await requireMember();
  } catch {
    redirect(`/${locale}/login`);
  }

  const { dbUser } = authCtx;
  if (dbUser.mustChangePassword) {
    redirect(`/${locale}/account/change-password`);
  }

  const { activeEdition, registration } = await getMemberRegistrationStatusAction();
  const regDict = dict.memberRegistration;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-white)]">
      <SiteHeader locale={locale} dict={dict} />

      <main id="main-content" className="flex-1 py-10">
        <div className="site-container max-w-3xl">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            {/* Navigation & Breadcrumb */}
            <div className="space-y-1 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link href={`/${locale}/dashboard`} className="hover:text-blue-600 transition">
                  {locale === "vi" ? "Tổng quan" : "Dashboard"}
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold">
                  {locale === "vi" ? "Đăng ký Summit" : "Summit Registration"}
                </span>
              </div>
              <Link
                href={`/${locale}/dashboard`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                ← {locale === "vi" ? "Quay lại Tổng quan" : "Back to Dashboard"}
              </Link>
              <h1 className="text-xl font-bold text-[var(--color-navy)] pt-1">
                {regDict.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{regDict.subtitle}</p>
            </div>

            {!activeEdition ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">
                  {locale === "vi"
                    ? "Hiện chưa có kỳ Summit nào đang mở đăng ký."
                    : "No active Summit edition is currently open for registration."}
                </p>
              </div>
            ) : registration ? (
              /* Confirmed Registration Summary Card */
              <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-emerald-950">{regDict.confirmedTitle}</h2>
                    <p className="text-emerald-800 font-medium">{regDict.confirmedMessage}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-emerald-100 font-medium">
                  <div>
                    <span className="text-[11px] text-slate-500 block">{regDict.participantTypeLabel}</span>
                    <strong className="text-slate-900">
                      {registration.participantType === "FPT_STUDENT"
                        ? regDict.fptStudentOption
                        : regDict.externalOption}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">{regDict.fullNameLabel}</span>
                    <strong className="text-slate-900">{registration.attendeeSnapshot.fullName}</strong>
                  </div>
                  {registration.attendeeSnapshot.studentId && (
                    <div>
                      <span className="text-[11px] text-slate-500 block">{regDict.studentIdLabel}</span>
                      <strong className="text-slate-900 font-mono">{registration.attendeeSnapshot.studentId}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-slate-500 block">{regDict.phoneLabel}</span>
                    <strong className="text-slate-900 font-mono">{registration.attendeeSnapshot.phone}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900 bg-emerald-100/60 p-3 rounded-xl leading-relaxed border border-emerald-200 font-medium">
                  {regDict.disclaimer}
                </p>
              </div>
            ) : !dbUser.profile?.memberType ? (
              /* Legacy Member Profile Completion Required */
              <MemberProfileCompletionForm
                userEmail={dbUser.email}
                userName={dbUser.name}
                defaultPhone={dbUser.profile?.phone || ""}
                defaultStudentId={dbUser.profile?.studentId || ""}
                defaultInstitution={dbUser.profile?.institution || dbUser.profile?.schoolOrUniversity || ""}
                locale={locale}
              />
            ) : (
              /* Interactive Registration Form prefilled with member identity */
              <SummitRegistrationForm
                userEmail={dbUser.email}
                defaultName={dbUser.name}
                defaultPhone={dbUser.profile.phone || ""}
                studentId={dbUser.profile.studentId || ""}
                institution={dbUser.profile.institution || dbUser.profile.schoolOrUniversity || ""}
                memberType={dbUser.profile.memberType}
                locale={locale}
                dict={dict}
              />
            )}
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
