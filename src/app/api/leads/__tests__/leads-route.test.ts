import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

/**
 * Public lead intake (quote / career forms). Regression cover for:
 *  1. Phone-only quote requests were rejected (email was required) and lost.
 *  2. A filled honeypot returned 400 "bot detected" instead of the intended
 *     silent fake-success drop.
 *  3. The notification email was fire-and-forget; on Vercel the function can
 *     be frozen right after the response, so it must be scheduled via after().
 */

const { notifyNewLead, afterTasks } = vi.hoisted(() => ({
  notifyNewLead: vi.fn(async () => {}),
  afterTasks: [] as Array<() => unknown>,
}));

vi.mock("@/lib/notify", () => ({ notifyNewLead }));
// POST is public; auth is only imported for the staff-only GET (via rbac).
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => null) }));
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (task: () => unknown) => void afterTasks.push(task) };
});

// WHY a fresh IP per request: the route rate-limits 5 submissions / 10 min per
// IP in a module-level map, which would otherwise leak between tests.
let ipCounter = 0;
function post(body: unknown) {
  ipCounter += 1;
  return new NextRequest(new URL("/api/leads", "http://localhost"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${ipCounter}` },
  });
}

type LeadsRoute = typeof import("../route");
let leadsRoute: LeadsRoute;
let Lead: typeof import("@/models/Lead").Lead;

describe("POST /api/leads", () => {
  beforeAll(async () => {
    await startTestDB();
    leadsRoute = await import("../route");
    ({ Lead } = await import("@/models/Lead"));
  });
  afterAll(stopTestDB);
  beforeEach(async () => {
    notifyNewLead.mockClear();
    afterTasks.length = 0;
    await clearTestDB();
  });

  it("saves a phone-only quote request and schedules the email after the response", async () => {
    const res = await leadsRoute.POST(
      post({ source: "contact", name: "Ahmed", phone: "+971 50 123 4567", serviceInterest: "FM-200 / Clean Agent System" })
    );

    expect(res.status).toBe(201);
    const saved = await Lead.find().lean();
    expect(saved).toHaveLength(1);
    expect(saved[0]!.email).toBeUndefined();
    expect(saved[0]!.serviceInterest).toBe("FM-200 / Clean Agent System");

    expect(notifyNewLead).not.toHaveBeenCalled();
    expect(afterTasks).toHaveLength(1);
    await afterTasks[0]!();
    expect(notifyNewLead).toHaveBeenCalledTimes(1);
  });

  it("drops a honeypot submission silently with a fake success", async () => {
    const res = await leadsRoute.POST(
      post({ source: "contact", name: "Bot", phone: "123", email: "bot@spam.io", honeypot: "Acme Ltd" })
    );

    expect(res.status).toBe(201);
    expect(await Lead.countDocuments()).toBe(0);
    expect(afterTasks).toHaveLength(0);
  });

  it("rejects a lead with no phone and no email", async () => {
    const res = await leadsRoute.POST(post({ source: "contact", name: "Nobody" }));
    expect(res.status).toBe(400);
    expect(await Lead.countDocuments()).toBe(0);
  });
});
