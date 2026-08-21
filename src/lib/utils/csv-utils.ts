/**
 * src/lib/utils/csv-utils.ts
 *
 * Utility functions for RFC 4180 CSV generation, formula injection protection,
 * and UTF-8 BOM encoding for Microsoft Excel compatibility.
 */

/**
 * Sanitizes a cell value against spreadsheet formula injection (CSV Injection / DDE attack).
 * Neutralizes strings starting with '=', '+', '-', or '@' even after leading whitespace.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  const trimmed = str.trimStart();

  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@")
  ) {
    // Prepend single quote to force spreadsheet software to treat as text
    return `'${str}`;
  }

  return str;
}

/**
 * Formats a single CSV row following RFC 4180 rules.
 * Escapes double quotes as "" and wraps cells containing commas, quotes, or newlines.
 */
export function formatCsvRow(cells: unknown[]): string {
  return cells
    .map((cell) => {
      const sanitized = sanitizeCsvCell(cell);
      if (
        sanitized.includes(",") ||
        sanitized.includes('"') ||
        sanitized.includes("\n") ||
        sanitized.includes("\r")
      ) {
        return `"${sanitized.replace(/"/g, '""')}"`;
      }
      return sanitized;
    })
    .join(",");
}

/**
 * Generates a full CSV string with UTF-8 BOM (\uFEFF) for Excel Vietnamese character support.
 */
export function generateCsvBuffer(headers: string[], rows: (unknown[])[]): Buffer {
  const headerLine = formatCsvRow(headers);
  const rowLines = rows.map((r) => formatCsvRow(r));
  const csvContent = [headerLine, ...rowLines].join("\r\n");

  // UTF-8 BOM prefix: 0xEF, 0xBB, 0xBF
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  const textBuffer = Buffer.from(csvContent, "utf-8");

  return Buffer.concat([bom, textBuffer]);
}
