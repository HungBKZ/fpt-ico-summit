"use client";

import { signOut } from "next-auth/react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { StaffNavTabs } from "@/components/staff/StaffNavTabs";

interface StaffShellProps {
  userName: string;
  userEmail: string;
  userRole: string;
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}

export function StaffShell({
  userName,
  userEmail,
  userRole,
  locale,
  dict,
  children,
}: StaffShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Staff Operational Top Navbar */}
      <header className="bg-[var(--color-navy)] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-orange)] text-white font-bold flex items-center justify-center text-xs">
              ICO
            </div>
            <div>
              <span className="font-bold text-sm block leading-none text-white">
                Summit Operations
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                FPT ICO Summit 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-white leading-none">{userName}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{userEmail}</span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-400/30">
              {userRole}
            </span>

            <LanguageSwitcher currentLocale={locale} ariaLabel={dict.nav.switchLanguage} />

            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition"
            >
              {dict.nav.signOut}
            </button>
          </div>
        </div>
      </header>

      {/* Staff Operational Nav Tabs */}
      <StaffNavTabs
        locale={locale}
        dict={{
          overview: dict.staffDashboard?.title || "Overview",
          checkIn: dict.staffDashboard?.checkInModule || "Check-in",
          booths: dict.staffDashboard?.boothModule || "Booth Management",
          scheduling: dict.staffDashboard?.schedulingModule || "Activity Scheduling",
        }}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-4 border-t border-slate-800 text-center">
        FPT ICO Summit 2026 Operations Portal — FPT University Can Tho Campus.
      </footer>
    </div>
  );
}
