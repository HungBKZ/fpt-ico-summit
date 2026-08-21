/**
 * src/lib/db/repositories/summit-reports.ts
 *
 * Repository for Phase 5F Operational Reporting & CSV Export generation.
 * All queries are strictly read-only and scoped to the specified SummitEdition.
 * Uses bulk queries and in-memory maps to prevent N+1 queries.
 */

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import type { SummitRegistration } from "@/lib/db/models/summit-registration";
import type { SummitCheckIn } from "@/lib/db/models/summit-check-in";
import type { SummitActivity } from "@/lib/db/models/summit-activity";
import type { SummitActivitySelection } from "@/lib/db/models/summit-activity-selection";
import type { SummitActivityAttendance } from "@/lib/db/models/summit-activity-attendance";
import type { Organization } from "@/lib/db/models/organization";
import type { OrganizationParticipation } from "@/lib/db/models/organization-participation";
import type { SummitBoothAssignment } from "@/lib/db/models/summit-booth-assignment";
import type { Scholarship } from "@/lib/db/models/scholarship";
import { DEFAULT_ICS_RULE } from "@/lib/config/ics-rules";
import { getTrackById } from "@/lib/config/workshop-tracks";
import { getPerformanceScopeById } from "@/lib/config/performance-scopes";

export type SummitReportType =
  | "REGISTRATIONS"
  | "CHECK_INS"
  | "ACTIVITY_SELECTIONS"
  | "ACTIVITY_ATTENDANCE"
  | "ACTIVITY_SCHEDULE"
  | "BOOTH_ASSIGNMENTS"
  | "PARTNER_SUMMARY"
  | "SCHOLARSHIPS"
  | "ICS_REFERENCE";

export const REPORT_TYPES_ALLOWLIST: SummitReportType[] = [
  "REGISTRATIONS",
  "CHECK_INS",
  "ACTIVITY_SELECTIONS",
  "ACTIVITY_ATTENDANCE",
  "ACTIVITY_SCHEDULE",
  "BOOTH_ASSIGNMENTS",
  "PARTNER_SUMMARY",
  "SCHOLARSHIPS",
  "ICS_REFERENCE",
];

export interface SummitReportOverview {
  totalRegistered: number;
  fptStudentsRegistered: number;
  externalRegistered: number;

  totalCheckInRecords: number;
  uniqueParticipantsCheckedIn: number;
  fptCheckedInUnique: number;
  externalCheckedInUnique: number;

  publishedWorkshops: number;
  publishedPerformances: number;
  totalSelections: number;

  totalAttendanceRecords: number;
  selectedPresent: number;
  recordedWalkIns: number;

  confirmedPartners: number;
  boothsPublished: number;
  activitiesApproved: number;
  scholarshipsPublished: number;
}

/**
 * Resolves human-readable Workshop Topic Title for operational reports.
 * 1. Custom topic title (from acceptedTopicSnapshot or customTopicTitle).
 * 2. Suggested topic title (lookup via trackId + topicId in WORKSHOP_TRACKS).
 * 3. Tentative title fallback from acceptedTopicSnapshot if set.
 */
export function resolveReportTopicTitle(act?: SummitActivity): string {
  if (!act || act.type !== "WORKSHOP") return "";
  const acc = act.acceptedTopicSnapshot;

  // 1. Custom Topic Title
  const customTitle = acc?.customTopicTitle || act.customTopicTitle;
  if (customTitle && customTitle.trim() !== "") {
    return customTitle.trim();
  }

  // 2. Suggested Topic Title lookup via WORKSHOP_TRACKS
  const trackId = acc?.trackId || act.trackId;
  const topicId = acc?.topicId || act.topicId;

  if (trackId && topicId) {
    const trackDef = getTrackById(trackId);
    if (trackDef) {
      const topicDef = trackDef.suggestedTopics.find((t) => t.id === topicId);
      if (topicDef) {
        return topicDef.title.en;
      }
    }
  }

  // 3. Fallback to tentativeTitle from acceptedTopicSnapshot if available
  if (acc?.tentativeTitle?.en) {
    return acc.tentativeTitle.en;
  }

  return "";
}

/**
 * Resolves human-readable Workshop Track Name for operational reports.
 */
export function resolveReportTrackName(act?: SummitActivity): string {
  if (!act || act.type !== "WORKSHOP") return "";
  const trackId = act.acceptedTopicSnapshot?.trackId || act.trackId;
  if (!trackId) return "";
  const trackDef = getTrackById(trackId);
  return trackDef ? trackDef.name.en : "";
}

