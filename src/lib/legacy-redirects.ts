// Old static-site URLs -> their new homes. Pure and Edge-safe (middleware.ts).
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

/** Where a legacy `.html` path now lives, or null when the path isn't one. */
export function legacyHtmlTarget(pathname: string): string | null {
  if (!pathname.endsWith(".html")) return null;
  return LEGACY_HTML_REDIRECTS[pathname] || pathname.replace(/\.html$/, "") || "/";
}
