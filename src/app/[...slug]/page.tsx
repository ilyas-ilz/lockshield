import { redirect, permanentRedirect, notFound } from "next/navigation";
import { findRedirect } from "@/lib/redirects";

// Sits below every static/dynamic route in (public) and admin - Next.js
// always resolves a more specific segment first, so this only ever runs
// for a path that matched nothing else. Consults the admin-managed
// Redirect collection (middleware.ts can't: it runs on the Edge runtime
// and can never import Mongoose) before giving up and rendering the real
// 404 page.
export const dynamic = "force-dynamic";

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllRedirectPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const pathname = `/${slug.join("/")}`;

  const found = await findRedirect(pathname).catch(() => null);

  if (found) {
    // next/navigation has no literal 301/302: permanentRedirect() sends 308
    // and redirect() sends 307 - the modern, method-preserving equivalents
    // search engines already treat the same way for ranking purposes as
    // 301/302 respectively, so the admin's "301 vs 302" choice is preserved
    // in effect even though the wire status code differs.
    if (found.statusCode === 301) {
      permanentRedirect(found.to);
    }
    redirect(found.to);
  }

  notFound();
}
