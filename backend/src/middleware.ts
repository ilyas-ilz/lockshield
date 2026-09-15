import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

// WHY NextAuth(authConfig) here instead of importing auth from lib/auth.ts:
// this file runs on the Edge runtime, and lib/auth.ts's Credentials
// provider imports Mongoose (Node-only) — see auth.config.ts's doc comment.
// authConfig has zero DB imports, so this stays Edge-safe.
const { auth } = NextAuth(authConfig);

// WHY edge-safe and auth-only here: checks the session cookie only (JWT
// strategy needs no DB round-trip) and redirects unauthenticated /admin/*
// visits to the login page. Per-resource role checks (EDITOR vs ADMIN)
// still happen in each route handler via requireRole() — this is a UX
// redirect, not the security boundary.
//
// Legacy-URL 301 redirects (lib/redirects.ts, DB-backed) are deliberately
// NOT wired in here yet — that needs the public frontend routes to exist
// first so there's something to redirect *to*, and a DB-backed lookup on
// every request would itself need the Node runtime. Tracked for the
// frontend-wiring phase.
export default auth((req: NextRequest & { auth: unknown }) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login";

  if (isAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
