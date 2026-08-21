"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

interface StaffNavTabsProps {
  locale: Locale;
  dict: {
    overview: string;
    checkIn: string;
    booths: string;
    scheduling: string;
  };
}

export function StaffNavTabs({ locale, dict }: StaffNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}/staff`, label: dict.overview },
    { href: `/${locale}/staff/check-in`, label: dict.checkIn },
    { href: `/${locale}/staff/booths`, label: dict.booths },
    { href: `/${locale}/staff/scheduling`, label: dict.scheduling },
    { href: `/${locale}/staff/attendance`, label: locale === "vi" ? "Điểm danh Hoạt động" : "Activity Attendance" },
    { href: `/${locale}/staff/reports`, label: locale === "vi" ? "Báo cáo & Export" : "Reports & Exports" },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-xs font-semibold px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/${locale}/staff`
              ? pathname === `/${locale}/staff`
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
