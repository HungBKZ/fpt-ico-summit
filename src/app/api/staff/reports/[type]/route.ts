import { requireSummitOperationsAccess } from "@/lib/auth/authorization";
import { getActiveSummitEdition } from "@/lib/db/repositories/summit-editions";
import { createAuditEntry } from "@/lib/db/repositories/audit-logs";
import { generateCsvBuffer } from "@/lib/utils/csv-utils";
import { generateXlsxBuffer } from "@/lib/utils/xlsx-utils";
import {
  REPORT_TYPES_ALLOWLIST,
  type SummitReportType,
  getRegistrationExportRows,
  getCheckInExportRows,
  getActivitySelectionExportRows,
  getActivityAttendanceExportRows,
  getActivityScheduleExportRows,
  getBoothExportRows,
  getPartnerSummaryExportRows,
  getScholarshipExportRows,
  getIcsReferenceExportRows,
} from "@/lib/db/repositories/summit-reports";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { dbUser } = await requireSummitOperationsAccess();

    const { type: rawType } = await params;
    const reportType = rawType.toUpperCase() as SummitReportType;

    // 1. Validate report type allowlist
    if (!REPORT_TYPES_ALLOWLIST.includes(reportType)) {
      return new Response(JSON.stringify({ error: "Invalid report type." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Validate format allowlist
    const url = new URL(request.url);
    const format = (url.searchParams.get("format") || "xlsx").toLowerCase();
    if (format !== "csv" && format !== "xlsx") {
      return new Response(JSON.stringify({ error: "Invalid format parameter. Supported: csv, xlsx" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Fetch active SummitEdition
    const activeEdition = await getActiveSummitEdition();
    if (!activeEdition || !activeEdition._id) {
      return new Response(JSON.stringify({ error: "No ACTIVE Summit edition found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const editionId = activeEdition._id;
    const editionYear = activeEdition.year || 2026;

    let headers: string[] = [];
    let rows: (unknown[])[] = [];
    let filenameSlug = "report";
    let sheetTitle = "Report";

    // 4. Dispatch to generator function based on validated reportType
    switch (reportType) {
      case "REGISTRATIONS":
        filenameSlug = "registrations";
        sheetTitle = "Registrations";
        ({ headers, rows } = await getRegistrationExportRows(editionId));
        break;

      case "CHECK_INS":
        filenameSlug = "checkins";
        sheetTitle = "Daily Check-ins";
        ({ headers, rows } = await getCheckInExportRows(editionId));
        break;

      case "ACTIVITY_SELECTIONS":
        filenameSlug = "activity-selections";
        sheetTitle = "Activity Selections";
        ({ headers, rows } = await getActivitySelectionExportRows(editionId));
        break;

      case "ACTIVITY_ATTENDANCE":
        filenameSlug = "activity-attendance";
        sheetTitle = "Activity Attendance";
        ({ headers, rows } = await getActivityAttendanceExportRows(editionId));
        break;

      case "ACTIVITY_SCHEDULE":
        filenameSlug = "activity-schedule";
        sheetTitle = "Activity Schedule";
        ({ headers, rows } = await getActivityScheduleExportRows(editionId));
        break;

      case "BOOTH_ASSIGNMENTS":
        filenameSlug = "booth-assignments";
        sheetTitle = "Booth Assignments";
        ({ headers, rows } = await getBoothExportRows(editionId));
        break;

      case "PARTNER_SUMMARY":
        filenameSlug = "partner-summary";
        sheetTitle = "Partner Summary";
        ({ headers, rows } = await getPartnerSummaryExportRows(editionId));
        break;

      case "SCHOLARSHIPS":
        filenameSlug = "published-scholarships";
        sheetTitle = "Published Scholarships";
        ({ headers, rows } = await getScholarshipExportRows(editionId));
        break;

      case "ICS_REFERENCE":
        filenameSlug = "ics-reference";
        sheetTitle = "Reference ICS (FPT Students)";
        ({ headers, rows } = await getIcsReferenceExportRows(editionId));
        break;
    }

    // 5. Write audit entry
    await createAuditEntry({
      action: "SUMMIT_REPORT_EXPORTED",
      actorUserId: dbUser._id,
      metadata: {
        reportType,
        editionId: editionId.toString(),
        format,
      },
    });

    // 6. Build response buffer & headers based on format
    if (format === "xlsx") {
      const xlsxBuffer = await generateXlsxBuffer(sheetTitle, headers, rows);
      const filename = `fpt-ico-summit-${editionYear}-${filenameSlug}.xlsx`;

      return new Response(new Uint8Array(xlsxBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    } else {
      const csvBuffer = generateCsvBuffer(headers, rows);
      const filename = `fpt-ico-summit-${editionYear}-${filenameSlug}.csv`;

      return new Response(new Uint8Array(csvBuffer), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unauthorized or server error.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
