import { revalidatePath } from "next/cache";

/**
 * Admin writes -> public cache busting.
 *
 * WHY this exists: every page under app/(public) is ISR with
 * `export const revalidate = 300`. Without an explicit bust, publishing a
 * service, fixing a typo in a blog post or deleting a project simply did not
 * show on the site for up to five minutes, which reads as "the admin is
 * broken". The CRUD factory calls this after every successful create/update/
 * delete so a save in the admin is visible on the next public request.
 *
 * Paths are declared per resource rather than nuking the whole cache with
 * `revalidatePath("/", "layout")`, so editing one blog post does not throw
 * away the rendered services and projects pages too. Settings is the one
 * exception: it feeds the shared Navbar/Footer, so it genuinely does
 * invalidate every page.
 */

/** Routes that list or embed content and are regenerated on any content change. */
const SITE_INDEXES = ["/sitemap.xml", "/llms.txt"] as const;

type Target = { path: string; type?: "page" | "layout" };

/**
 * Maps `CrudConfig.resourceName` to the public routes its data renders into.
 * A dynamic entry such as `/blog/[slug]` is the literal route pattern —
 * Next.js expands it to every cached instance of that route.
 */
const RESOURCE_TARGETS: Record<string, Target[]> = {
  Post: [{ path: "/blog" }, { path: "/blog/[slug]", type: "page" }],
  // Services and projects are both teased on the homepage, so "/" goes too.
  Service: [{ path: "/" }, { path: "/services" }, { path: "/services/[slug]", type: "page" }],
  Project: [{ path: "/" }, { path: "/projects" }, { path: "/projects/[slug]", type: "page" }],
  Job: [{ path: "/career" }],
  // Pages render through app/[...slug], which is already force-dynamic — only
  // the sitemap below needs refreshing when one is added or removed.
  Page: [],
  // Categories and tags are the blog index's filter chips and post bylines.
  Category: [{ path: "/blog" }, { path: "/blog/[slug]", type: "page" }],
  Tag: [{ path: "/blog" }, { path: "/blog/[slug]", type: "page" }],
  // Redirects are applied per-request in middleware; nothing static caches them.
  Redirect: [],
  // Media records are admin-only metadata; the public pages reference the CDN
  // URL that is already embedded in whichever document uses it.
  Media: [],
};

/** Resources that are purely internal — no public route reads them at all. */
const PRIVATE_RESOURCES = new Set(["Media", "Redirect", "User", "Lead", "AuditLog"]);

/**
 * Bust the public cache for one resource. Never throws: a cache miss is a
 * stale page, but an exception here would fail an otherwise-successful write
 * and make the admin report an error for a save that actually landed.
 */
export function revalidateResource(resourceName: string): void {
  try {
    const targets = RESOURCE_TARGETS[resourceName];
    if (!targets) return;

    for (const target of targets) {
      revalidatePath(target.path, target.type);
    }

    if (!PRIVATE_RESOURCES.has(resourceName)) {
      for (const path of SITE_INDEXES) revalidatePath(path);
    }
  } catch {
    // Non-fatal by design — see the doc comment above.
    void 0;
  }
}

/**
 * Settings feeds the Navbar and Footer rendered by app/(public)/layout.tsx,
 * plus the LocalBusiness JSON-LD on the homepage, so a change to it really
 * does invalidate the entire public tree.
 */
export function revalidateSettings(): void {
  try {
    revalidatePath("/", "layout");
    for (const path of SITE_INDEXES) revalidatePath(path);
  } catch {
    void 0;
  }
}
