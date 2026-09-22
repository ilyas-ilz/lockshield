import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

/**
 * Self-service password change. This endpoint shipped with no UI and no rate
 * limit despite verifying the caller's current password, which made it a
 * password oracle for anyone holding a session.
 */
let currentActor: { id: string; role: "ADMIN" | "EDITOR"; email: string } | null = null;

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (currentActor ? { user: currentActor } : null)),
}));

function req(body: unknown) {
  return new NextRequest(new URL("/api/users/me/password", "http://localhost"), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

type Route = typeof import("../route");
let route: Route;
let User: typeof import("@/models/User").User;
let hashPassword: typeof import("@/lib/password").hashPassword;
let verifyPassword: typeof import("@/lib/password").verifyPassword;

const ORIGINAL = "Or1ginal-Passw0rd";

async function seedActor() {
  const user = await User.create({
    name: "Aisha Rahman",
    email: "aisha@lockshield.ae",
    passwordHash: await hashPassword(ORIGINAL),
    role: "EDITOR",
  });
  currentActor = { id: String(user._id), role: "EDITOR", email: user.email };
  return user;
}

describe("POST /api/users/me/password", () => {
  beforeAll(async () => {
    await startTestDB();
    route = await import("../route");
    ({ User } = await import("@/models/User"));
    ({ hashPassword, verifyPassword } = await import("@/lib/password"));
  });
  afterAll(stopTestDB);
  beforeEach(() => {
    currentActor = null;
    return clearTestDB();
  });

  it("changes the password when the current one is correct", async () => {
    const user = await seedActor();

    const res = await route.POST(req({ currentPassword: ORIGINAL, newPassword: "Br4nd-New-Passw0rd" }));
    expect(res.status).toBe(200);

    const fresh = await User.findById(user._id).select("+passwordHash");
    expect(await verifyPassword("Br4nd-New-Passw0rd", fresh!.passwordHash)).toBe(true);
    expect(await verifyPassword(ORIGINAL, fresh!.passwordHash)).toBe(false);
  });

  it("rejects a wrong current password and leaves the hash untouched", async () => {
    const user = await seedActor();
    const before = (await User.findById(user._id).select("+passwordHash"))!.passwordHash;

    const res = await route.POST(req({ currentPassword: "not-the-password", newPassword: "Br4nd-New-Passw0rd" }));
    expect(res.status).toBe(401);

    const after = (await User.findById(user._id).select("+passwordHash"))!.passwordHash;
    expect(after).toBe(before);
  });

  it("rejects a new password that fails the strength rules", async () => {
    await seedActor();

    const res = await route.POST(req({ currentPassword: ORIGINAL, newPassword: "alllowercaseletters" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/upper, lower case letters and a number/i);
  });

  it("rejects reusing the current password", async () => {
    await seedActor();

    const res = await route.POST(req({ currentPassword: ORIGINAL, newPassword: ORIGINAL }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/different/i);
  });

  it("rejects an unauthenticated caller", async () => {
    currentActor = null;

    const res = await route.POST(req({ currentPassword: ORIGINAL, newPassword: "Br4nd-New-Passw0rd" }));
    expect(res.status).toBe(401);
  });

  it("rate-limits repeated wrong-password attempts", async () => {
    const user = await seedActor();
    // Distinct id so this test does not inherit another test's budget.
    currentActor = { id: String(user._id), role: "EDITOR", email: user.email };

    const { checkRateLimit, RATE_LIMITS } = await import("@/lib/rate-limit");
    for (let n = 0; n < RATE_LIMITS.login.max; n += 1) {
      checkRateLimit(`password-change:${currentActor.id}`, RATE_LIMITS.login.max, RATE_LIMITS.login.windowMs);
    }

    const res = await route.POST(req({ currentPassword: ORIGINAL, newPassword: "Br4nd-New-Passw0rd" }));
    expect(res.status).toBe(429);

    // The budget is spent before any hash comparison, so nothing changed.
    const fresh = await User.findById(user._id).select("+passwordHash");
    expect(await verifyPassword(ORIGINAL, fresh!.passwordHash)).toBe(true);
  });
});
