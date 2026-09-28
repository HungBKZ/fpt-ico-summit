import { NextResponse } from "next/server";
import { getPublishedOrganizationById } from "@/lib/db/repositories/organizations";
import { listPublishedScholarshipsByOrg } from "@/lib/db/repositories/scholarships";
import { listPublishedActivitiesByOrg } from "@/lib/db/repositories/summit-activities";
import { isDeadlineExpiredAsiaHoChiMinh } from "@/lib/utils/date-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get("locale") || "en";
    const isVi = localeParam === "vi";

    const org = await getPublishedOrganizationById(id);
    if (!org || !org.isPublished || !org.publishedProfile) {
      return NextResponse.json(
        { success: false, error: "Partner organization not found or not published." },
        { status: 404 }
      );
    }

    const pub = org.publishedProfile;
    const shortDesc =
      (isVi ? pub.content?.vi?.shortDescription : pub.content?.en?.shortDescription) ||
      pub.content?.en?.shortDescription ||
      "";
    const fullDesc =
      (isVi ? pub.content?.vi?.description : pub.content?.en?.description) ||
      pub.content?.en?.description ||
      "";

    // Query linked published scholarships and activities in parallel
    const [rawScholarships, rawActivities] = await Promise.all([
      listPublishedScholarshipsByOrg(org._id!),
      listPublishedActivitiesByOrg(org._id!),
    ]);

    // Sanitize scholarships: only active published records
    const safeScholarships = rawScholarships
      .filter((s) => {
        const snap = s.publishedSnapshot;
        if (!snap) return false;
        // Check deadline expiration
        return !isDeadlineExpiredAsiaHoChiMinh(snap.applicationDeadline);
      })
      .map((s) => {
        const snap = s.publishedSnapshot!;
        const title = (isVi ? snap.title?.vi : snap.title?.en) || snap.title?.en || "";
        const shortDescription =
          (isVi ? snap.shortDescription?.vi : snap.shortDescription?.en) ||
          snap.shortDescription?.en ||
          "";
        const fundingSummary =
          (isVi ? snap.fundingSummary?.vi : snap.fundingSummary?.en) ||
          snap.fundingSummary?.en ||
          undefined;
        const eligibility =
          (isVi ? snap.eligibility?.vi : snap.eligibility?.en) ||
          snap.eligibility?.en ||
          undefined;

        return {
          id: String(s._id),
          type: snap.type,
          title,
          shortDescription,
          fundingSummary,
          eligibility,
          officialUrl: snap.officialUrl,
          deadline: snap.applicationDeadline ? snap.applicationDeadline.toISOString() : undefined,
          bannerUrl: snap.banner?.secureUrl || null,
        };
      });

    // Sanitize activities: only approved & scheduled activities for public display
    const safeActivities = rawActivities
      .filter((a) => Boolean(a.isContentApproved && a.approvedSnapshot && a.publishedSchedule))
      .map((a) => {
        const snap = a.approvedSnapshot!;

        const title =
          (isVi ? snap.title?.vi : snap.title?.en) ||
          snap.title?.en ||
          "Summit Activity";

        const shortDescription =
          (isVi ? snap.shortDescription?.vi : snap.shortDescription?.en) ||
          snap.shortDescription?.en ||
          "";

        const format =
          "format" in snap
            ? snap.format
            : "performanceType" in snap
            ? snap.performanceType
            : undefined;

        const coverUrl =
          "coverImage" in snap
            ? snap.coverImage?.secureUrl
            : "performanceCover" in snap
            ? snap.performanceCover?.secureUrl
            : null;

        return {
          id: String(a._id),
          activityType: a.type,
          title,
          shortDescription,
          durationMinutes: snap.durationMinutes,
          format,
          coverUrl,
          schedule: a.publishedSchedule
            ? {
                dateKey: a.publishedSchedule.dateKey,
                startTime: a.publishedSchedule.startTime,
                endTime: a.publishedSchedule.endTime,
                venue: a.publishedSchedule.venue,
              }
            : null,
        };
      });

    const hasVirtualBooth = Boolean(pub.virtualBooth?.enabled);
    const virtualBooth = pub.virtualBooth?.enabled
      ? {
          enabled: true,
          shortIntroduction: pub.virtualBooth.shortIntroduction || null,
          description: pub.virtualBooth.description || null,
          programs: pub.virtualBooth.programs || [],
          resources: pub.virtualBooth.resources || [],
          primaryCta: pub.virtualBooth.primaryCta || null,
        }
      : null;

    const partnerDto = {
      id: String(org._id),
      type: org.type,
      name: org.name,
      country: org.country,
      logoUrl: pub.logoUrl || pub.logo?.secureUrl || null,
      coverImage: pub.coverImage?.secureUrl
        ? {
            secureUrl: pub.coverImage.secureUrl,
            width: pub.coverImage.width,
            height: pub.coverImage.height,
          }
        : null,
      websiteUrl: pub.websiteUrl || null,
      publicContact: pub.publicContact || null,
      shortDescription: shortDesc,
      description: fullDesc || null,
      hasVirtualBooth,
      virtualBooth,
      scholarships: safeScholarships,
      activities: safeActivities,
    };

    return NextResponse.json({ success: true, partner: partnerDto });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load partner." },
      { status: 500 }
    );
  }
}
