"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

interface AdminShellProps {
  locale: Locale;
  dict: Dictionary;
  pendingCount: number;
  pendingScholarshipCount?: number;
  pendingActivityCount?: number;
  userName?: string;
  userEmail?: string;
  children: React.ReactNode;
}

export function AdminShell({
  locale,
  dict,
  pendingCount,
  pendingScholarshipCount,
  pendingActivityCount,
  userName,
  userEmail,
  children,
}: AdminShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 z-30">
        <AdminSidebar
          locale={locale}
          dict={dict}
          pendingCount={pendingCount}
          pendingScholarshipCount={pendingScholarshipCount}
          pendingActivityCount={pendingActivityCount}
        />
      </div>

      {/* Mobile Drawer Backdrop & Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-[var(--color-navy)] h-full shadow-2xl z-10">
            <AdminSidebar
              locale={locale}
              dict={dict}
              pendingCount={pendingCount}
              pendingScholarshipCount={pendingScholarshipCount}
              pendingActivityCount={pendingActivityCount}
              onCloseMobile={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Right Area: TopBar + Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminTopBar
          locale={locale}
          dict={dict}
          userName={userName}
          userEmail={userEmail}
          onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        />

        <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
