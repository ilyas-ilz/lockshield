import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

/**
 * Regression tests for the two gaps the hand-written /api/users route had
 * relative to the CRUD factory it deliberately does not use:
 *
 *  1. `?search=` was parsed off the URL and then thrown away — the admin's
 *     Users table has `searchable: true`, so typing in the box hit this
 *     route and got back every user. The SSR path (server-data.ts, which
 *     does filter on name/email) disagreed with it, so the same query gave
 *     different results on first paint vs. after a keystroke.
 *  2. No write rate limit, while every factory-backed resource has one.
 */

// Mirrors createCrudHandlers.test.ts: fake only the session lookup so the
// real requireRole / 401-vs-403 branching still runs.
let currentActor: { id: string; role: "ADMIN" | "EDITOR"; email: string } | null = null;

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (currentActor ? { user: currentActor } : null)),
}));

function req(url: string, init?: { method?: string; body?: string }) {
  return new NextRequest(new URL(url, "http://localhost"), init);
}

// Imported lazily: the route module pulls in lib/env at import time, and
// startTestDB() is what sets MONGODB_URI/AUTH_SECRET.
type UsersRoute = typeof import("../route");
let usersRoute: UsersRoute;
let User: typeof import("@/models/User").User;

async function seedUsers() {
  await User.create([
    { name: "Aisha Rahman", email: "aisha@lockshield.ae", passwordHash: "x", role: "EDITOR" },
    { name: "Bilal Khan", email: "bilal@example.com", passwordHash: "x", role: "EDITOR" },
    { name: "Carla Mendes", email: "carla@lockshield.ae", passwordHash: "x", role: "ADMIN" },
  ]);
}

describe("/api/users", () => {
  beforeAll(async () => {
    await startTestDB();
    usersRoute = await import("../route");
    ({ User } = await import("@/models/User"));
  });
  afterAll(stopTestDB);
  beforeEach(() => {
    currentActor = { id: "actor1", role: "ADMIN", email: "admin@test.com" };
    return clearTestDB();
  });

  it("filters the list by ?search= across name and email", async () => {
    await seedUsers();

    const res = await usersRoute.GET(req("/api/users?search=aisha"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.total).toBe(1);
    expect(body.data.items[0].name).toBe("Aisha Rahman");
  });

  it("matches on email as well as name", async () => {
    await seedUsers();

    const res = await usersRoute.GET(req("/api/users?search=example.com"));
    const body = await res.json();

    expect(body.data.total).toBe(1);
    expect(body.data.items[0].email).toBe("bilal@example.com");
  });

  it("treats regex metacharacters in ?search= as literal text", async () => {
    await seedUsers();

    // Unescaped, "." would match any character and return all three users.
    const res = await usersRoute.GET(req("/api/users?search=aisha.lockshield"));
    const body = await res.json();

    expect(body.data.total).toBe(0);
  });

  it("returns every user when no search is supplied", async () => {
    await seedUsers();

    const res = await usersRoute.GET(req("/api/users"));
    const body = await res.json();

    expect(body.data.total).toBe(3);
  });

  it("never exposes passwordHash in the list payload", async () => {
    await seedUsers();

    const res = await usersRoute.GET(req("/api/users"));
    const body = await res.json();

    for (const item of body.data.items) {
      expect(item.passwordHash).toBeUndefined();
    }
  });

  it("rejects a non-ADMIN caller", async () => {
    currentActor = { id: "actor2", role: "EDITOR", email: "editor@test.com" };

    const res = await usersRoute.GET(req("/api/users?search=aisha"));
    expect(res.status).toBe(403);
  });

  it("rate-limits creates once the actor's write budget is spent", async () => {
    // The limiter is module-level state keyed by actor and the window is a
    // whole minute, so each rate-limit test needs its own actor id or it
    // inherits the previous test's spent budget.
    currentActor = { id: "rate-limited-actor", role: "ADMIN", email: "rl@test.com" };

    // Spend the budget directly rather than issuing 60 real POSTs: each one
    // bcrypt-hashes a password, which took ~19s and crowded the 30s timeout.
    // Same limiter, same key the route uses.
    const { checkRateLimit, RATE_LIMITS } = await import("@/lib/rate-limit");
    for (let n = 0; n < RATE_LIMITS.apiWrite.max; n += 1) {
      checkRateLimit(`write:${currentActor.id}`, RATE_LIMITS.apiWrite.max, RATE_LIMITS.apiWrite.windowMs);
    }

    const res = await usersRoute.POST(
      req("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: "Over Budget",
          email: "over@lockshield.ae",
          password: "Str0ng-Passw0rd!",
          role: "EDITOR",
        }),
      })
    );

    expect(res.status).toBe(429);
    expect(await User.countDocuments({ email: "over@lockshield.ae" })).toBe(0);
  });

  it("allows a create while the actor still has budget", async () => {
    currentActor = { id: "fresh-budget-actor", role: "ADMIN", email: "fresh@test.com" };

    const res = await usersRoute.POST(
      req("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: "Within Budget",
          email: "within@lockshield.ae",
          password: "Str0ng-Passw0rd!",
          role: "EDITOR",
        }),
      })
    );

    expect(res.status).toBe(201);
    expect(await User.countDocuments({ email: "within@lockshield.ae" })).toBe(1);
  });
});
