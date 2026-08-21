/**
 * src/proxy.ts
 *
 * Next.js 16 route proxy for convenient client-side route redirects.
 * Note: Mandatory server-side authorization guards (requireAdmin, requireUser) remain enforced in all DAL handlers.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Convenient route protection hints
  const isProtectedPath =
    pathname.includes("/dashboard") ||
    pathname.includes("/admin") ||
    pathname.includes("/account/change-password");

  if (isProtectedPath) {
    // Session token presence check (Auth.js cookie name)
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      const locale = pathname.startsWith("/vi") ? "vi" : "en";
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|branding|images|api/auth).*)",
  ],
};
