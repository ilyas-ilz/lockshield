import { describe, it, expect, afterEach, vi } from "vitest";
import { canonicalHost, nonCanonicalHostNoindex } from "../host-noindex";

describe("canonicalHost", () => {
  it("is www for the production SITE_URL", () => {
    expect(canonicalHost("https://www.lockshield.ae")).toBe("www.lockshield.ae");
  });

  it("maps the apex to www, like every other SEO URL", () => {
    expect(canonicalHost("https://lockshield.ae/")).toBe("www.lockshield.ae");
  });

  it("defaults to www when SITE_URL is unset or invalid", () => {
    expect(canonicalHost(undefined)).toBe("www.lockshield.ae");
    expect(canonicalHost("not a url")).toBe("www.lockshield.ae");
  });
});

describe("nonCanonicalHostNoindex", () => {
  const rule = nonCanonicalHostNoindex("https://www.lockshield.ae");
  // Next matches has/missing host values as an anchored regex: ^value$.
  const matchesCanonical = (host: string) => new RegExp(`^${rule.missing[0]!.value}$`).test(host);

  it("noindexes every host except the canonical one", () => {
    expect(rule.headers).toEqual([{ key: "X-Robots-Tag", value: "noindex" }]);
    expect(rule.missing[0]!.type).toBe("host");
    expect(matchesCanonical("www.lockshield.ae")).toBe(true); // www: header NOT added
    expect(matchesCanonical("lockshield-ten.vercel.app")).toBe(false); // gets noindex
  });

  it("escapes dots so look-alike hosts are not treated as canonical", () => {
    expect(matchesCanonical("wwwxlockshieldxae")).toBe(false);
  });
});

describe("next.config headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("ships the noindex rule built from SITE_URL", async () => {
    vi.stubEnv("SITE_URL", "https://www.lockshield.ae");
    const { default: config } = await import("../../../../next.config");
    const rules = await config.headers!();
    const noindex = rules.find((r) => r.headers.some((h) => h.key === "X-Robots-Tag"));
    expect(noindex?.missing).toEqual([{ type: "host", value: "www\\.lockshield\\.ae" }]);
  });
});
