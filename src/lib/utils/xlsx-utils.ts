/**
 * src/lib/utils/xlsx-utils.ts
 *
 * Server-side native Excel (.xlsx) generator using ExcelJS.
 * Implements administrative formatting, frozen header rows, auto-filters,
 * text-wrapping, column auto-width calculation, formula-injection security,
 * and text-type forcing for phone numbers and student IDs (MSSV).
 */

import ExcelJS from "exceljs";
import { sanitizeCsvCell } from "@/lib/utils/csv-utils";

/**
 * Columns that must be forced to Excel TEXT format to preserve leading zeros
 * and prevent scientific notation conversion.
 */
const FORCE_TEXT_HEADER_PATTERNS = [
  "phone",
  "sđt",
  "mssv",
  "student id",
  "email",
  "code",
  "day",
  "date",
  "venue",
];

function isForceTextColumn(headerName: string): boolean {
  const lower = headerName.toLowerCase();
  return FORCE_TEXT_HEADER_PATTERNS.some((p) => lower.includes(p));
}

export async function generateXlsxBuffer(
  sheetName: string,
  headers: string[],
  rows: (unknown[])[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FPT ICO Summit Platform";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Freeze top header row
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // 2. Add Header Row
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Segoe UI" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // Slate-800 dark administrative header
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  // 3. Add Auto-Filter across all columns
  if (headers.length > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };
  }

  // Determine force-text status per column index
  const forceTextCols = headers.map((h) => isForceTextColumn(h));

  // 4. Add Data Rows with Formatting & Security
  for (const rowData of rows) {
    const dataRow = worksheet.addRow(rowData);
    dataRow.height = 22;

    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const colIdx = colNumber - 1;
      const rawValue = rowData[colIdx];
      const isTextCol = forceTextCols[colIdx];

      // Base alignment & font
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.font = { size: 10, name: "Segoe UI" };

      if (rawValue === null || rawValue === undefined) {
        cell.value = "";
        return;
      }

      // Handle numbers vs text
      if (typeof rawValue === "number") {
        cell.value = rawValue;
        return;
      }

      const strVal = String(rawValue);
      // Neutralize formula injection
      const safeVal = sanitizeCsvCell(strVal);

      if (isTextCol || typeof rawValue === "string") {
        // Force string type and explicit text format string in Excel
        cell.value = safeVal;
        cell.numFmt = "@";
      } else {
        cell.value = safeVal;
      }
    });
  }

  // 5. Auto-calculate Column Widths
  worksheet.columns.forEach((column, colIdx) => {
    let maxLen = headers[colIdx] ? headers[colIdx].length : 12;

    rows.forEach((r) => {
      const cellVal = r[colIdx];
      if (cellVal !== null && cellVal !== undefined) {
        const len = String(cellVal).length;
        if (len > maxLen) maxLen = len;
      }
    });

    // Clamp width between 14 and 50
    column.width = Math.min(Math.max(maxLen + 4, 14), 50);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
