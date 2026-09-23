import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { startTestDB, stopTestDB, clearTestDB } from "@/tests/mongo-test-helper";

type JobsModule = typeof import("../jobs");
let getOpenJobs: JobsModule["getOpenJobs"];
let Job: typeof import("@/models/Job").Job;

const DAY = 24 * 60 * 60 * 1000;
const description = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Role details" }] }] };

async function createJob(title: string, extra: Record<string, unknown> = {}) {
  await Job.create({
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    department: "Engineering",
    description,
    translationGroupId: title,
    status: "published",
    ...extra,
  });
}

describe("getOpenJobs", () => {
  beforeAll(async () => {
    await startTestDB();
    ({ getOpenJobs } = await import("../jobs"));
    ({ Job } = await import("@/models/Job"));
  });
  afterAll(stopTestDB);
  beforeEach(clearTestDB);

  it("lists only published jobs that have not closed, newest first", async () => {
    const now = new Date();
    await createJob("No Deadline");
    await createJob("Closes Later", { closesAt: new Date(now.getTime() + 7 * DAY) });
    await createJob("Already Closed", { closesAt: new Date(now.getTime() - DAY) });
    await createJob("Still Draft", { status: "draft" });

    const jobs = await getOpenJobs(now);

    expect(jobs.map((j) => j.title)).toEqual(["Closes Later", "No Deadline"]);
  });

  it("returns plain serialisable objects safe to pass to a client component", async () => {
    await createJob("Technician");

    const [job] = await getOpenJobs(new Date());

    expect(typeof job!._id).toBe("string");
    expect(job!.description).toEqual(description);
    expect(Object.getPrototypeOf(job)).toBe(Object.prototype);
  });

  it("returns an empty list when nothing is open (no placeholder jobs)", async () => {
    expect(await getOpenJobs(new Date())).toEqual([]);
  });
});
