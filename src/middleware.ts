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

export default auth((req: NextRequest & { auth: unknown }) => {
  const pathname = req.nextUrl.pathname;

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
  matcher: ["/admin/:path*", "/:path*.html"],
};