/**
 * Resolves human-readable Performance Scope Name for operational reports.
 */
export function resolveReportPerformanceScopeName(act?: SummitActivity): string {
  if (!act || act.type !== "STAGE_PERFORMANCE") return "";
  if (!act.performanceScopeId) return "";
  const scopeDef = getPerformanceScopeById(act.performanceScopeId);
  return scopeDef ? scopeDef.name.en : "";
}

/**
 * Calculates operational summary overview metrics for active edition.
 */
export async function getSummitReportOverview(
  editionId: ObjectId
): Promise<SummitReportOverview> {
  const db = await getDb();

  const [
    registrations,
    checkIns,
    activities,
    selections,
    attendances,
    participations,
    booths,
    scholarships,
  ] = await Promise.all([
    db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .find({ editionId, status: "REGISTERED" })
      .toArray(),
    db
      .collection<SummitCheckIn>(COLLECTIONS.SUMMIT_CHECK_INS)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitActivityAttendance>(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES)
      .find({ editionId })
      .toArray(),
    db
      .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
      .find({ editionId, status: "CONFIRMED" })
      .toArray(),
    db
      .collection<SummitBoothAssignment>(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS)
      .find({ editionId, isPublished: true })
      .toArray(),
    db
      .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
      .find({ isPublished: true })
      .toArray(),
  ]);

  // Registrations breakdown
  const totalRegistered = registrations.length;
  let fptStudentsRegistered = 0;
  let externalRegistered = 0;
  const regMap = new Map<string, SummitRegistration>();

  for (const reg of registrations) {
    if (reg._id) regMap.set(reg._id.toString(), reg);
    if (reg.participantType === "FPT_STUDENT") fptStudentsRegistered++;
    else if (reg.participantType === "EXTERNAL_PARTICIPANT") externalRegistered++;
  }

  // Check-ins breakdown
  const totalCheckInRecords = checkIns.length;
  const uniqueCheckedInSet = new Set<string>();
  let fptCheckedInUnique = 0;
  let externalCheckedInUnique = 0;

  for (const ci of checkIns) {
    const rIdStr = ci.registrationId.toString();
    if (!uniqueCheckedInSet.has(rIdStr)) {
      uniqueCheckedInSet.add(rIdStr);
      const reg = regMap.get(rIdStr);
      if (reg?.participantType === "FPT_STUDENT") fptCheckedInUnique++;
      else if (reg?.participantType === "EXTERNAL_PARTICIPANT") externalCheckedInUnique++;
    }
  }

  // Activities breakdown
  let publishedWorkshops = 0;
  let publishedPerformances = 0;
  let activitiesApproved = 0;

  for (const act of activities) {
    if (act.isContentApproved) {
      activitiesApproved++;
      if (act.publishedSchedule) {
        if (act.type === "WORKSHOP") publishedWorkshops++;
        else if (act.type === "STAGE_PERFORMANCE") publishedPerformances++;
      }
    }
  }

  // Attendance breakdown
  const totalAttendanceRecords = attendances.length;
  const selectedSet = new Set<string>(
    selections.map((s) => `${s.registrationId.toString()}_${s.activityId.toString()}`)
  );

  let selectedPresent = 0;
  let recordedWalkIns = 0;

  for (const att of attendances) {
    if (att.source === "WALK_IN") recordedWalkIns++;
    const key = `${att.registrationId.toString()}_${att.activityId.toString()}`;
    if (selectedSet.has(key)) selectedPresent++;
  }

  // Confirmed partners & scholarships scoping
  const confirmedOrgIds = new Set<string>(
    participations.map((p) => p.organizationId.toString())
  );

  let scholarshipsPublished = 0;
  for (const s of scholarships) {
    if (confirmedOrgIds.has(s.organizationId.toString())) {
      scholarshipsPublished++;
    }
  }

  return {
    totalRegistered,
    fptStudentsRegistered,
    externalRegistered,
    totalCheckInRecords,
    uniqueParticipantsCheckedIn: uniqueCheckedInSet.size,
    fptCheckedInUnique,
    externalCheckedInUnique,
    publishedWorkshops,
    publishedPerformances,
    totalSelections: selections.length,
    totalAttendanceRecords,
    selectedPresent,
    recordedWalkIns,
    confirmedPartners: participations.length,
    boothsPublished: booths.length,
    activitiesApproved,
    scholarshipsPublished,
  };
}

