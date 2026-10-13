import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("checkRateLimit", () => {
  it("blocks once the limit is reached within the window", async () => {
    const { checkRateLimit } = await import("../rate-limit");
    for (let i = 0; i < 3; i++) expect(checkRateLimit("k:basic", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("k:basic", 3, 60_000).allowed).toBe(false);
  });

  it("a short-window call triggering the sweep does not reset a long-window bucket", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T10:00:00Z"));
    const { checkRateLimit } = await import("../rate-limit");

    const LOGIN_WINDOW = 15 * 60_000;
    for (let i = 0; i < 2; i++) checkRateLimit("login:ip:a@b.c", 2, LOGIN_WINDOW);
    expect(checkRateLimit("login:ip:a@b.c", 2, LOGIN_WINDOW).allowed).toBe(false);

    // 11 minutes later (past the 10-minute sweep interval, still inside the
    // 15-minute login window) an unrelated 60 s write check runs the sweep.
    vi.setSystemTime(new Date("2026-10-13T10:11:00Z"));
    checkRateLimit("write:user1", 60, 60_000);

    expect(checkRateLimit("login:ip:a@b.c", 2, LOGIN_WINDOW).allowed).toBe(false);
  });
});
