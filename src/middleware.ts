import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const LEGACY_HTML_REDIRECTS: Record<string, string> = {
  "/index.html": "/",
  "/about.html": "/about",
  "/contact.html": "/contact",
  "/blog.html": "/blog",
  "/career.html": "/career",
  "/annual-maintenance-contract.html": "/services/annual-maintenance-contract",
  "/designing-drawing-civil-defence-approval.html": "/services/designing-drawing-civil-defence-approval",
  "/fire-extinguisher-refilling.html": "/services/fire-extinguisher-refilling",
  "/fire-system-products-supply.html": "/services/fire-system-products-supply",
  "/fm-200-special-systems.html": "/services/fm-200-special-systems",
  "/kitchen-fire-suppression-systems.html": "/services/kitchen-fire-suppression-systems",
  "/projects-and-fit-outs.html": "/projects",
  "/vismaya-madathil.html": "/about",
};

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

export default auth((req: NextRequest & { auth: unknown }) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    if (isCrossOriginWrite(req)) {
      return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 1. Handle legacy .html URLs -> 301 Permanent Redirect to preserve SEO equity
  if (pathname.endsWith(".html")) {
    const target = LEGACY_HTML_REDIRECTS[pathname] || pathname.replace(/\.html$/, "") || "/";
    const redirectUrl = new URL(target, req.nextUrl.origin);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 2. Protect /admin/* routes
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Enforce Role-Based Access Control (RBAC) on Admin-only routes
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

export const config = {
  // /api/auth is excluded: Auth.js has its own CSRF token on those routes.
  matcher: ["/admin/:path*", "/:path*.html", "/api/((?!auth/).*)"],
};
