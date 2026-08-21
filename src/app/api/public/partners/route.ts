import { NextResponse } from "next/server";
import { listPublishedOrganizationsForPublic } from "@/lib/db/repositories/organizations";
import type { OrganizationType } from "@/lib/db/models/organization";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const countryParam = searchParams.get("country");
    const localeParam = searchParams.get("locale") || "en";

    const typeFilter =
      typeParam === "UNIVERSITY" || typeParam === "CONSULATE"
        ? (typeParam as OrganizationType)
        : undefined;

    const orgs = await listPublishedOrganizationsForPublic({
      type: typeFilter,
      country: countryParam || undefined,
    });

    const safePartners = orgs.map((org) => {
      const pub = org.publishedProfile!;
      const isVi = localeParam === "vi";
      const shortDesc =
        (isVi ? pub.content?.vi?.shortDescription : pub.content?.en?.shortDescription) ||
        pub.content?.en?.shortDescription ||
        "";
      const fullDesc =
        (isVi ? pub.content?.vi?.description : pub.content?.en?.description) ||
        pub.content?.en?.description ||
        "";

      return {
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
      };
    });

    return NextResponse.json({ success: true, partners: safePartners });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch published partners." },
      { status: 500 }
    );
  }
}
