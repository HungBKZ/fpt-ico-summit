/**
 * src/lib/utils/sanitizer.ts
 *
 * Zero-dependency server-side HTML sanitizer for rich-text scholarship content.
 * Enforces a strict allowlist of formatting tags:
 * <p>, <strong>, <em>, <u>, <ul>, <ol>, <li>, <a href="...">, <h3>, <h4>, <br>
 *
 * Strips script, style, iframe, svg, math, meta, link, event handlers (on*), inline styles,
 * class, id, src, srcset, and non-http(s) links (javascript:, data:, file:, vbscript:).
 */

const ALLOWED_TAGS = new Set([
  "p",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "h3",
  "h4",
  "br",
]);

/**
 * Decodes numeric and basic HTML entities to uncover hidden/obfuscated schemes.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

/**
 * Basic HTML entity escaping for plain text strings.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes an HTML string server-side before persistence or rendering.
 * Converts plain text without HTML tags into paragraph-wrapped HTML.
 */
export function sanitizeHtml(input?: string | null): string {
  if (!input || !input.trim()) return "";

  const trimmed = input.trim();

  // If input contains no HTML tags, wrap plain lines in paragraph tags
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
      .split(/\n\s*\n/)
      .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  // Remove dangerous container elements completely (including internal content)
  let clean = trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");

  // Strip self-closing or metadata tags: meta, link, img, input, button
  clean = clean.replace(/<\/?(?:meta|link|img|input|button)\b[^>]*>/gi, "");

  let openLinkCount = 0;

  // Tokenize and filter all remaining HTML tags
  clean = clean.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(lowerTag)) {
      return ""; // Strip unallowed tag
    }

    const isClosing = match.startsWith("</");
    if (isClosing) {
      if (lowerTag === "b") return "</strong>";
      if (lowerTag === "i") return "</em>";
      if (lowerTag === "a") {
        if (openLinkCount > 0) {
          openLinkCount--;
          return "</a>";
        }
        return ""; // Strip orphaned </a>
      }
      return `</${lowerTag}>`;
    }

    let targetTag = lowerTag;
    if (targetTag === "b") targetTag = "strong";
    if (targetTag === "i") targetTag = "em";

    if (targetTag === "br") return "<br />";

    // Handle <a> links safely
    if (targetTag === "a") {
      const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawHref = hrefMatch ? hrefMatch[1] || hrefMatch[2] || hrefMatch[3] : "";

      // Decode entities and check for unsafe schemes
      const decodedHref = decodeHtmlEntities(rawHref).trim().toLowerCase();
      if (
        decodedHref.startsWith("javascript:") ||
        decodedHref.startsWith("data:") ||
        decodedHref.startsWith("file:") ||
        decodedHref.startsWith("vbscript:")
      ) {
        return ""; // Reject malicious link schemes
      }

      // Enforce http:// or https:// protocol
      if (rawHref && (decodedHref.startsWith("http://") || decodedHref.startsWith("https://"))) {
        openLinkCount++;
        const safeHref = escapeHtml(rawHref.trim());
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
      }
      return ""; // Strip link tag if URL protocol is invalid
    }

    // Strip ALL attributes (class, id, style, on*, etc.) for allowed non-link elements
    return `<${targetTag}>`;
  });

  return clean.trim();
}
