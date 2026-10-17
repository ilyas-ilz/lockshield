import { describe, it, expect, beforeAll, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";

// Production has AUTH_URL on a different host than the public site. Auth.js
// rewrites the request URL to that host, which is how every legacy .html 301
// ended up pointing at lockshield-ten.vercel.app instead of www.
beforeAll(() => {
  vi.stubEnv("AUTH_URL", "https://lockshield-ten.vercel.app");
  vi.stubEnv("AUTH_SECRET", "test-secret-test-secret-test-secret-1234");
});

async function run(url: string) {
  const { default: middleware } = await import("@/middleware");
  return middleware(new NextRequest(url), {} as NextFetchEvent) as Promise<Response>;
}

describe("legacy .html redirects", () => {
  it("301s a mapped page to its new path on the host that was requested", async () => {
    const res = await run("https://www.lockshield.ae/fm-200-special-systems.html");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.lockshield.ae/services/fm-200-special-systems");
  });

  it("sends /index.html to the home page", async () => {
    const res = await run("https://www.lockshield.ae/index.html");
    expect(res.headers.get("location")).toBe("https://www.lockshield.ae/");
  });

  it("strips .html from unmapped pages", async () => {
    const res = await run("https://www.lockshield.ae/services.html");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://www.lockshield.ae/services");
  });
});

describe("admin routes still go through Auth.js", () => {
  it("sends a signed-out visitor from /admin to the login page", async () => {
    const res = await run("https://www.lockshield.ae/admin/projects");
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("callbackUrl")).toBe("/admin/projects");
  });
});

describe("legacyHtmlTarget", () => {
  it("maps old pages and ignores everything else", async () => {
    const { legacyHtmlTarget } = await import("../legacy-redirects");
    expect(legacyHtmlTarget("/projects-and-fit-outs.html")).toBe("/projects");
    expect(legacyHtmlTarget("/vismaya-madathil.html")).toBe("/about");
    expect(legacyHtmlTarget("/career.html")).toBe("/career");
    expect(legacyHtmlTarget("/about")).toBeNull();
    expect(legacyHtmlTarget("/admin")).toBeNull();
  });
});
