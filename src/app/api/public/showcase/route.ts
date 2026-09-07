import { NextResponse } from "next/server";
import { getPublicShowcaseEntries } from "@/lib/db/repositories/partner-showcase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const entries = await getPublicShowcaseEntries();
    return NextResponse.json(
      { success: true, entries },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch showcase entries." },
      { status: 500 }
    );
  }
}
