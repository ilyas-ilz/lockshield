import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const { SITE_URL } = getEnv();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
      // WHY explicitly allowed rather than just not-disallowed: GEO
      // (design doc "GEO / AI search") wants these crawlers named
      // affirmatively so an operator reading robots.txt sees the site
      // intends AI-answer-engine visibility, not that it merely forgot to
      // block them.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
