import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

const PRIVATE_PATHS = ["/admin/", "/api/"];

// WHY explicitly allowed rather than just not-disallowed: GEO
// (design doc "GEO / AI search") wants these crawlers named
// affirmatively so an operator reading robots.txt sees the site
// intends AI-answer-engine visibility, not that it merely forgot to
// block them.
const AI_CRAWLERS = ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  const { SITE_URL } = getEnv();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      // WHY each AI crawler repeats the disallow: a crawler that matches a
      // named group ignores the `*` group entirely (RFC 9309), so without
      // it these bots would be free to crawl /admin/ and /api/.
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
