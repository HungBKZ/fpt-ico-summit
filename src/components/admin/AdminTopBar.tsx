"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface AdminTopBarProps {
  locale: Locale;
  dict: Dictionary;
  userName?: string;
  userEmail?: string;
  onToggleMobileDrawer: () => void;
}

export function AdminTopBar({
  locale,
  dict,
  userName = "Admin User",
  userEmail = "admin@fpticosummit.com",
  onToggleMobileDrawer,
}: AdminTopBarProps) {
  const pathname = usePathname();
  const t = dict.adminPortal;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Language switch path generator
  const getLanguagePath = (targetLocale: Locale) => {
    if (!pathname) return `/${targetLocale}/admin`;
    return pathname.replace(`/${locale}`, `/${targetLocale}`);
  };

  // Dynamic Page Title mapping based on route
  const getPageTitle = () => {
    if (pathname?.includes("/admin/partner-content")) return t.navPartnerContent;
    if (pathname?.includes("/admin/users")) return t.navUserManagement;
    return t.navOverview;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 z-10 shadow-xs">
      {/* Left: Mobile Drawer Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="md:hidden text-slate-600 hover:text-slate-900 p-1 rounded-lg border border-slate-200"
          aria-label="Open navigation drawer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {t.portalTitle}
          </p>
        </div>
      </div>

      {/* Right: Language Switcher & Admin Avatar Dropdown */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* EN | VI Language Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <Link
            href={getLanguagePath("en")}
            className={`px-2.5 py-1 rounded-md transition ${
              locale === "en"
                ? "bg-white text-[var(--color-navy)] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            EN
          </Link>
          <Link
            href={getLanguagePath("vi")}
            className={`px-2.5 py-1 rounded-md transition ${
              locale === "vi"
                ? "bg-white text-[var(--color-navy)] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            VI
          </Link>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition text-left border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-navy)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-slate-500 block">System Admin</span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-500 hidden sm:block"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href={`/${locale}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>{t.navViewSite}</span>
                </Link>

                <Link
                  href={`/${locale}/account/change-password`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>{t.navChangePassword}</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{t.navSignOut}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
