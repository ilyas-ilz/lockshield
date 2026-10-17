import { normalizeSiteUrl } from "../env";

const DEFAULT_SITE_URL = "https://www.lockshield.ae";

/** The public site's host, from SITE_URL the same way canonicals and the sitemap get it. */
export function canonicalHost(siteUrl: string | undefined): string {
  const normalized = normalizeSiteUrl(siteUrl ?? DEFAULT_SITE_URL);
  try {
    return new URL(String(normalized ?? DEFAULT_SITE_URL)).hostname;
  } catch {
    return new URL(DEFAULT_SITE_URL).hostname;
  }
}

/**
 * next.config header rule: every host except the canonical one is noindex.
 *
 * WHY: the full site is also served on lockshield-ten.vercel.app (and on
 * every preview deploy). Canonical tags point at www, but they are only a
 * hint, so Google could still index the duplicate host. `missing: host`
 * skips the header on www without running middleware on public pages.
 */
export function nonCanonicalHostNoindex(siteUrl: string | undefined) {
  return {
    source: "/:path*",
    // Next matches host values as an anchored regex, so escape the dots.
    missing: [{ type: "host" as const, value: canonicalHost(siteUrl).replace(/\./g, "\\.") }],
    headers: [{ key: "X-Robots-Tag", value: "noindex" }],
  };
}