/**
 * 1. Registrations Export Rows
 */
export async function getRegistrationExportRows(editionId: ObjectId) {
  const db = await getDb();
  const registrations = await db
    .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
    .find({ editionId, status: "REGISTERED" })
    .sort({ createdAt: -1 })
    .toArray();

  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Participant Type",
    "Student ID / MSSV",
    "Institution",
    "Registration Status",
    "Registered At",
  ];

  const rows = registrations.map((r) => [
    r.attendeeSnapshot.fullName,
    r.attendeeSnapshot.email,
    r.attendeeSnapshot.phone,
    r.participantType === "FPT_STUDENT" ? "FPT Can Tho Student" : "External Participant",
    r.attendeeSnapshot.studentId || "",
    r.participantType === "FPT_STUDENT" ? "FPT University Can Tho" : "External Institution",
    r.status,
    new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19),
  ]);

  return { headers, rows };
}

/**
 * 2. Daily Check-ins Export Rows
 */
export async function getCheckInExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [checkIns, registrations, users] = await Promise.all([
    db
      .collection<SummitCheckIn>(COLLECTIONS.SUMMIT_CHECK_INS)
      .find({ editionId })
      .sort({ checkedInAt: -1 })
      .toArray(),
    db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .find({ editionId })
      .toArray(),
    db.collection(COLLECTIONS.USERS).find({}).toArray(),
  ]);

  const regMap = new Map<string, SummitRegistration>();
  for (const r of registrations) if (r._id) regMap.set(r._id.toString(), r);

  const userMap = new Map<string, string>();
  for (const u of users) if (u._id) userMap.set(u._id.toString(), u.fullName || u.email || "Staff");

  const headers = [
    "Summit Day",
    "Full Name",
    "Participant Type",
    "Student ID / MSSV",
    "Phone",
    "Email",
    "Checked In At",
    "Checked In By",
    "Check-in Method",
  ];

  const rows = checkIns.map((ci) => {
    const reg = regMap.get(ci.registrationId.toString());
    const staffName = userMap.get(ci.checkedInBy.toString()) || "Staff";

    return [
      ci.dayKey,
      reg?.attendeeSnapshot.fullName || "Participant",
      reg?.participantType === "FPT_STUDENT" ? "FPT Can Tho Student" : "External Participant",
      reg?.attendeeSnapshot.studentId || "",
      reg?.attendeeSnapshot.phone || "",
      reg?.attendeeSnapshot.email || "",
      new Date(ci.checkedInAt).toISOString().replace("T", " ").slice(0, 19),
      staffName,
      ci.method || "MANUAL",
    ];
  });

  return { headers, rows };
}

/**
 * 3. Activity Selections Export Rows (Driven by summitActivitySelections)
 */
export async function getActivitySelectionExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [selections, activities, registrations, organizations] = await Promise.all([
    db
      .collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS)
      .find({ editionId })
      .sort({ selectedAt: -1 })
      .toArray(),
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .find({ editionId })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
  ]);

  const actMap = new Map<string, SummitActivity>();
  for (const a of activities) if (a._id) actMap.set(a._id.toString(), a);

  const regMap = new Map<string, SummitRegistration>();
  for (const r of registrations) if (r._id) regMap.set(r._id.toString(), r);

  const orgMap = new Map<string, string>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o.name);

  const headers = [
    "Activity Type",
    "Activity Title",
    "Workshop Track",
    "Workshop Topic",
    "Performance Scope",
    "Partner Organization",
    "Published Date",
    "Published Start Time",
    "Published End Time",
    "Published Venue",
    "Participant Name",
    "Participant Type",
    "Student ID / MSSV",
    "Phone",
    "Email",
    "Selected At",
  ];

  const rows = selections.map((sel) => {
    const act = actMap.get(sel.activityId.toString());
    const reg = regMap.get(sel.registrationId.toString());
    const orgName = act ? orgMap.get(act.organizationId.toString()) || "" : "";

    const title = act?.approvedSnapshot
      ? act.approvedSnapshot.title.en || act.approvedSnapshot.title.vi || "Activity"
      : "Activity Details Unavailable";

    const sched = act?.publishedSchedule;

    return [
      act?.type || "WORKSHOP",
      title,
      resolveReportTrackName(act),
      resolveReportTopicTitle(act),
      resolveReportPerformanceScopeName(act),
      orgName,
      sched?.dateKey || "Unavailable",
      sched?.startTime || "",
      sched?.endTime || "",
      sched?.venue || "",
      reg?.attendeeSnapshot.fullName || "Participant",
      reg?.participantType === "FPT_STUDENT" ? "FPT Can Tho Student" : "External Participant",
      reg?.attendeeSnapshot.studentId || "",
      reg?.attendeeSnapshot.phone || "",
      reg?.attendeeSnapshot.email || "",
      new Date(sel.selectedAt).toISOString().replace("T", " ").slice(0, 19),
    ];
  });

  return { headers, rows };
}

