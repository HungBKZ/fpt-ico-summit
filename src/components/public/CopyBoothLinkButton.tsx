"use client";

import { useState } from "react";

interface CopyBoothLinkButtonProps {
  label: string;
  copiedLabel: string;
  url?: string;
  className?: string;
}

export function CopyBoothLinkButton({
  label,
  copiedLabel,
  url,
  className,
}: CopyBoothLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        const textToCopy = url || window.location.href;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Graceful fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
      }
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={copied ? "text-emerald-400" : "text-[#d9a24b]"}
      >
        {copied ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
