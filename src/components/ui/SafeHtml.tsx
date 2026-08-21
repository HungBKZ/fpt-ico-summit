"use client";

import { sanitizeHtml } from "@/lib/utils/sanitizer";

interface SafeHtmlProps {
  content?: string | null;
  className?: string;
  fallbackText?: string;
}

/**
 * Component that safely renders sanitized rich-text HTML content.
 * Falls back cleanly for empty content or legacy plain text strings.
 */
export function SafeHtml({ content, className = "", fallbackText }: SafeHtmlProps) {
  if (!content || !content.trim()) {
    if (fallbackText) {
      return <span className="text-slate-400 italic font-normal">{fallbackText}</span>;
    }
    return null;
  }

  const sanitized = sanitizeHtml(content);

  return (
    <div
      className={`prose prose-xs max-w-none text-slate-800 leading-relaxed font-normal [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:text-sm [&>h4]:font-bold [&>h4]:text-slate-900 [&>h4]:text-xs [&>a]:text-blue-600 [&>a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
