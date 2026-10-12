import { describe, it, expect } from "vitest";
import { normalizeSiteUrl } from "../env";

describe("normalizeSiteUrl", () => {
  it("moves the apex host to www, which is the host Vercel serves", () => {
    expect(normalizeSiteUrl("https://lockshield.ae")).toBe("https://www.lockshield.ae");
  });

  it("drops a trailing slash so `${SITE_URL}/about` never doubles it", () => {
    expect(normalizeSiteUrl("https://lockshield.ae/")).toBe("https://www.lockshield.ae");
    expect(normalizeSiteUrl("https://www.lockshield.ae/")).toBe("https://www.lockshield.ae");
  });

  it("leaves other hosts alone (local dev, preview deploys)", () => {
    expect(normalizeSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeSiteUrl("https://lockshield-ten.vercel.app")).toBe("https://lockshield-ten.vercel.app");
  });

  it("treats blank as unset", () => {
    expect(normalizeSiteUrl("  ")).toBeUndefined();
    expect(normalizeSiteUrl(undefined)).toBeUndefined();
  });

  it("passes non-URLs through for zod to reject", () => {
    expect(normalizeSiteUrl("not a url")).toBe("not a url");
  });
});
