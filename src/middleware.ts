// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isLoginPage = pathname.startsWith("/login");
    const isApiRoute = pathname.startsWith("/api");
    const isPublicAsset =
      pathname.startsWith("/_next") || /\.(?:\w+)$/.test(pathname);

    // Skip middleware for API routes and public assets
    if (isApiRoute || isPublicAsset) {
      return NextResponse.next();
    }

    // Check if SECRET_COOKIE_PASSWORD is available
    if (!process.env.SECRET_COOKIE_PASSWORD) {
      if (!isLoginPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    let response = NextResponse.next();
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions,
    );


    // Note: Team active status checking is now handled in individual API routes
    // to avoid SQLite dependencies in Edge Runtime middleware

    // Redirect to login if not logged in and not on login page
    if (!session.isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect to home if logged in and on login page
    if (session.isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (error) {
    // Fallback: allow the request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};