/**
 * 4. Activity Attendance Export Rows (Driven by summitActivityAttendances)
 */
export async function getActivityAttendanceExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [attendances, activities, registrations, organizations, users] = await Promise.all([
    db
      .collection<SummitActivityAttendance>(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES)
      .find({ editionId })
      .sort({ attendedAt: -1 })
      .toArray(),
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .find({ editionId })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
    db.collection(COLLECTIONS.USERS).find({}).toArray(),
  ]);

  const actMap = new Map<string, SummitActivity>();
  for (const a of activities) if (a._id) actMap.set(a._id.toString(), a);

  const regMap = new Map<string, SummitRegistration>();
  for (const r of registrations) if (r._id) regMap.set(r._id.toString(), r);

  const orgMap = new Map<string, string>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o.name);

  const userMap = new Map<string, string>();
  for (const u of users) if (u._id) userMap.set(u._id.toString(), u.fullName || u.email || "Staff");

  const headers = [
    "Activity Type",
    "Activity Title",
    "Workshop Track",
    "Workshop Topic",
    "Performance Scope",
    "Partner Organization",
    "Attendance Activity Day",
    "Current Published Date",
    "Published Start Time",
    "Published End Time",
    "Venue",
    "Participant Name",
    "Participant Type",
    "Student ID / MSSV",
    "Phone",
    "Email",
    "Attendance Source",
    "Attended At",
    "Marked By",
  ];

  const rows = attendances.map((att) => {
    const act = actMap.get(att.activityId.toString());
    const reg = regMap.get(att.registrationId.toString());
    const orgName = act ? orgMap.get(act.organizationId.toString()) || "" : "";
    const staffName = userMap.get(att.markedBy.toString()) || "Staff";

    const title = act?.approvedSnapshot
      ? act.approvedSnapshot.title.en || act.approvedSnapshot.title.vi || "Activity"
      : "Activity Details Unavailable";

    const sched = act?.publishedSchedule;

    return [
      act?.type || "WORKSHOP",
      title,
      resolveReportTrackName(act),
      resolveReportTopicTitle(act),
      resolveReportPerformanceScopeName(act),
      orgName,
      att.activityDayKey,
      sched?.dateKey || "Unavailable",
      sched?.startTime || "",
      sched?.endTime || "",
      sched?.venue || "",
      reg?.attendeeSnapshot.fullName || "Participant",
      reg?.participantType === "FPT_STUDENT" ? "FPT Can Tho Student" : "External Participant",
      reg?.attendeeSnapshot.studentId || "",
      reg?.attendeeSnapshot.phone || "",
      reg?.attendeeSnapshot.email || "",
      att.source,
      new Date(att.attendedAt).toISOString().replace("T", " ").slice(0, 19),
      staffName,
    ];
  });

  return { headers, rows };
}

/**
 * 5. Activity Schedule Export Rows
 */
