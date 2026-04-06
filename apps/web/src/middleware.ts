/**
 * Next.js Middleware — handles two concerns:
 * 1. Locale routing via next-intl (en at /, de at /de/)
 * 2. Anonymous session cookie (UUID) for watchlist persistence
 */

import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const SESSION_COOKIE = "igift_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// next-intl middleware handles locale detection and URL rewriting
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest): NextResponse {
  // Run locale routing first — it may redirect or rewrite the request
  const response = intlMiddleware(request) as NextResponse;

  // Mint an anonymous session cookie if not present
  if (!request.cookies.get(SESSION_COOKIE)) {
    response.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR_SECONDS,
      path: "/",
    });
  }

  return response;
}

export const config = {
  // Run on all pages but skip Next.js internals, static files, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)",
  ],
};
