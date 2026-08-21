"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import {
  ScholarshipDetailView,
  type PublicScholarshipDetail,
} from "./ScholarshipDetailView";

interface ScholarshipDetailModalProps {
  scholarship: PublicScholarshipDetail | null;
  locale: Locale;
  onClose: () => void;
}

/**
 * Accessible Modal wrapper for Public Scholarship Details.
 * Enforces focus placement, focus trap, focus restoration, Escape closing, and body scroll locking.
 */
export function ScholarshipDetailModal({
  scholarship,
  locale,
  onClose,
}: ScholarshipDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!scholarship) return;

    // Capture originating active element to restore focus on close
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Prevent body background scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus dialog container
    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    // Keyboard listener for Escape & Focus Trap (Tab / Shift+Tab)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      // Restore focus to originating element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [scholarship, onClose]);

  if (!scholarship) return null;

  const closeLabel = locale === "vi" ? "Đóng cửa sổ chi tiết" : "Close scholarship details";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scholarship-detail-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white w-full max-w-3xl rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] overflow-y-auto outline-none"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute top-4 right-4 md:top-5 md:right-5 z-20 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center font-bold text-sm transition focus:ring-2 focus:ring-blue-500 outline-none"
        >
          ✕
        </button>

        <ScholarshipDetailView scholarship={scholarship} locale={locale} />
      </div>
    </div>
  );
}