export async function getActivityScheduleExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [activities, selections, attendances, organizations] = await Promise.all([
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId, isContentApproved: true })
      .toArray(),
    db
      .collection<SummitActivitySelection>(COLLECTIONS.SUMMIT_ACTIVITY_SELECTIONS)
      .find({ editionId })
      .toArray(),
    db
      .collection<SummitActivityAttendance>(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES)
      .find({ editionId })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
  ]);

  const orgMap = new Map<string, string>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o.name);

  // Group counts per activityId
  const selCounts = new Map<string, number>();
  for (const s of selections) {
    const key = s.activityId.toString();
    selCounts.set(key, (selCounts.get(key) || 0) + 1);
  }

  const attCounts = new Map<string, number>();
  const walkInCounts = new Map<string, number>();
  for (const a of attendances) {
    const key = a.activityId.toString();
    attCounts.set(key, (attCounts.get(key) || 0) + 1);
    if (a.source === "WALK_IN") {
      walkInCounts.set(key, (walkInCounts.get(key) || 0) + 1);
    }
  }

  const publishedActivities = activities.filter((a) => a.publishedSchedule);

  const headers = [
    "Activity Type",
    "Title",
    "Workshop Track",
    "Workshop Topic",
    "Performance Scope",
    "Partner Organization",
    "Date",
    "Start Time",
    "End Time",
    "Venue",
    "Duration Requested (mins)",
    "Selected Count",
    "Total Present",
    "Recorded Walk-ins",
  ];

  const rows = publishedActivities.map((act) => {
    const actIdStr = act._id!.toString();
    const snap = act.approvedSnapshot!;
    const sched = act.publishedSchedule!;
    const orgName = orgMap.get(act.organizationId.toString()) || "";

    return [
      act.type,
      snap.title.en || snap.title.vi || "Activity",
      resolveReportTrackName(act),
      resolveReportTopicTitle(act),
      resolveReportPerformanceScopeName(act),
      orgName,
      sched.dateKey,
      sched.startTime,
      sched.endTime,
      sched.venue,
      snap.durationMinutes,
      selCounts.get(actIdStr) || 0,
      attCounts.get(actIdStr) || 0,
      walkInCounts.get(actIdStr) || 0,
    ];
  });

  return { headers, rows };
}

/**
 * 6. Booth Assignments Export Rows (publishedAssignment ONLY)
 */
export async function getBoothExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [booths, organizations] = await Promise.all([
    db
      .collection<SummitBoothAssignment>(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS)
      .find({ editionId, isPublished: true })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
  ]);

  const orgMap = new Map<string, Organization>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o);

  const headers = [
    "Partner Organization",
    "Country",
    "Organization Type",
    "Booth Label",
    "Location",
    "Partner Note",
    "Published At",
  ];

  const rows = booths.map((b) => {
    const org = orgMap.get(b.organizationId.toString());
    const pub = b.publishedAssignment!;

    return [
      org?.name || "Partner",
      org?.country || "",
      org?.type || "",
      pub.boothLabel || "",
      pub.locationText || "",
      pub.note || "",
      b.publishedAt ? new Date(b.publishedAt).toISOString().replace("T", " ").slice(0, 19) : "",
    ];
  });

  return { headers, rows };
}

/**
 * 7. Partner Summary Export Rows (International Cooperation Office summary)
 */
export async function getPartnerSummaryExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [participations, organizations, booths, scholarships, activities] = await Promise.all([
    db
      .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
      .find({ editionId })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
    db
      .collection<SummitBoothAssignment>(COLLECTIONS.SUMMIT_BOOTH_ASSIGNMENTS)
      .find({ editionId, isPublished: true })
      .toArray(),
    db
      .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
      .find({ isPublished: true })
      .toArray(),
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId, isContentApproved: true })
      .toArray(),
  ]);

  const orgMap = new Map<string, Organization>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o);

  const boothOrgSet = new Set<string>(booths.map((b) => b.organizationId.toString()));

  const scholarshipCounts = new Map<string, number>();
  for (const s of scholarships) {
    const k = s.organizationId.toString();
    scholarshipCounts.set(k, (scholarshipCounts.get(k) || 0) + 1);
  }

  const wsCounts = new Map<string, number>();
  const psCounts = new Map<string, number>();

  for (const a of activities) {
    const k = a.organizationId.toString();
    if (a.type === "WORKSHOP") wsCounts.set(k, (wsCounts.get(k) || 0) + 1);
    else if (a.type === "STAGE_PERFORMANCE") psCounts.set(k, (psCounts.get(k) || 0) + 1);
  }

  const headers = [
    "Organization",
    "Country",
    "Organization Type",
    "Participation Status",
    "Booth Published",
    "Published Scholarships Count",
    "Approved Workshops Count",
    "Approved Performances Count",
  ];

  const rows = participations.map((p) => {
    const org = orgMap.get(p.organizationId.toString());
    const orgIdStr = p.organizationId.toString();

    return [
      org?.name || "Organization",
      org?.country || "",
      org?.type || "",
      p.status,
      boothOrgSet.has(orgIdStr) ? "YES" : "NO",
      scholarshipCounts.get(orgIdStr) || 0,
      wsCounts.get(orgIdStr) || 0,
      psCounts.get(orgIdStr) || 0,
    ];
  });

  return { headers, rows };
}

/**
 * 8. Scholarships Export Rows (Published scholarships from confirmed partners for this edition)
 */
