"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface ClientAuthControlProps {
  locale: Locale;
  dict: Dictionary;
}

export function ClientAuthControl({ locale, dict }: ClientAuthControlProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  if (loading) {
    return (
      <span style={{ fontSize: "var(--text-xs)", opacity: 0.5 }}>...</span>
    );
  }

  if (!user) {
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

  const isAdmin = user.role === "ADMIN";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          background: "var(--color-navy)",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "var(--radius-full)",
          padding: "0.35rem 0.75rem",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <span>{user.name || user.email}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.35rem)",
            width: "180px",
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(11, 23, 54, 0.10)",
            padding: "0.35rem 0",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setDropdownOpen(false)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-navy)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {dict.nav.dashboard}
          </Link>

          {isAdmin && (
            <Link
              href={`/${locale}/admin/users`}
              onClick={() => setDropdownOpen(false)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "var(--text-xs)",
                color: "var(--color-navy)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {dict.nav.admin}
            </Link>
          )}

          <Link
            href={`/${locale}/account/change-password`}
            onClick={() => setDropdownOpen(false)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-navy)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {dict.nav.changePassword}
          </Link>

          <hr style={{ margin: "0.25rem 0", borderColor: "rgba(0,0,0,0.06)" }} />

          <a
            href={`/api/auth/signout`}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-orange)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {dict.nav.signOut}
          </a>
        </div>
      )}
    </div>
  );
}
