import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

/**
 * /api/media had the same two gaps as /api/users: `?search=` was parsed and
 * discarded, and there was no write rate limit. Both are covered here so the
 * hand-written route cannot drift away from the CRUD factory again.
 */
let currentActor: { id: string; role: "ADMIN" | "EDITOR"; email: string } | null = null;

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (currentActor ? { user: currentActor } : null)),
}));

function req(url: string, init?: { method?: string; body?: string }) {
  return new NextRequest(new URL(url, "http://localhost"), init);
}

type MediaRoute = typeof import("../route");
let mediaRoute: MediaRoute;
let Media: typeof import("@/models/Media").Media;

async function seedMedia() {
  await Media.create([
    { url: "/uploads/fire-panel.webp", alt: "Fire alarm panel", storage: "local", uploadedBy: "6ab2219379c547e668973c80" },
    { url: "/uploads/sprinkler-head.webp", alt: "Sprinkler head", storage: "local", uploadedBy: "6ab2219379c547e668973c80" },
    { url: "/uploads/extinguisher.webp", alt: "CO2 extinguisher", storage: "local", uploadedBy: "6ab2219379c547e668973c80" },
  ]);
}

describe("/api/media", () => {
  beforeAll(async () => {
    await startTestDB();
    mediaRoute = await import("../route");
    ({ Media } = await import("@/models/Media"));
  });
  afterAll(stopTestDB);
  beforeEach(() => {
    currentActor = { id: "media-actor", role: "EDITOR", email: "editor@test.com" };
    return clearTestDB();
  });

  it("filters by ?search= on alt text", async () => {
    await seedMedia();

    const res = await mediaRoute.GET(req("/api/media?search=sprinkler"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.total).toBe(1);
    expect(body.data.items[0].alt).toBe("Sprinkler head");
  });

  it("filters by ?search= on url as well as alt", async () => {
    await seedMedia();

    const res = await mediaRoute.GET(req("/api/media?search=extinguisher"));
    const body = await res.json();

    // Matches both the url (/uploads/extinguisher.webp) and the alt text,
    // but $or must not produce the same document twice.
    expect(body.data.total).toBe(1);
  });

  it("returns everything when no search is supplied", async () => {
    await seedMedia();

    const res = await mediaRoute.GET(req("/api/media"));
    const body = await res.json();

    expect(body.data.total).toBe(3);
  });

  it("rate-limits record creation once the budget is spent", async () => {
    currentActor = { id: "media-rate-limited", role: "EDITOR", email: "rl@test.com" };

    const { checkRateLimit, RATE_LIMITS } = await import("@/lib/rate-limit");
    for (let n = 0; n < RATE_LIMITS.apiWrite.max; n += 1) {
      checkRateLimit(`write:${currentActor.id}`, RATE_LIMITS.apiWrite.max, RATE_LIMITS.apiWrite.windowMs);
    }

    const res = await mediaRoute.POST(
      req("/api/media", {
        method: "POST",
        body: JSON.stringify({ url: "/uploads/over.webp", alt: "Over budget", storage: "local" }),
      })
    );

    expect(res.status).toBe(429);
    expect(await Media.countDocuments({ url: "/uploads/over.webp" })).toBe(0);
  });

  it("still records media while the actor has budget", async () => {
    // Must be a real ObjectId: the route stamps `uploadedBy: actor.id`, which
    // the Media schema declares as an ObjectId ref to User.
    currentActor = { id: "6ab2219379c547e668973c81", role: "EDITOR", email: "fresh@test.com" };

    const res = await mediaRoute.POST(
      req("/api/media", {
        method: "POST",
        body: JSON.stringify({ url: "/uploads/ok.webp", alt: "Within budget", storage: "local" }),
      })
    );

    expect(res.status).toBe(201);
    expect(await Media.countDocuments({ url: "/uploads/ok.webp" })).toBe(1);
  });
});
