import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ SITE_URL: "https://www.lockshield.ae" }),
}));

import robots from "../robots";

describe("robots", () => {
  const { rules, sitemap } = robots();
  const ruleList = Array.isArray(rules) ? rules : [rules];

  it("keeps /admin/ and /api/ disallowed for every user-agent group", () => {
    // A crawler matching a named group ignores the `*` group (RFC 9309),
    // so each group must carry the disallow itself.
    for (const rule of ruleList) {
      expect(rule.disallow).toEqual(["/admin/", "/api/"]);
    }
  });

  it("names the AI crawlers explicitly", () => {
    const agents = ruleList.map((rule) => rule.userAgent);
    expect(agents).toEqual(
      expect.arrayContaining(["*", "GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"])
    );
  });

  it("points at the sitemap on the canonical host", () => {
    expect(sitemap).toBe("https://www.lockshield.ae/sitemap.xml");
  });
});