export async function getScholarshipExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [participations, scholarships, organizations] = await Promise.all([
    db
      .collection<OrganizationParticipation>(COLLECTIONS.ORGANIZATION_PARTICIPATIONS)
      .find({ editionId, status: "CONFIRMED" })
      .toArray(),
    db
      .collection<Scholarship>(COLLECTIONS.SCHOLARSHIPS)
      .find({ isPublished: true })
      .toArray(),
    db.collection<Organization>(COLLECTIONS.ORGANIZATIONS).find({}).toArray(),
  ]);

  const confirmedOrgIds = new Set<string>(participations.map((p) => p.organizationId.toString()));
  const orgMap = new Map<string, Organization>();
  for (const o of organizations) if (o._id) orgMap.set(o._id.toString(), o);

  const activeScholarships = scholarships.filter((s) => confirmedOrgIds.has(s.organizationId.toString()));

  const headers = [
    "Provider Organization",
    "Country",
    "Scholarship Type",
    "English Title",
    "Vietnamese Title",
    "Application Deadline",
    "Official URL",
    "Published At",
  ];

  const rows = activeScholarships.map((s) => {
    const org = orgMap.get(s.organizationId.toString());
    const snap = s.publishedSnapshot!;

    return [
      org?.name || "Provider",
      org?.country || "",
      snap.type,
      snap.title.en,
      snap.title.vi,
      snap.applicationDeadline || "Open",
      snap.officialUrl || "",
      s.publishedAt ? new Date(s.publishedAt).toISOString().replace("T", " ").slice(0, 19) : "",
    ];
  });

  return { headers, rows };
}

/**
 * 9. ICS Reference Export Rows (External SRO Handoff - FPT CAN THO STUDENTS ONLY)
 */
export async function getIcsReferenceExportRows(editionId: ObjectId) {
  const db = await getDb();
  const [attendances, registrations, activities] = await Promise.all([
    db
      .collection<SummitActivityAttendance>(COLLECTIONS.SUMMIT_ACTIVITY_ATTENDANCES)
      .find({ editionId, status: "PRESENT" })
      .sort({ attendedAt: -1 })
      .toArray(),
    db
      .collection<SummitRegistration>(COLLECTIONS.SUMMIT_REGISTRATIONS)
      .find({ editionId, participantType: "FPT_STUDENT" })
      .toArray(),
    db
      .collection<SummitActivity>(COLLECTIONS.SUMMIT_ACTIVITIES)
      .find({ editionId })
      .toArray(),
  ]);

  const fptRegMap = new Map<string, SummitRegistration>();
  for (const r of registrations) {
    if (r._id && r.attendeeSnapshot.studentId) {
      fptRegMap.set(r._id.toString(), r);
    }
  }

  const actMap = new Map<string, SummitActivity>();
  for (const a of activities) if (a._id) actMap.set(a._id.toString(), a);

  const rule = DEFAULT_ICS_RULE;

  const headers = [
    "Student ID / MSSV",
    "Full Name",
    "Email",
    "Participant Type",
    "Activity Type",
    "Activity Title",
    "Activity Date",
    "Attendance Status",
    "Attendance Source",
    "ICS Category Code",
    "ICS Category",
    "ICS Unit",
    "Reference ICS",
    "Evidence Type",
    "Evidence Timestamp",
  ];

  const rows: (string | number)[][] = [];

  for (const att of attendances) {
    const reg = fptRegMap.get(att.registrationId.toString());
    // Exclude non-FPT students or invalid MSSV per refinement rule #4
    if (!reg || !reg.attendeeSnapshot.studentId) continue;

    const act = actMap.get(att.activityId.toString());
    const title = act?.approvedSnapshot
      ? act.approvedSnapshot.title.en || act.approvedSnapshot.title.vi || "Activity"
      : "Summit Activity";

    rows.push([
      reg.attendeeSnapshot.studentId,
      reg.attendeeSnapshot.fullName,
      reg.attendeeSnapshot.email,
      "FPT Can Tho Student",
      act?.type || "WORKSHOP",
      title,
      att.activityDayKey,
      "PRESENT",
      att.source,
      rule.code,
      rule.categoryEn,
      rule.unitEn,
      rule.referencePointsPerSession,
      "Activity Attendance",
      new Date(att.attendedAt).toISOString().replace("T", " ").slice(0, 19),
    ]);
  }

  return { headers, rows };
}
