import { NextResponse } from "next/server";
import { listPublishedScholarshipsForPublic } from "@/lib/db/repositories/scholarships";
import { getOrganizationById } from "@/lib/db/repositories/organizations";
import { isDeadlineExpiredAsiaHoChiMinh } from "@/lib/utils/date-helpers";
import type { ScholarshipType } from "@/lib/db/models/scholarship";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const providerTypeParam = searchParams.get("providerType");
    const countryParam = searchParams.get("country");
    const localeParam = searchParams.get("locale") || "en";

    const typeFilter =
      typeParam === "SHORT_TERM" || typeParam === "LONG_TERM"
        ? (typeParam as ScholarshipType)
        : undefined;

    const scholarships = await listPublishedScholarshipsForPublic({
      type: typeFilter,
    });

    const isVi = localeParam === "vi";

    const safeScholarships = (
      await Promise.all(
        scholarships.map(async (s) => {
          const pub = s.publishedSnapshot;
          if (!pub) return null;

          // Filter out expired opportunities based on Asia/Ho_Chi_Minh deadline
          if (isDeadlineExpiredAsiaHoChiMinh(pub.applicationDeadline)) {
            return null;
          }

          // Fetch provider organization details
          const org = await getOrganizationById(s.organizationId);
          if (!org || !org.isPublished || !org.publishedProfile) {
            return null; // Must belong to a published provider
          }

          if (
            providerTypeParam &&
            providerTypeParam !== "All" &&
            org.type !== providerTypeParam
          ) {
            return null;
          }

          if (
            countryParam &&
            countryParam !== "All" &&
            org.country.toLowerCase() !== countryParam.trim().toLowerCase()
          ) {
            return null;
          }

          const title = (isVi ? pub.title?.vi : pub.title?.en) || pub.title?.en || "";
          const shortDesc =
            (isVi ? pub.shortDescription?.vi : pub.shortDescription?.en) ||
            pub.shortDescription?.en ||
            "";
          const fullDesc =
            (isVi ? pub.fullDescription?.vi : pub.fullDescription?.en) ||
            pub.fullDescription?.en ||
            null;
          const funding =
            (isVi ? pub.fundingSummary?.vi : pub.fundingSummary?.en) ||
            pub.fundingSummary?.en ||
            null;
          const eligibility =
            (isVi ? pub.eligibility?.vi : pub.eligibility?.en) ||
            pub.eligibility?.en ||
            null;

          const orgPub = org.publishedProfile;

          return {
            id: String(s._id),
            type: pub.type,
            title,
            shortDescription: shortDesc,
            fullDescription: fullDesc,
            officialUrl: pub.officialUrl,
            applicationDeadline: pub.applicationDeadline || null,
            fundingSummary: funding,
            eligibility,
            bannerUrl: pub.banner?.secureUrl || null,
            provider: {
              id: String(org._id),
              name: org.name,
              type: org.type,
              country: org.country,
              logoUrl: orgPub.logoUrl || orgPub.logo?.secureUrl || null,
            },
          };
        })
      )
    ).filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({ success: true, scholarships: safeScholarships });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch published scholarships." },
      { status: 500 }
    );
  }
}
