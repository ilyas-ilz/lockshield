import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextMiddleware, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { legacyHtmlTarget } from "@/lib/legacy-redirects";

const { auth } = NextAuth(authConfig);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF guard for state-changing API calls.
 * WHY: the session cookie is SameSite=Lax, which still lets a same-*site*
 * page (any lockshield.ae subdomain, e.g. the CDN) send it, and route
 * handlers read req.json() regardless of Content-Type, so a plain HTML form
 * could POST to /api/*. Browsers always attach Sec-Fetch-Site / Origin to
 * such requests, so anything not from this exact origin is refused.
 * Requests with neither header aren't from a browser and can't ride a
 * victim's cookie, so they fall through to the normal auth checks.
 */
function isCrossOriginWrite(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method)) return false;
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite !== "same-origin";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.nextUrl.host;
  } catch {
    return true;
  }
}

const withAuth = auth((req: NextRequest & { auth: unknown }) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    if (isCrossOriginWrite(req)) {
      return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 1. Protect /admin/* routes
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Enforce Role-Based Access Control (RBAC) on Admin-only routes
  const isAdminOnlyRoute =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/settings") ||
    pathname.startsWith("/admin/redirects");

  if (isAdminOnlyRoute && req.auth) {
    const session = req.auth as { user?: { role?: string } };
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Legacy .html URLs -> 301 to their new path, preserving SEO equity.
  // WHY before withAuth: Auth.js rewrites req.nextUrl to AUTH_URL's host, so
  // with AUTH_URL on the vercel.app domain every old URL Google had indexed
  // was 301'd off www. Redirects need no session, and here nextUrl is still
  // the host the visitor actually requested.
  const target = legacyHtmlTarget(req.nextUrl.pathname);
  if (target) return NextResponse.redirect(new URL(target, req.nextUrl.origin), { status: 301 });

  // auth() is typed as "route handler or middleware"; here it is middleware.
  return (withAuth as unknown as NextMiddleware)(req, event);
}

export const config = {
  // /api/auth is excluded: Auth.js has its own CSRF token on those routes.
  matcher: ["/admin/:path*", "/:path*.html", "/api/((?!auth/).*)"],
};
