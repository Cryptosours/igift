/**
 * Next.js Middleware — sets an anonymous session cookie on first visit.
 * The `igift_session` cookie is a UUID that ties watchlist items to a visitor
 * without requiring any login. It expires in 1 year.
 */

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "igift_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // If no session cookie, mint one
  if (!request.cookies.get(SESSION_COOKIE)) {
    // crypto.randomUUID() is available in Edge Runtime (Web Crypto API)
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
  // Run on all pages but skip Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
