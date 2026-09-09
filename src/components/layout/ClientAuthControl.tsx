"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
  partnerType?: string;
}

interface ClientAuthControlProps {
  locale: Locale;
  dict: Dictionary;
  hideCreateAccount?: boolean;
  mobileLayout?: boolean;
  onNavigate?: () => void;
}

export function ClientAuthControl({
  locale,
  dict,
  hideCreateAccount = false,
  mobileLayout = false,
  onNavigate,
}: ClientAuthControlProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const isAdmin = user?.role === "ADMIN";
  const isPartner = user?.role === "PARTNER";

  const getSubRoleLabel = () => {
    if (!user) return "";
    if (isAdmin) return "ADMINISTRATOR";
    if (isPartner) {
      const typeStr = user.partnerType ? user.partnerType.toUpperCase() : "INSTITUTION";
      return `PARTNER · ${typeStr}`;
    }
    if (user.role === "SUMMIT_STAFF") return "SUMMIT STAFF";
    return "SUMMIT MEMBER";
  };

  // Mobile layout rendering
  if (mobileLayout) {
    if (loading) {
      return <div className="py-2 text-center text-xs text-slate-400">...</div>;
    }

    if (!user) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
          <Link
            href={`/${locale}/login`}
            onClick={onNavigate}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "0.625rem 1rem",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-navy)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--color-border-strong)",
              backgroundColor: "#FFFFFF",
              transition: "background-color 150ms ease",
            }}
          >
            {dict.nav.signIn}
          </Link>
          <Link
            href={`/${locale}/register`}
            onClick={onNavigate}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "0.625rem 1rem",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-navy)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid rgba(26, 94, 168, 0.25)",
              backgroundColor: "rgba(26, 94, 168, 0.05)",
              transition: "background-color 150ms ease",
            }}
          >
            {dict.nav.createAccount}
          </Link>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-navy)" }} className="truncate">
            {user.name || user.email}
          </span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-blue)", textTransform: "uppercase" }}>
            {getSubRoleLabel()}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.35rem" }}>
          <Link
            href={`/${locale}/dashboard`}
            onClick={onNavigate}
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              padding: "0.45rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-navy)",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            {dict.nav.dashboard}
          </Link>
          {isPartner && (
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <Link
                href={`/${locale}/dashboard/organization`}
                onClick={onNavigate}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "0.35rem 0.4rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(26, 94, 168, 0.08)",
                  color: "var(--color-blue)",
                  textDecoration: "none",
                }}
              >
                {dict.nav?.orgProfile || "Org"}
              </Link>
              <Link
                href={`/${locale}/dashboard/scholarships`}
                onClick={onNavigate}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "0.35rem 0.4rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(26, 94, 168, 0.08)",
                  color: "var(--color-blue)",
                  textDecoration: "none",
                }}
              >
                {dict.nav?.scholarshipOpportunities || "Scholarships"}
              </Link>
            </div>
          )}
          {isAdmin && (
            <Link
              href={`/${locale}/admin/users`}
              onClick={onNavigate}
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                padding: "0.35rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(11, 23, 54, 0.08)",
                color: "var(--color-navy)",
                textDecoration: "none",
              }}
            >
              {dict.nav.admin}
            </Link>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem", paddingTop: "0.35rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <Link
              href={`/${locale}/account/change-password`}
              onClick={onNavigate}
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
              }}
            >
              {dict.nav.changePassword}
            </Link>
            <a
              href="/api/auth/signout"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#e11d48",
                textDecoration: "none",
              }}
            >
              {dict.nav.signOut}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout rendering
  if (loading) {
    return <span style={{ fontSize: "var(--text-xs)", opacity: 0.5 }}>...</span>;
  }

  if (!user) {
    if (hideCreateAccount) {
      return (
        <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <Link
            href={`/${locale}/login`}
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              padding: "0.35rem 0.55rem",
              borderRadius: "var(--radius-sm)",
              transition: "color 150ms ease, background-color 150ms ease",
            }}
          >
            {dict.nav.signIn}
          </Link>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
        <Link
          href={`/${locale}/login`}
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            padding: "0.35rem 0.55rem",
            borderRadius: "var(--radius-sm)",
            transition: "color 150ms ease, background-color 150ms ease",
          }}
        >
          {dict.nav.signIn}
        </Link>
        <Link
          href={`/${locale}/register`}
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-navy)",
            textDecoration: "none",
            padding: "0.4rem 0.85rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(26, 94, 168, 0.22)",
            backgroundColor: "rgba(26, 94, 168, 0.04)",
            transition: "background-color 150ms ease, border-color 150ms ease",
          }}
        >
          {dict.nav.createAccount}
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "var(--color-navy)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "var(--radius-full)",
          padding: "0.35rem 0.85rem",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <span className="max-w-[130px] sm:max-w-[180px] md:max-w-[220px] truncate block text-left">
          {user.name || user.email}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.35rem)",
            width: "220px",
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(11, 23, 54, 0.10)",
            padding: "0.5rem 0",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header Info inside Dropdown */}
          <div className="px-4 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.name || user.email}
            </p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
              {getSubRoleLabel()}
            </p>
          </div>

          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setDropdownOpen(false)}
            className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            {dict.nav.dashboard}
          </Link>

          {isPartner && (
            <>
              <Link
                href={`/${locale}/dashboard/organization`}
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                {dict.nav?.orgProfile || "Organization Profile"}
              </Link>
              <Link
                href={`/${locale}/dashboard/scholarships`}
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                {dict.nav?.scholarshipOpportunities || "Scholarship Opportunities"}
              </Link>
              <Link
                href={`/${locale}/dashboard/activities`}
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
              >
                {dict.nav?.summitActivities || "Summit Activities"}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href={`/${locale}/admin/users`}
              onClick={() => setDropdownOpen(false)}
              className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
            >
              {dict.nav.admin}
            </Link>
          )}

          <Link
            href={`/${locale}/account/change-password`}
            onClick={() => setDropdownOpen(false)}
            className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            {dict.nav.changePassword}
          </Link>

          <hr style={{ margin: "0.35rem 0", borderColor: "rgba(0,0,0,0.06)" }} />

          <a
            href={`/api/auth/signout`}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
          >
            {dict.nav.signOut}
          </a>
        </div>
      )}
    </div>
  );
}
